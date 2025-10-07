/**
 * VS Code Profile Launcher - Main Application
 * Refactored to use component-based architecture
 */

// Import components
import { ProfileCard } from './components/ProfileCard.js';
import { ProfileModal } from './components/ProfileModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { GitHubModal } from './components/GitHubModal.js';
import { GitHubIntegration } from './components/GitHubIntegration.js';
import { MonacoEditor } from './components/MonacoEditor.js';
import { showLoading, hideLoading, showSuccess, showError } from './utils/dom.js';
import keyboardManager from './utils/keyboard.js';

// Application state
let profiles = [];
let aiProviders = [];
let appConfig = {};

// Component instances
let profileModal = null;
let settingsModal = null;
let githubModal = null;
let githubIntegration = null;
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
    setupKeyboardShortcuts();
});

/**
 * Initialize component instances
 */
async function initializeComponents() {
    profileModal = new ProfileModal();
    settingsModal = new SettingsModal();
    githubModal = new GitHubModal();
    githubIntegration = new GitHubIntegration();
    monacoEditor = new MonacoEditor();

    // Initialize Monaco Editor library
    await MonacoEditor.initialize();

    // Initialize GitHub integration
    await githubIntegration.initialize();
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
        onGitHubClick: openGitHubWindow,
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

    document.getElementById('keyboardShortcutsBtn')?.addEventListener('click', () => {
        showKeyboardShortcutsHelp();
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

    // GitHub token validation button
    document.getElementById('validateGitHubTokenBtn')?.addEventListener('click', async () => {
        const token = document.getElementById('githubToken').value.trim();
        if (token) {
            await githubIntegration.validateToken(token);
        } else {
            const statusDiv = document.getElementById('githubStatus');
            if (statusDiv) {
                statusDiv.innerHTML =
                    '<span style="color: #e74c3c;">✗ Please enter a token first</span>';
            }
        }
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
    console.log('📝 Form submit event triggered');

    // Validate form using custom validation
    const isValid = profileModal.validateForm();
    console.log('🔍 Form validation result:', isValid);
    
    if (!isValid) {
        console.log('❌ Form validation failed - preventing submission');
        showError('Please fix the validation errors before saving');
        return;
    }

    try {
        showLoading();
        console.log('🚀 Starting profile submit...');
        const formData = new FormData(e.target);

        // Get and validate required fields
        const name = formData.get('name')?.trim();
        const language = formData.get('language')?.trim();

        console.log('📝 Form data collected:', { name, language });

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
            if (!currentProfile || !currentProfile.id) {
                throw new Error('No profile selected for editing');
            }
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
 * Open GitHub integration window for profile
 */
async function openGitHubWindow(profile) {
    if (!profile.githubRepo || !profile.githubRepo.owner || !profile.githubRepo.repo) {
        showError('GitHub repository not configured for this profile');
        return;
    }

    try {
        await window.electronAPI.openGitHubWindow(profile.id);
    } catch (error) {
        console.error('Error opening GitHub window:', error);
        showError('Failed to open GitHub integration window');
    }
}

/**
 * Launch VS Code with profile
 */
async function launchVSCode(profile) {
    try {
        showLoading();
        await window.electronAPI.launchVSCode(profile);

        // Reload profiles to get updated lastUsed timestamp
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
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    // Initialize keyboard manager
    keyboardManager.initialize();

    // Ctrl+N - Create new profile
    keyboardManager.register(
        'ctrl+n',
        () => {
            profileModal.showCreate();
        },
        'Create new profile'
    );

    // Ctrl+E - Edit selected profile (currently not implemented - would need profile selection)
    // For now, we'll show a message
    keyboardManager.register(
        'ctrl+e',
        () => {
            if (currentContextProfile) {
                handleEditProfile();
            } else {
                showError('Please select a profile first (right-click on a profile card)');
            }
        },
        'Edit selected profile'
    );

    // Ctrl+, - Open settings
    keyboardManager.register(
        'ctrl+,',
        async () => {
            await settingsModal.show();
        },
        'Open settings'
    );

    // Ctrl+S - Save in modals (when applicable)
    keyboardManager.register(
        'ctrl+s',
        e => {
            // Check if profile modal is open
            if (profileModal.modal?.style.display === 'flex') {
                document.getElementById('profileForm')?.dispatchEvent(new Event('submit'));
            }
            // Check if settings modal is open
            else if (settingsModal.modal?.style.display === 'flex') {
                document.getElementById('saveSettingsBtn')?.click();
            }
        },
        'Save current modal'
    );

    // Escape - Close modals
    keyboardManager.register(
        'escape',
        () => {
            profileModal.hide();
            settingsModal.hide();
            githubModal.hide();
            hideContextMenu();
        },
        'Close modals and menus'
    );

    // Ctrl+F - Focus search
    keyboardManager.register(
        'ctrl+f',
        () => {
            searchInput?.focus();
        },
        'Focus search'
    );

    // Ctrl+R - Reload profiles
    keyboardManager.register(
        'ctrl+r',
        async () => {
            await loadInitialData();
            showSuccess('Profiles reloaded');
        },
        'Reload profiles'
    );

    // F1 - Show keyboard shortcuts help
    keyboardManager.register(
        'f1',
        () => {
            showKeyboardShortcutsHelp();
        },
        'Show keyboard shortcuts'
    );
}

/**
 * Show keyboard shortcuts help dialog
 */
function showKeyboardShortcutsHelp() {
    const shortcuts = keyboardManager.getShortcuts();
    const shortcutsHtml = shortcuts
        .map(
            s => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
            <span style="color: var(--text-secondary);">${s.description}</span>
            <kbd style="background: var(--bg-tertiary); padding: 4px 8px; border-radius: 4px; font-family: monospace;">${s.key.replace(/ctrl/g, 'Ctrl').replace(/alt/g, 'Alt').replace(/shift/g, 'Shift').replace(/\+/g, ' + ')}</kbd>
        </div>
    `
        )
        .join('');

    const helpHtml = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: var(--bg-secondary); padding: 24px; border-radius: 8px; 
                    border: 1px solid var(--border-color); max-width: 500px; width: 90%; 
                    max-height: 80vh; overflow-y: auto; z-index: 10000; box-shadow: var(--shadow);">
            <h3 style="margin-top: 0; margin-bottom: 16px; color: var(--text-primary);">⌨️ Keyboard Shortcuts</h3>
            <div>
                ${shortcutsHtml}
            </div>
            <button onclick="this.parentElement.remove()" 
                    style="margin-top: 16px; width: 100%; padding: 8px; background: var(--accent-color); 
                           color: white; border: none; border-radius: 4px; cursor: pointer;">
                Close (Esc)
            </button>
        </div>
        <div onclick="this.previousElementSibling.remove(); this.remove();" 
             style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                    background: rgba(0, 0, 0, 0.5); z-index: 9999;"></div>
    `;

    const container = document.createElement('div');
    container.innerHTML = helpHtml;
    document.body.appendChild(container);
}

/**
 * Export components to global scope for debugging and HTML event handlers
 */
window.app = {
    profileModal,
    settingsModal,
    githubModal,
    githubIntegration,
    monacoEditor,
    keyboardManager,
    profiles,
    reload: async () => {
        profiles = await window.electronAPI.getProfiles();
        renderProfiles();
    },
    showShortcuts: showKeyboardShortcutsHelp,
};
