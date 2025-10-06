/**
 * SettingsModal Component
 * Manages the settings modal and its tabs
 */

import { showLoading, hideLoading, showSuccess, showError } from '../utils/dom.js';

export class SettingsModal {
    constructor(modalId = 'settingsModal') {
        this.modal = document.getElementById(modalId);
        this.appConfig = {};
    }

    /**
     * Show settings modal
     */
    async show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            await this.loadData();
        }
    }

    /**
     * Hide settings modal
     */
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    /**
     * Switch between settings tabs
     * @param {string} tabName - Tab name to switch to
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const tabContent = document.getElementById(`${tabName}Tab`);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    }

    /**
     * Set app config
     * @param {Object} config - Application configuration
     */
    setAppConfig(config) {
        this.appConfig = config;
    }

    /**
     * Load settings data from backend
     */
    async loadData() {
        try {
            // Load current API keys
            const apiKeys = await window.electronAPI.getApiKeys();

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

            // Load VS Code command
            const vscodeCommand = document.getElementById('vscodeCommand');
            if (vscodeCommand) {
                vscodeCommand.value = this.appConfig.vscodeCommand || 'code';
            }

            // Update status displays
            await this.updateProviderStatus();
            await this.updateGitHubStatus();
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * Update AI provider status display
     */
    async updateProviderStatus() {
        try {
            const providers = await window.electronAPI.getAvailableProviders();
            const statusContainer = document.getElementById('providerStatus');

            if (statusContainer) {
                statusContainer.innerHTML = providers
                    .map(
                        provider => `
                    <div class="provider-item">
                        <span class="provider-name">${provider.name === 'gemini' ? 'Google Gemini' : 'OpenAI'}</span>
                        <span class="${provider.configured ? 'provider-configured' : 'provider-not-configured'}">
                            ${provider.configured ? '✓ Configured' : '✗ Not configured'}
                        </span>
                    </div>
                `
                    )
                    .join('');
            }
        } catch (error) {
            console.error('Failed to update provider status:', error);
        }
    }

    /**
     * Update GitHub status display
     */
    async updateGitHubStatus() {
        try {
            const isConfigured = await window.electronAPI.isGitHubConfigured();
            const statusContainer = document.getElementById('githubStatus');

            if (statusContainer) {
                if (isConfigured) {
                    statusContainer.innerHTML =
                        '<div class="github-status configured">✓ GitHub token configured and ready</div>';
                } else {
                    statusContainer.innerHTML =
                        '<div class="github-status not-configured">✗ GitHub token not configured</div>';
                }
            }
        } catch (error) {
            console.error('Failed to update GitHub status:', error);
        }
    }

    /**
     * Save settings
     */
    async save() {
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

            await this.updateProviderStatus();
            await this.updateGitHubStatus();
            this.hide();

            showSuccess('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            showError('Failed to save settings');
        } finally {
            hideLoading();
        }
    }
}
