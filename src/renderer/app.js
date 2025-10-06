// Application state
let profiles = [];
let currentProfile = null;
let isEditMode = false;
let monacoEditor = null;
let aiProviders = [];
let appConfig = {};

// DOM elements
const profilesGrid = document.getElementById('profilesGrid');
const emptyState = document.getElementById('emptyState');
const profileModal = document.getElementById('profileModal');
const profileForm = document.getElementById('profileForm');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const languageFilter = document.getElementById('languageFilter');
const contextMenu = document.getElementById('contextMenu');
const loadingOverlay = document.getElementById('loadingOverlay');
const settingsModal = document.getElementById('settingsModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialData();
    await initializeMonacoEditor();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Header buttons
    document.getElementById('createProfileBtn').addEventListener('click', showCreateProfileModal);
    document.getElementById('settingsBtn').addEventListener('click', showSettingsModal);
    
    // Profile modal controls
    document.getElementById('closeModal').addEventListener('click', hideProfileModal);
    document.getElementById('cancelBtn').addEventListener('click', hideProfileModal);
    profileForm.addEventListener('submit', handleProfileSubmit);
    
    // Settings modal controls
    document.getElementById('closeSettingsModal').addEventListener('click', hideSettingsModal);
    document.getElementById('cancelSettingsBtn').addEventListener('click', hideSettingsModal);
    document.getElementById('saveSettingsBtn').addEventListener('click', handleSettingsSave);
    
    // Settings tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Search and filter
    searchInput.addEventListener('input', filterProfiles);
    languageFilter.addEventListener('change', filterProfiles);
    
    // Context menu
    document.getElementById('editProfile').addEventListener('click', handleEditProfile);
    document.getElementById('deleteProfile').addEventListener('click', handleDeleteProfile);
    
    // Settings tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // AI provider change
    document.getElementById('aiProvider').addEventListener('change', handleAIProviderChange);
    // Language change - commented out as Monaco editor is not used
    /*
    document.getElementById('profileLanguage').addEventListener('change', handleLanguageChange);
    */
    
    // Template controls - commented out for now
    // document.getElementById('generateTemplateBtn').addEventListener('click', generateCodeTemplate);
    // document.getElementById('resetTemplateBtn').addEventListener('click', resetCodeTemplate);
    
    // Directory picker
    document.getElementById('selectWorkspacePath').addEventListener('click', selectWorkspacePath);
    
    // GitHub repository selection
    document.getElementById('githubOwner').addEventListener('blur', handleGitHubOwnerChange);
    document.getElementById('githubRepo').addEventListener('change', handleGitHubRepoChange);
    
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
    
    // Close modals when clicking outside
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            hideProfileModal();
        }
    });
    
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            hideSettingsModal();
        }
    });
    
    // Escape key handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideProfileModal();
            hideSettingsModal();
            hideContextMenu();
        }
    });
}

// Load initial data
async function loadInitialData() {
    try {
        showLoading();
        
        // Load profiles, AI providers, and config in parallel
        const [profilesData, providersData, configData] = await Promise.all([
            window.electronAPI.getProfiles(),
            window.electronAPI.getAIProviders(),
            window.electronAPI.getConfig()
        ]);
        
        profiles = profilesData;
        aiProviders = providersData;
        appConfig = configData;
        
        renderProfiles();
        await updateProviderStatus();
        
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showError('Failed to load application data');
    } finally {
        hideLoading();
    }
}

// Initialize Monaco Editor
async function initializeMonacoEditor() {
    return new Promise((resolve) => {
        require.config({ 
            paths: { 
                'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' 
            }
        });
        
        require(['vs/editor/editor.main'], () => {
            // Monaco is now loaded and ready to use
            resolve();
        });
    });
}

// Render profiles grid
function renderProfiles(profilesToRender = profiles) {
    profilesGrid.innerHTML = '';
    
    if (profilesToRender.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    profilesToRender.forEach(profile => {
        const profileCard = createProfileCard(profile);
        profilesGrid.appendChild(profileCard);
    });
}

// Create profile card element
function createProfileCard(profile) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.dataset.profileId = profile.id;
    
    const lastUsed = profile.lastUsed 
        ? `Last used: ${formatDate(profile.lastUsed)}`
        : `Created: ${formatDate(profile.createdAt)}`;
    
    const aiInfo = profile.aiProvider ? `<span class="ai-badge">${profile.aiProvider.toUpperCase()}</span>` : '';
    
    card.innerHTML = `
        <div class="profile-header">
            <h3 class="profile-name">${escapeHtml(profile.name)}${aiInfo}</h3>
            <button class="profile-menu" data-profile-id="${profile.id}">⋮</button>
        </div>
        <div class="profile-language">${escapeHtml(profile.language)}</div>
        ${profile.description ? `<div class="profile-description">${escapeHtml(profile.description)}</div>` : ''}
        ${profile.workspacePath ? `<div class="profile-path">${escapeHtml(profile.workspacePath)}</div>` : ''}
        <div class="profile-footer">
            <span>${lastUsed}</span>
        </div>
    `;
    
    // Double-click to launch VS Code
    card.addEventListener('dblclick', () => launchVSCode(profile));
    
    // Right-click for context menu
    card.addEventListener('contextmenu', (e) => showContextMenu(e, profile));
    
    // Menu button click
    const menuBtn = card.querySelector('.profile-menu');
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        show
    return card;
}

// Create Monaco Editor instance
function createMonacoEditor(language = 'typescript', value = '') {
    const editorContainer = document.getElementById('codeEditor');
    
    if (monacoEditor) {
        monacoEditor.dispose();
    }
    
    monacoEditor = monaco.editor.create(editorContainer, {
        value: value,
        language: getMonacoLanguage(language),
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineHeight: 20,
        wordWrap: 'on'
    });
    
    // Update hidden textarea when editor content changes
    monacoEditor.onDidChangeModelContent(() => {
        document.getElementById('codeTemplate').value = monacoEditor.getValue();
    });
    
    return monacoEditor;
}

// Get Monaco language identifier
function getMonacoLanguage(language) {
    const languageMap = {
        'TypeScript': 'typescript',
        'JavaScript': 'javascript',
        'Python': 'python',
        'Go': 'go',
        'Rust': 'rust',
        'C#': 'csharp',
        'Java': 'java',
        'C++': 'cpp',
        'PHP': 'php',
        'Ruby': 'ruby'
    };
    
    return languageMap[language] || 'plaintext';
}

// Show settings modal
function showSettingsModal() {
    settingsModal.style.display = 'flex';
    loadSettingsData();
}

// Hide settings modal
function hideSettingsModal() {
    settingsModal.style.display = 'none';
}

// Switch settings tab
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Load settings data
async function loadSettingsData() {
    try {
        // Load current API keys
        const apiKeys = await window.electronAPI.getApiKeys();
        
        // Set the API key fields (show masked values if keys exist)
        if (apiKeys.geminiApiKey) {
            document.getElementById('geminiApiKey').value = apiKeys.geminiApiKey;
        }
        if (apiKeys.openaiApiKey) {
            document.getElementById('openaiApiKey').value = apiKeys.openaiApiKey;
        }
        
        // Load GitHub token
        const githubToken = await window.electronAPI.getGitHubToken();
        if (githubToken) {
            document.getElementById('githubToken').value = githubToken;
        }
        
        document.getElementById('vscodeCommand').value = appConfig.vscodeCommand || 'code';
        
        // Update provider status
        await updateProviderStatus();
        await updateGitHubStatus();
        
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// Update provider status display
async function updateProviderStatus() {
    try {
        const providers = await window.electronAPI.getAvailableProviders();
        const statusContainer = document.getElementById('providerStatus');
        
        statusContainer.innerHTML = providers.map(provider => `
            <div class="provider-item">
                <span class="provider-name">${provider.name === 'gemini' ? 'Google Gemini' : 'OpenAI'}</span>
                <span class="${provider.configured ? 'provider-configured' : 'provider-not-configured'}">
                    ${provider.configured ? '✓ Configured' : '✗ Not configured'}
                </span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to update provider status:', error);
    }
}

// Update GitHub status display
async function updateGitHubStatus() {
    try {
        const isConfigured = await window.electronAPI.isGitHubConfigured();
        const statusContainer = document.getElementById('githubStatus');
        
        if (isConfigured) {
            statusContainer.innerHTML = '<div class="github-status configured">✓ GitHub token configured and ready</div>';
        } else {
            statusContainer.innerHTML = '<div class="github-status not-configured">✗ GitHub token not configured</div>';
        }
        
    } catch (error) {
        console.error('Failed to update GitHub status:', error);
    }
}

// Handle settings save
async function handleSettingsSave() {
    try {
        showLoading();
        
        const geminiKey = document.getElementById('geminiApiKey').value.trim();
        const openaiKey = document.getElementById('openaiApiKey').value.trim();
        const githubToken = document.getElementById('githubToken').value.trim();
        
        // Update API keys if provided
        if (geminiKey) {
            await window.electronAPI.updateApiKey('gemini', geminiKey);
        }
        
        if (openaiKey) {
            await window.electronAPI.updateApiKey('openai', openaiKey);
        }
        
        if (githubToken) {
            await window.electronAPI.updateGitHubToken(githubToken);
        }
        
        // Clear the input fields for security
        document.getElementById('geminiApiKey').value = '';
        document.getElementById('openaiApiKey').value = '';
        document.getElementById('githubToken').value = '';
        
        await updateProviderStatus();
        await updateGitHubStatus();
        hideSettingsModal();
        
        showSuccess('Settings saved successfully!');
        
    } catch (error) {
        console.error('Failed to save settings:', error);
        showError('Failed to save settings');
    } finally {
        hideLoading();
    }
}

// Show create profile modal
function showCreateProfileModal() {
    isEditMode = false;
    currentProfile = null;
    modalTitle.textContent = 'Create New Profile';
    profileForm.reset();
    document.getElementById('saveBtn').textContent = 'Save Profile';
    
    // Clear environment variables
    clearEnvVariables();
    
    // Clear GitHub selections
    clearGitHubRepoOptions();
    clearGitHubBranchOptions();
    
    // Note: Monaco editor is commented out for now
    
    // Populate AI providers
    populateAIProviders();
    
    profileModal.style.display = 'flex';
    document.getElementById('profileName').focus();
}

// Show edit profile modal
function showEditProfileModal(profile) {
    isEditMode = true;
    currentProfile = profile;
    modalTitle.textContent = 'Edit Profile';
    
    // Populate form with existing data
    document.getElementById('profileName').value = profile.name;
    document.getElementById('profileLanguage').value = profile.language;
    document.getElementById('profileDescription').value = profile.description || '';
    document.getElementById('workspacePath').value = profile.workspacePath || '';
    document.getElementById('aiProvider').value = profile.aiProvider || '';
    document.getElementById('aiModel').value = profile.aiModel || '';
    
    // Populate GitHub data
    document.getElementById('githubOwner').value = profile.githubRepo?.owner || '';
    
    // Trigger repository loading if owner exists
    if (profile.githubRepo?.owner) {
        handleGitHubOwnerChange({ target: { value: profile.githubRepo.owner } });
        // Wait a bit for repos to load, then set the selected repo
        setTimeout(() => {
            document.getElementById('githubRepo').value = profile.githubRepo?.repo || '';
            if (profile.githubRepo?.repo) {
                handleGitHubRepoChange({ target: document.getElementById('githubRepo') });
            }
        }, 100);
    } else {
        document.getElementById('githubRepo').innerHTML = '<option value="">Select repository...</option>';
        document.getElementById('githubBranch').innerHTML = '<option value="">Select branch...</option>';
    }
    
    // Populate environment variables
    clearEnvVariables();
    if (profile.envVariables) {
        Object.entries(profile.envVariables).forEach(([key, value]) => {
            addEnvVariable(key, value);
        });
    }
    
    // Note: Monaco editor is commented out for now
    
    // Populate AI providers and update models
    populateAIProviders();
    if (profile.aiProvider) {
        updateAIModels(profile.aiProvider);
    }
    
    document.getElementById('saveBtn').textContent = 'Update Profile';
    profileModal.style.display = 'flex';
    document.getElementById('profileName').focus();
}

// Populate AI providers dropdown
function populateAIProviders() {
    const aiProviderSelect = document.getElementById('aiProvider');
    
    // Clear existing options except the first one
    while (aiProviderSelect.children.length > 1) {
        aiProviderSelect.removeChild(aiProviderSelect.lastChild);
    }
    
    aiProviders.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider.name;
        option.textContent = provider.displayName;
        aiProviderSelect.appendChild(option);
    });
}

// Handle AI provider change
function handleAIProviderChange(e) {
    const provider = e.target.value;
    updateAIModels(provider);
}

// Update AI models dropdown
function updateAIModels(providerName) {
    const aiModelSelect = document.getElementById('aiModel');
    
    // Clear existing options
    aiModelSelect.innerHTML = '<option value="">Select model...</option>';
    
    if (!providerName) return;
    
    const provider = aiProviders.find(p => p.name === providerName);
    if (provider) {
        provider.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name}${model.description ? ` - ${model.description}` : ''}`;
            aiModelSelect.appendChild(option);
        });
    }
}

// Handle language change
/*
function handleLanguageChange(e) {
    const language = e.target.value;
    if (monacoEditor && language) {
        const currentValue = monacoEditor.getValue();
        // Only update if editor is empty or has default template
        if (!currentValue.trim() || currentValue === getDefaultTemplate(getCurrentLanguage())) {
            const template = getDefaultTemplate(language);
            monacoEditor.setValue(template);
            monacoEditor.setPosition({ lineNumber: 1, column: 1 });
        }
        
        // Update language mode
        const model = monacoEditor.getModel();
        monaco.editor.setModelLanguage(model, getMonacoLanguage(language));
    }
}
*/

// Get current language from form
function getCurrentLanguage() {
    return document.getElementById('profileLanguage').value;
}

// Add environment variable row
function addEnvVariable(key = '', value = '') {
    const container = document.getElementById('envVariables');
    const addButton = container.querySelector('.env-var-row');
    
    const row = document.createElement('div');
    row.className = 'env-var-row';
    row.innerHTML = `
        <input type="text" class="form-input env-var-input" placeholder="Variable name" value="${escapeHtml(key)}">
        <input type="text" class="form-input env-var-input" placeholder="Variable value" value="${escapeHtml(value)}">
        <button type="button" class="env-var-remove" onclick="removeEnvVariable(this)">×</button>
    `;
    
    container.insertBefore(row, addButton);
}

// Remove environment variable row
function removeEnvVariable(button) {
    const row = button.parentElement;
    row.remove();
}

// Clear environment variables
function clearEnvVariables() {
    const container = document.getElementById('envVariables');
    const rows = container.querySelectorAll('.env-var-row');
    
    // Keep only the add button row
    rows.forEach((row, index) => {
        if (index < rows.length - 1) {
            row.remove();
        }
    });
}

// Get environment variables from form
function getEnvVariablesFromForm() {
    const container = document.getElementById('envVariables');
    const rows = container.querySelectorAll('.env-var-row');
    const envVars = {};
    
    rows.forEach((row, index) => {
        // Skip the last row (add button)
        if (index < rows.length - 1) {
            const inputs = row.querySelectorAll('input');
            const key = inputs[0].value.trim();
            const value = inputs[1].value.trim();
            
            if (key) {
                envVars[key] = value;
            }
        }
    });
    
    return envVars;
}

// Get default template for language
function getDefaultTemplate(language) {
    const templates = {
        'TypeScript': `// TypeScript Project Template
export class HelloWorld {
    private message: string;

    constructor(message: string = "Hello, TypeScript!") {
        this.message = message;
    }

    public greet(): void {
        console.log(this.message);
    }
}

const app = new HelloWorld();
app.greet();
`,
        'JavaScript': `// JavaScript Project Template
class HelloWorld {
    constructor(message = "Hello, JavaScript!") {
        this.message = message;
    }

    greet() {
        console.log(this.message);
    }
}

const app = new HelloWorld();
app.greet();
`,
        'Python': `#!/usr/bin/env python3
# Python Project Template

class HelloWorld:
    def __init__(self, message="Hello, Python!"):
        self.message = message
    
    def greet(self):
        print(self.message)

if __name__ == "__main__":
    app = HelloWorld()
    app.greet()
`,
        'Go': `// Go Project Template
package main

import "fmt"

type HelloWorld struct {
    message string
}

func NewHelloWorld(message string) *HelloWorld {
    if message == "" {
        message = "Hello, Go!"
    }
    return &HelloWorld{message: message}
}

func (hw *HelloWorld) Greet() {
    fmt.Println(hw.message)
}

func main() {
    app := NewHelloWorld("")
    app.Greet()
}
`,
        'Rust': `// Rust Project Template
struct HelloWorld {
    message: String,
}

impl HelloWorld {
    fn new(message: Option<String>) -> Self {
        let message = message.unwrap_or_else(|| "Hello, Rust!".to_string());
        HelloWorld { message }
    }

    fn greet(&self) {
        println!("{}", self.message);
    }
}

fn main() {
    let app = HelloWorld::new(None);
    app.greet();
}
`
    };
    
    return templates[language] || `// ${language} Project Template\n\nconsole.log("Hello, ${language}!");`;
}

// Generate code template with AI - commented out for now
/*
async function generateCodeTemplate() {
    const profileName = document.getElementById('profileName').value.trim();
    const language = document.getElementById('profileLanguage').value;
    const description = document.getElementById('profileDescription').value.trim();
    const aiProvider = document.getElementById('aiProvider').value;
    const aiModel = document.getElementById('aiModel').value;
    
    if (!profileName || !language) {
        showError('Please enter a profile name and select a language first');
        return;
    }
    
    if (!aiProvider) {
        showError('Please select an AI provider first');
        return;
    }
    
    try {
        showLoading();
        
        const response = await window.electronAPI.generateCodeTemplate(
            language, 
            profileName, 
            description, 
            aiProvider, 
            aiModel
        );
        
        if (response.success) {
            if (monacoEditor) {
                monacoEditor.setValue(response.content);
                monacoEditor.setPosition({ lineNumber: 1, column: 1 });
            }
            showSuccess('Code template generated successfully!');
        } else {
            showError(`Failed to generate template: ${response.error || 'Unknown error'}`);
        }
        
    } catch (error) {
        console.error('Failed to generate code template:', error);
        showError('Failed to generate code template');
    } finally {
        hideLoading();
    }
}

// Reset code template to default
function resetCodeTemplate() {
    const language = document.getElementById('profileLanguage').value;
    
    if (!language) {
        showError('Please select a language first');
        return;
    }
    
    const template = getDefaultTemplate(language);
    if (monacoEditor) {
        monacoEditor.setValue(template);
        monacoEditor.setPosition({ lineNumber: 1, column: 1 });
    }
}
*/

// Hide profile modal
function hideProfileModal() {
    profileModal.style.display = 'none';
    profileForm.reset();
    clearEnvVariables();
    
    if (monacoEditor) {
        monacoEditor.dispose();
        monacoEditor = null;
    }
    
    currentProfile = null;
    isEditMode = false;
}

// Handle profile form submission
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(profileForm);
    const envVariables = getEnvVariablesFromForm();
    // Note: Monaco editor is commented out, so codeTemplate is always empty
    const codeTemplate = '';
    
    // GitHub repository data
    const githubOwner = formData.get('githubOwner')?.trim();
    const githubRepo = formData.get('githubRepo')?.trim();
    const githubBranch = formData.get('githubBranch')?.trim();
    
    let githubRepoData = undefined;
    if (githubOwner && githubRepo) {
        githubRepoData = {
            owner: githubOwner,
            repo: githubRepo,
            branch: githubBranch || 'main'
        };
    }

    const profileData = {
        name: formData.get('name').trim(),
        language: formData.get('language'),
        description: formData.get('description').trim(),
        workspacePath: formData.get('workspacePath').trim(),
        aiProvider: formData.get('aiProvider') || undefined,
        aiModel: formData.get('aiModel') || undefined,
        envVariables: Object.keys(envVariables).length > 0 ? envVariables : undefined,
        codeTemplate: codeTemplate.trim() || undefined,
        githubRepo: githubRepoData
    };
    
    // Validation
    if (!profileData.name || !profileData.language) {
        console.log('Validation failed: name or language missing');
        showError('Profile name and language are required');
        return;
    }
    
    // Validate AI configuration
    if (profileData.aiProvider && !profileData.aiModel) {
        showError('Please select an AI model when choosing an AI provider');
        return;
    }
    
    try {
        showLoading();
        
        if (isEditMode && currentProfile) {
            await window.electronAPI.updateProfile(currentProfile.id, profileData);
            showSuccess('Profile updated successfully!');
        } else {
            await window.electronAPI.createProfile(profileData);
            showSuccess('Profile created successfully!');
        }
        
        hideProfileModal();
        await loadInitialData(); // Reload all data
        
    } catch (error) {
        console.error('Failed to save profile:', error);
        showError(`Failed to save profile: ${error.message || 'Unknown error'}`);
    } finally {
        hideLoading();
    }
}

// Launch VS Code with profile
async function launchVSCode(profile) {
    try {
        // Check if GitHub integration is configured for this profile
        if (profile.githubRepo && profile.githubRepo.owner && profile.githubRepo.repo) {
            // Check if GitHub token is configured
            const isGitHubConfigured = await window.electronAPI.isGitHubConfigured();
            
            if (isGitHubConfigured) {
                // Show GitHub issues modal first
                await showGitHubIssuesModal(profile);
                return; // The modal will handle launching VS Code
            } else {
                showError('GitHub token not configured. Please configure in Settings.');
                return;
            }
        }
        
        // No GitHub integration, launch VS Code directly
        showLoading();
        
        const success = await window.electronAPI.launchVSCode(profile);
        
        if (success) {
            // Update last used timestamp
            await window.electronAPI.updateProfile(profile.id, { 
                lastUsed: new Date().toISOString() 
            });
            await loadProfiles();
        } else {
            showError('Failed to launch VS Code. Make sure VS Code is installed and accessible from command line.');
        }
    } catch (error) {
        console.error('Failed to launch VS Code:', error);
        showError('Failed to launch VS Code');
    } finally {
        hideLoading();
    }
}

// Show context menu
function showContextMenu(e, profile) {
    e.preventDefault();
    currentProfile = profile;
    
    contextMenu.style.display = 'block';
    context
    contextMenu.style.top = `${e.pageY}px`;
    
    // Adjust position if menu goes off screen
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = `${e.pageX - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = `${e.pageY - rect.height}px`;
    }
}

// Hide context menu
function hideContextMenu() {
    contextMenu.style.display = 'none';
    currentProfile = null;
}

// Handle edit profile from context menu
function handleEditProfile() {
    if (currentProfile) {
        showEditProfileModal(currentProfile);
        hideContextMenu();
    }
}

// Handle delete profile from context menu
async function handleDeleteProfile() {
    if (!currentProfile) return;
    
    const confirmed = confirm(`Are you sure you want to delete the profile "${currentProfile.name}"?`);
    if (!confirmed) {
        hideContextMenu();
        return;
    }
    
    try {
        showLoading();
        await window.electronAPI.deleteProfile(currentProfile.id);
        await loadProfiles();
    } catch (error) {
        console.error('Failed to delete profile:', error);
        showError('Failed to delete profile');
    } finally {
        hideLoading();
        hideContextMenu();
    }
}

// Filter profiles based on search and language
function filterProfiles() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedLanguage = languageFilter.value;
    
    let filteredProfiles = profiles;
    
    // Filter by language
    if (selectedLanguage) {
        filteredProfiles = filteredProfiles.filter(profile => 
            profile.language === selectedLanguage
        );
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredProfiles = filteredProfiles.filter(profile =>
            profile.name.toLowerCase().includes(searchTerm) ||
            profile.language.toLowerCase().includes(searchTerm) ||
            (profile.description && profile.description.toLowerCase().includes(searchTerm))
        );
    }
    
    renderProfiles(filteredProfiles);
}

// Utility functions
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showError(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--error-color);
        color: white;
        padding: 12px 16px;
        border-radius: var(--radius);
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

function showSuccess(message) {
    // Create a simple success toast notification
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 12px 16px;
        border-radius: var(--radius);
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// GitHub Integration Functions
let currentGitHubProfile = null;
let githubIssues = [];
let githubBranches = [];
let selectedIssue = null;
let selectedBranch = null;

async function showGitHubIssuesModal(profile) {
    currentGitHubProfile = profile;
    
    if (!profile.githubRepo || !profile.githubRepo.owner || !profile.githubRepo.repo) {
        showError('GitHub repository not configured for this profile');
        return;
    }

    const modal = document.getElementById('githubIssuesModal');
    modal.style.display = 'block';
    
    // Load GitHub data
    await loadGitHubBranches();
    await loadGitHubIssues();
}

function closeGitHubIssuesModal() {
    const modal = document.getElementById('githubIssuesModal');
    modal.style.display = 'none';
    currentGitHubProfile = null;
    githubIssues = [];
    githubBranches = [];
    selectedIssue = null;
    selectedBranch = null;
}

async function loadGitHubBranches() {
    if (!currentGitHubProfile?.githubRepo) return;
    
    try {
        const { owner, repo } = currentGitHubProfile.githubRepo;
        githubBranches = await window.electronAPI.githubListBranches(owner, repo);
        
        const branchSelect = document.getElementById('branchSelect');
        branchSelect.innerHTML = '';
        
        githubBranches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch;
            option.textContent = branch;
            if (branch === currentGitHubProfile.githubRepo.branch || branch === 'main' || branch === 'master') {
                option.selected = true;
                selectedBranch = branch;
            }
            branchSelect.appendChild(option);
        });
        
        branchSelect.addEventListener('change', (e) => {
            selectedBranch = e.target.value;
        });
        
    } catch (error) {
        console.error('Failed to load branches:', error);
        showError('Failed to load branches: ' + error.message);
    }
}

async function loadGitHubIssues(state = 'open') {
    if (!currentGitHubProfile?.githubRepo) return;
    
    try {
        const { owner, repo } = currentGitHubProfile.githubRepo;
        githubIssues = await window.electronAPI.githubListIssues(owner, repo, state);
        
        renderGitHubIssues();
        
    } catch (error) {
        console.error('Failed to load issues:', error);
        showError('Failed to load issues: ' + error.message);
    }
}

function renderGitHubIssues() {
    const issuesList = document.getElementById('issuesList');
    
    if (githubIssues.length === 0) {
        issuesList.innerHTML = '<div class="empty-state">No issues found</div>';
        return;
    }
    
    issuesList.innerHTML = '';
    
    githubIssues.forEach(issue => {
        const issueElement = document.createElement('div');
        issueElement.className = 'issue-item';
        issueElement.dataset.issueId = issue.id;
        
        issueElement.innerHTML = `
            <div class="issue-header">
                <h4 class="issue-title">${escapeHtml(issue.title)}</h4>
                <span class="issue-number">#${issue.number}</span>
            </div>
            <div class="issue-labels">
                ${issue.labels.map(label => `<span class="issue-label ${label}">${label}</span>`).join('')}
            </div>
            <div class="issue-body">${escapeHtml(issue.body.substring(0, 120))}${issue.body.length > 120 ? '...' : ''}</div>
            <div class="issue-meta">
                <span>Created: ${formatDate(issue.createdAt)}</span>
                <span>Updated: ${formatDate(issue.updatedAt)}</span>
            </div>
        `;
        
        issueElement.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('.issue-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Select current issue
            issueElement.classList.add('selected');
            selectedIssue = issue;
        });
        
        issuesList.appendChild(issueElement);
    });
}

function filterIssues(filter) {
    // Update filter buttons
    document.querySelectorAll('.filter-controls .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('filter' + filter).classList.add('active');
    
    let filteredIssues = githubIssues;
    
    if (filter === 'Todo') {
        filteredIssues = githubIssues.filter(issue => 
            issue.labels.includes('todo') || issue.labels.includes('enhancement')
        );
    } else if (filter === 'InProgress') {
        filteredIssues = githubIssues.filter(issue => 
            issue.labels.includes('in-progress') || issue.labels.includes('bug')
        );
    }
    
    // Temporarily update the githubIssues array for rendering
    const originalIssues = githubIssues;
    githubIssues = filteredIssues;
    renderGitHubIssues();
    githubIssues = originalIssues;
}

function showNewIssueModal() {
    const modal = document.getElementById('newIssueModal');
    modal.style.display = 'block';
}

function closeNewIssueModal() {
    const modal = document.getElementById('newIssueModal');
    modal.style.display = 'none';
    
    // Reset form
    document.getElementById('newIssueForm').reset();
}

async function handleNewIssueSubmit(event) {
    event.preventDefault();
    
    if (!currentGitHubProfile?.githubRepo) return;
    
    const formData = new FormData(event.target);
    const title = formData.get('title');
    const body = formData.get('body');
    
    // Get selected labels
    const labels = [];
    document.querySelectorAll('#newIssueForm input[type="checkbox"]:checked').forEach(checkbox => {
        labels.push(checkbox.value);
    });
    
    try {
        showLoading();
        const { owner, repo } = currentGitHubProfile.githubRepo;
        
        await window.electronAPI.githubCreateIssue(owner, repo, title, body, labels);
        
        showSuccess('Issue created successfully!');
        closeNewIssueModal();
        await loadGitHubIssues(); // Reload issues
        
    } catch (error) {
        console.error('Failed to create issue:', error);
        showError('Failed to create issue: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function openVSCodeWithBranch() {
    if (!currentGitHubProfile) return;
    
    try {
        showLoading();
        
        // If a branch is selected, checkout the branch first
        if (selectedBranch && currentGitHubProfile.workspacePath) {
            const { spawn } = require('child_process');
            const process = spawn('git', ['checkout', selectedBranch], {
                cwd: currentGitHubProfile.workspacePath,
                stdio: 'inherit'
            });
            
            process.on('close', async (code) => {
                if (code === 0) {
                    showSuccess(`Switched to branch: ${selectedBranch}`);
                } else {
                    showError(`Failed to switch to branch: ${selectedBranch}`);
                }
                
                // Launch VS Code regardless
                await window.electronAPI.launchVSCode(currentGitHubProfile);
                closeGitHubIssuesModal();
            });
        } else {
            // Just launch VS Code
            await window.electronAPI.launchVSCode(currentGitHubProfile);
            closeGitHubIssuesModal();
        }
        
    } catch (error) {
        console.error('Failed to open VS Code:', error);
        showError('Failed to open VS Code: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Directory picker functionality
async function selectWorkspacePath() {
    try {
        const selectedPath = await window.electronAPI.selectDirectory();
        if (selectedPath) {
            document.getElementById('workspacePath').value = selectedPath;
        }
    } catch (error) {
        console.error('Failed to select directory:', error);
        showError('Failed to select directory');
    }
}

// GitHub repository selection functionality
async function handleGitHubOwnerChange(e) {
    const owner = e.target.value.trim();
    if (!owner) {
        clearGitHubRepoOptions();
        clearGitHubBranchOptions();
        return;
    }
    
    try {
        showLoading();
        const repos = await window.electronAPI.githubListRepos(owner);
        
        // Populate repository select
        const repoSelect = document.getElementById('githubRepo');
        repoSelect.innerHTML = '<option value="">Select repository...</option>';
        
        repos.forEach(repo => {
            const option = document.createElement('option');
            option.value = repo.name;
            option.textContent = `${repo.name}${repo.description ? ` - ${repo.description}` : ''}`;
            option.dataset.defaultBranch = repo.defaultBranch;
            repoSelect.appendChild(option);
        });
        
        // Clear branch selection
        clearGitHubBranchOptions();
        
    } catch (error) {
        console.error('Failed to load repositories:', error);
        showError('Failed to load repositories: ' + error.message);
        clearGitHubRepoOptions();
        clearGitHubBranchOptions();
    } finally {
        hideLoading();
    }
}

async function handleGitHubRepoChange(e) {
    const repoName = e.target.value;
    const owner = document.getElementById('githubOwner').value.trim();
    
    if (!repoName || !owner) {
        clearGitHubBranchOptions();
        return;
    }
    
    try {
        showLoading();
        const branches = await window.electronAPI.githubListBranches(owner, repoName);
        
        // Populate branch select
        const branchSelect = document.getElementById('githubBranch');
        branchSelect.innerHTML = '<option value="">Select branch...</option>';
        
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch;
            option.textContent = branch;
            branchSelect.appendChild(option);
        });
        
        // Set default branch if available
        const selectedOption = e.target.selectedOptions[0];
        if (selectedOption && selectedOption.dataset.defaultBranch) {
            branchSelect.value = selectedOption.dataset.defaultBranch;
        }
        
    } catch (error) {
        console.error('Failed to load branches:', error);
        showError('Failed to load branches: ' + error.message);
        clearGitHubBranchOptions();
    } finally {
        hideLoading();
    }
}

function clearGitHubRepoOptions() {
    const repoSelect = document.getElementById('githubRepo');
    repoSelect.innerHTML = '<option value="">Select repository...</option>';
}

function clearGitHubBranchOptions() {
    const branchSelect = document.getElementById('githubBranch');
    branchSelect.innerHTML = '<option value="">Select branch...</option>';
}

// Event listeners for GitHub modal
document.addEventListener('DOMContentLoaded', () => {
    // Filter buttons
    document.getElementById('filterAll')?.addEventListener('click', () => filterIssues('All'));
    document.getElementById('filterTodo')?.addEventListener('click', () => filterIssues('Todo'));
    document.getElementById('filterInProgress')?.addEventListener('click', () => filterIssues('InProgress'));
    
    // Action buttons
    document.getElementById('newIssueBtn')?.addEventListener('click', showNewIssueModal);
    document.getElementById('refreshIssuesBtn')?.addEventListener('click', () => loadGitHubIssues());
    document.getElementById('openVSCodeBtn')?.addEventListener('click', openVSCodeWithBranch);
    
    // New issue form
    document.getElementById('newIssueForm')?.addEventListener('submit', handleNewIssueSubmit);
});

// Global functions
window.showCreateProfileModal = showCreateProfileModal;
window.addEnvVariable = addEnvVariable;
window.removeEnvVariable = removeEnvVariable;
window.closeGitHubIssuesModal = closeGitHubIssuesModal;
window.closeNewIssueModal = closeNewIssueModal;