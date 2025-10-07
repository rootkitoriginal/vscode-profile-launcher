/**
 * ProfileModal Component
 * Manages the profile creation/editing modal
 */

import { escapeHtml } from '../utils/formatters.js';

export class ProfileModal {
    constructor(modalId = 'profileModal') {
        this.modal = document.getElementById(modalId);
        this.form = document.getElementById('profileForm');
        this.modalTitle = document.getElementById('modalTitle');
        this.isEditMode = false;
        this.currentProfile = null;
        this.aiProviders = [];
    }

    /**
     * Show create profile modal
     */
    showCreate() {
        this.isEditMode = false;
        this.currentProfile = null;
        this.modalTitle.textContent = 'Create New Profile';
        this.form.reset();
        document.getElementById('saveBtn').textContent = 'Save Profile';

        this.clearEnvVariables();
        this.clearGitHubSelections();
        this.populateAIProviders();

        this.show();
        document.getElementById('profileName').focus();
    }

    /**
     * Show edit profile modal
     * @param {Object} profile - Profile to edit
     * @param {Function} onOwnerChange - Handler for GitHub owner change
     * @param {Function} onRepoChange - Handler for GitHub repo change
     */
    showEdit(profile, onOwnerChange, onRepoChange) {
        this.isEditMode = true;
        this.currentProfile = profile;
        this.modalTitle.textContent = 'Edit Profile';

        // Populate form fields
        document.getElementById('profileName').value = profile.name;
        document.getElementById('profileLanguage').value = profile.language;
        document.getElementById('profileDescription').value = profile.description || '';
        document.getElementById('workspacePath').value = profile.workspacePath || '';
        document.getElementById('aiProvider').value = profile.aiProvider || '';
        document.getElementById('aiModel').value = profile.aiModel || '';

        // Populate GitHub data
        document.getElementById('githubOwner').value = profile.githubRepo?.owner || '';

        if (profile.githubRepo?.owner && onOwnerChange) {
            onOwnerChange({ target: { value: profile.githubRepo.owner } });
            setTimeout(() => {
                document.getElementById('githubRepo').value = profile.githubRepo?.repo || '';
                if (profile.githubRepo?.repo && onRepoChange) {
                    onRepoChange({ target: document.getElementById('githubRepo') });
                }
            }, 100);
        } else {
            this.clearGitHubSelections();
        }

        // Populate environment variables
        this.clearEnvVariables();
        if (profile.envVariables) {
            Object.entries(profile.envVariables).forEach(([key, value]) => {
                this.addEnvVariable(key, value);
            });
        }

        // Populate AI providers
        this.populateAIProviders();
        if (profile.aiProvider) {
            this.updateAIModels(profile.aiProvider);
        }

        document.getElementById('saveBtn').textContent = 'Update Profile';
        this.show();
        document.getElementById('profileName').focus();
    }

    /**
     * Show modal
     */
    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
        }
    }

    /**
     * Hide modal
     */
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        this.isEditMode = false;
        this.currentProfile = null;
    }

    /**
     * Set AI providers
     * @param {Array} providers - Array of AI provider objects
     */
    setAIProviders(providers) {
        this.aiProviders = providers;
    }

    /**
     * Populate AI providers dropdown
     */
    populateAIProviders() {
        const aiProviderSelect = document.getElementById('aiProvider');
        if (!aiProviderSelect) return;

        while (aiProviderSelect.children.length > 1) {
            aiProviderSelect.removeChild(aiProviderSelect.lastChild);
        }

        this.aiProviders.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider.name;
            option.textContent = provider.displayName;
            aiProviderSelect.appendChild(option);
        });
    }

    /**
     * Update AI models dropdown based on selected provider
     * @param {string} providerName - Selected provider name
     */
    updateAIModels(providerName) {
        const aiModelSelect = document.getElementById('aiModel');
        if (!aiModelSelect) return;

        aiModelSelect.innerHTML = '<option value="">Select model...</option>';

        if (!providerName) return;

        const provider = this.aiProviders.find(p => p.name === providerName);
        if (provider) {
            provider.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = `${model.name}${model.description ? ` - ${model.description}` : ''}`;
                aiModelSelect.appendChild(option);
            });
        }
    }

    /**
     * Add environment variable row
     * @param {string} key - Variable name
     * @param {string} value - Variable value
     */
    addEnvVariable(key = '', value = '') {
        const container = document.getElementById('envVariables');
        if (!container) return;

        const addButton = container.querySelector('.env-var-row');

        const row = document.createElement('div');
        row.className = 'env-var-row';
        row.innerHTML = `
            <input type="text" class="form-input env-var-input" placeholder="Variable name" value="${escapeHtml(key)}">
            <input type="text" class="form-input env-var-input" placeholder="Variable value" value="${escapeHtml(value)}">
            <button type="button" class="env-var-remove">×</button>
        `;

        // Add remove handler
        const removeBtn = row.querySelector('.env-var-remove');
        removeBtn.addEventListener('click', () => row.remove());

        container.insertBefore(row, addButton);
    }

    /**
     * Clear environment variables
     */
    clearEnvVariables() {
        const container = document.getElementById('envVariables');
        if (!container) return;

        const rows = container.querySelectorAll('.env-var-row');
        rows.forEach((row, index) => {
            if (index < rows.length - 1) {
                row.remove();
            }
        });
    }

    /**
     * Get environment variables from form
     * @returns {Object} Environment variables as key-value pairs
     */
    getEnvVariablesFromForm() {
        const container = document.getElementById('envVariables');
        if (!container) return {};

        const rows = container.querySelectorAll('.env-var-row');
        const envVars = {};

        rows.forEach((row, index) => {
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

    /**
     * Clear GitHub repository and branch selections
     */
    clearGitHubSelections() {
        const repoSelect = document.getElementById('githubRepo');
        const branchSelect = document.getElementById('githubBranch');

        if (repoSelect) {
            repoSelect.innerHTML = '<option value="">Select repository...</option>';
        }
        if (branchSelect) {
            branchSelect.innerHTML = '<option value="">Select branch...</option>';
        }
    }

    /**
     * Check if modal is in edit mode
     * @returns {boolean}
     */
    inEditMode() {
        return this.isEditMode;
    }

    /**
     * Get current profile being edited
     * @returns {Object|null}
     */
    getCurrentProfile() {
        return this.currentProfile;
    }

    /**
     * Generate AI-powered description for the profile
     */
    async generateDescription() {
        const profileName = document.getElementById('profileName').value;
        const language = document.getElementById('profileLanguage').value;
        const workspacePath = document.getElementById('workspacePath').value;
        const aiProvider = document.getElementById('aiProvider').value;
        const aiModel = document.getElementById('aiModel').value;

        if (!profileName) {
            this.showDescriptionHint('Please enter a profile name first', 'error');
            return;
        }

        if (!language) {
            this.showDescriptionHint('Please select a programming language first', 'error');
            return;
        }

        const generateBtn = document.getElementById('generateDescriptionBtn');
        const originalText = generateBtn.textContent;

        try {
            generateBtn.textContent = '⏳ Generating...';
            generateBtn.disabled = true;

            const result = await window.electronAPI.generateProfileDescription(
                profileName,
                language,
                workspacePath || undefined,
                aiProvider || undefined,
                aiModel || undefined
            );

            if (result.success && result.description) {
                document.getElementById('profileDescription').value = result.description;
                this.showDescriptionHint('✓ Description generated successfully!', 'success');
            } else {
                this.showDescriptionHint(`✗ Failed: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            this.showDescriptionHint(`✗ Error: ${error.message}`, 'error');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }

    /**
     * Show hint message below description field
     */
    showDescriptionHint(message, type = 'info') {
        const hint = document.getElementById('descriptionHint');
        hint.textContent = message;
        hint.style.display = 'block';
        hint.style.color = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#666';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            hint.style.display = 'none';
        }, 5000);
    }
}
