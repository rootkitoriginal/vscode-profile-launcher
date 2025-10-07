/**
 * VS Code Profile Launcher - Main Application
 * Refactored to use component-based architecture
 */

// Import components
import { ProfileCard } from './components/ProfileCard.js';
import { ProfileModal } from './components/ProfileModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { GitHubModal } from './components/GitHubModal.js';
import { MonacoEditor } from './components/MonacoEditor.js';
import { showLoading, hideLoading, showSuccess, showError } from './utils/dom.js';
import { escapeHtml, formatDate } from './utils/formatters.js';

// Application state
let profiles = [];
let aiProviders = [];
let appConfig = {};

// Component instances
let profileModal = null;
let settingsModal = null;
let githubModal = null;
let monacoEditor = null;

// DOM elements
const profilesGrid = document.getElementById('profilesGrid');
const searchInput = document.getElementById('searchInput');
const languageFilter = document.getElementById('languageFilter');
const contextMenu = document.getElementById('contextMenu');
let currentContextProfile = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await initializeComponents();
    await loadInitialData();
    setupEventListeners();
});

/**
 * Initialize component instances
 */
async function initializeComponents() {
    profileModal = new ProfileModal();
    settingsModal = new SettingsModal();
    githubModal = new GitHubModal();
    monacoEditor = new MonacoEditor();

    // Initialize Monaco Editor library
    await MonacoEditor.initialize();
}

/**
 * Load initial application data
 */
async function loadInitialData() {
    try {
        showLoading();

        // Load profiles, AI providers, and config in parallel
        const [profilesData, providersData, configData] = await Promise.all([
            window.electronAPI.getProfiles(),
            window.electronAPI.getAIProviders(),
            window.electronAPI.getConfig(),
        ]);

        profiles = profilesData;
        aiProviders = providersData;
        appConfig = configData;

        // Set component data
        profileModal.setAIProviders(aiProviders);
        settingsModal.setAppConfig(appConfig);

        renderProfiles();
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showError('Failed to load application data');
    } finally {
        hideLoading();
    }
}

/**
 * Render profiles grid
 */
function renderProfiles(profilesToRender = profiles) {
    ProfileCard.renderGrid(profilesGrid, profilesToRender, {
        onLaunch: launchVSCode,
        onContextMenu: showContextMenu,
        onMenuClick: showContextMenu,
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Header buttons
    document.getElementById('createProfileBtn').addEventListener('click', () => {
        profileModal.showCreate();
    });

    document.getElementById('settingsBtn').addEventListener('click', async () => {
        await settingsModal.show();
    });

    // Profile modal controls
    document.getElementById('closeModal').addEventListener('click', () => {
        profileModal.hide();
    });
    document.getElementById('cancelBtn').addEventListener('click', () => {
        profileModal.hide();
    });
    document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);

    // Settings modal controls
    document.getElementById('closeSettingsModal').addEventListener('click', () => {
        settingsModal.hide();
    });
    document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
        settingsModal.hide();
    });
    document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
        await settingsModal.save();
        // Reload AI providers after settings change
        aiProviders = await window.electronAPI.getAIProviders();
        profileModal.setAIProviders(aiProviders);
    });

    // Settings tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            settingsModal.switchTab(e.target.dataset.tab);
        });
    });

    // Search and filter
    if (searchInput) {
        searchInput.addEventListener('input', filterProfiles);
    }
    if (languageFilter) {
        languageFilter.addEventListener('change', filterProfiles);
    }

    // Context menu
    document.getElementById('editProfile').addEventListener('click', handleEditProfile);
    document.getElementById('deleteProfile').addEventListener('click', handleDeleteProfile);

    // AI provider change
    document.getElementById('aiProvider')?.addEventListener('change', e => {
        profileModal.updateAIModels(e.target.value);
    });

    // Generate description button
    document.getElementById('generateDescriptionBtn')?.addEventListener('click', () => {
        profileModal.generateDescription();
    });

    // Directory picker
    document.getElementById('selectWorkspacePath')?.addEventListener('click', selectWorkspacePath);

    // GitHub repository selection
    document.getElementById('githubOwner')?.addEventListener('blur', handleGitHubOwnerChange);
    document.getElementById('githubRepo')?.addEventListener('change', handleGitHubRepoChange);

    // Environment variable add button
    document.getElementById('addEnvVarBtn')?.addEventListener('click', () => {
        profileModal.addEnvVariable();
    });

    // Close menus when clicking outside
    document.addEventListener('click', e => {
        if (contextMenu && !contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });

    // Close modals when clicking outside
    const profileModalElement = document.getElementById('profileModal');
    const settingsModalElement = document.getElementById('settingsModal');

    profileModalElement?.addEventListener('click', e => {
        if (e.target === profileModalElement) {
            profileModal.hide();
        }
    });

    settingsModalElement?.addEventListener('click', e => {
        if (e.target === settingsModalElement) {
            settingsModal.hide();
        }
    });

    // Escape key handling
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            profileModal.hide();
            settingsModal.hide();
            githubModal.hide();
            hideContextMenu();
        }
    });
}

/**
 * Filter profiles based on search and language
 */
function filterProfiles() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedLanguage = languageFilter.value;

    let filtered = profiles;

    if (searchTerm) {
        filtered = filtered.filter(
            profile =>
                profile.name.toLowerCase().includes(searchTerm) ||
                (profile.description && profile.description.toLowerCase().includes(searchTerm))
        );
    }

    if (selectedLanguage) {
        filtered = filtered.filter(profile => profile.language === selectedLanguage);
    }

    renderProfiles(filtered);
}

/**
 * Context menu functions
 */
function showContextMenu(e, profile) {
    e.preventDefault();
    e.stopPropagation();

    currentContextProfile = profile;

    if (contextMenu) {
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
    }
}

function hideContextMenu() {
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
    currentContextProfile = null;
}

function handleEditProfile() {
    if (currentContextProfile) {
        profileModal.showEdit(
            currentContextProfile,
            handleGitHubOwnerChange,
            handleGitHubRepoChange
        );
        hideContextMenu();
    }
}

async function handleDeleteProfile() {
    if (!currentContextProfile) return;

    if (confirm(`Are you sure you want to delete the profile "${currentContextProfile.name}"?`)) {
        try {
            showLoading();
            await window.electronAPI.deleteProfile(currentContextProfile.id);

            // Reload profiles
            profiles = await window.electronAPI.getProfiles();
            renderProfiles();

            showSuccess('Profile deleted successfully!');
            hideContextMenu();
        } catch (error) {
            console.error('Failed to delete profile:', error);
            showError('Failed to delete profile');
        } finally {
            hideLoading();
        }
    }
}

/**
 * Profile form submission
 */
async function handleProfileSubmit(e) {
    e.preventDefault();

    try {
        showLoading();
        console.log('🚀 Starting profile submit...');
        const formData = new FormData(e.target);

        // Get and validate required fields
        const name = formData.get('name')?.trim();
        const language = formData.get('language')?.trim();

        console.log('📝 Form data:', { name, language });

        // Validate required fields
        if (!name || name === '') {
            throw new Error('Profile name is required');
        }
        if (!language || language === '') {
            throw new Error('Profile language is required');
        }

        const profileData = {
            name: name,
            language: language,
            description: formData.get('description')?.trim() || null,
            workspacePath: formData.get('workspacePath')?.trim() || null,
            aiProvider: formData.get('aiProvider')?.trim() || null,
            aiModel: formData.get('aiModel')?.trim() || null,
            envVariables: profileModal.getEnvVariablesFromForm(),
            githubRepo: {
                owner: formData.get('githubOwner')?.trim() || null,
                repo: formData.get('githubRepo')?.trim() || null,
                branch: formData.get('githubBranch')?.trim() || null,
            },
        };

        console.log('💾 Profile data to save:', profileData);

        if (profileModal.inEditMode()) {
            const currentProfile = profileModal.getCurrentProfile();
            console.log('✏️ Updating profile:', currentProfile.id);
            await window.electronAPI.updateProfile(currentProfile.id, profileData);
            showSuccess('Profile updated successfully!');
        } else {
            console.log('➕ Creating new profile');
            const result = await window.electronAPI.createProfile(profileData);
            console.log('✅ Profile created:', result);
            showSuccess('Profile created successfully!');
        }

        // Reload profiles
        console.log('🔄 Reloading profiles...');
        profiles = await window.electronAPI.getProfiles();
        console.log('📦 Loaded profiles:', profiles.length);
        renderProfiles();

        profileModal.hide();
    } catch (error) {
        console.error('❌ Failed to save profile:', error);
        showError(error.message || 'Failed to save profile');
    } finally {
        hideLoading();
    }
}

/**
 * Launch VS Code with profile
 */
async function launchVSCode(profile) {
    try {
        showLoading();
        await window.electronAPI.launchVSCode(profile);

        // Update last used timestamp
        await window.electronAPI.updateLastUsed(profile.id);

        // Reload profiles
        profiles = await window.electronAPI.getProfiles();
        renderProfiles();

        showSuccess(`Launched VS Code with profile: ${profile.name}`);
    } catch (error) {
        console.error('Failed to launch VS Code:', error);
        showError('Failed to launch VS Code: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Directory picker
 */
async function selectWorkspacePath() {
    try {
        const result = await window.electronAPI.selectDirectory();
        if (result) {
            document.getElementById('workspacePath').value = result;
        }
    } catch (error) {
        console.error('Failed to select directory:', error);
    }
}

/**
 * GitHub repository handlers
 */
async function handleGitHubOwnerChange(e) {
    const owner = e.target.value.trim();
    const repoSelect = document.getElementById('githubRepo');
    const branchSelect = document.getElementById('githubBranch');

    if (!owner || !repoSelect) return;

    try {
        repoSelect.innerHTML = '<option value="">Loading...</option>';
        if (branchSelect) branchSelect.innerHTML = '<option value="">Select branch...</option>';

        const repos = await window.electronAPI.githubListRepositories(owner);

        repoSelect.innerHTML = '<option value="">Select repository...</option>';
        repos.forEach(repo => {
            const option = document.createElement('option');
            option.value = repo.name;
            option.textContent = repo.name;
            repoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load repositories:', error);
        repoSelect.innerHTML = '<option value="">Select repository...</option>';
    }
}

async function handleGitHubRepoChange(e) {
    const owner = document.getElementById('githubOwner')?.value.trim();
    const repo = e.target.value;
    const branchSelect = document.getElementById('githubBranch');

    if (!owner || !repo || !branchSelect) return;

    try {
        branchSelect.innerHTML = '<option value="">Loading...</option>';

        const branches = await window.electronAPI.githubListBranches(owner, repo);

        branchSelect.innerHTML = '<option value="">Select branch...</option>';
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch;
            option.textContent = branch;
            branchSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load branches:', error);
        branchSelect.innerHTML = '<option value="">Select branch...</option>';
    }
}

/**
 * Export components to global scope for debugging and HTML event handlers
 */
window.app = {
    profileModal,
    settingsModal,
    githubModal,
    monacoEditor,
    profiles,
    reload: async () => {
        profiles = await window.electronAPI.getProfiles();
        renderProfiles();
    },
};
