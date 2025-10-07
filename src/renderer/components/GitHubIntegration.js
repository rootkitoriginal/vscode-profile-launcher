/**
 * GitHubIntegration Component
 * Manages enhanced GitHub integration with cascading dropdowns
 */

import { showError, showSuccess } from '../utils/dom.js';

export class GitHubIntegration {
    constructor() {
        this.tokenInput = document.getElementById('githubToken');
        this.ownerSelect = null;
        this.repoSelect = document.getElementById('githubRepo');
        this.branchSelect = document.getElementById('githubBranch');
        this.ownerInput = document.getElementById('githubOwner');

        this.currentUser = null;
        this.organizations = [];
        this.isValidToken = false;
    }

    /**
     * Initialize the GitHub integration component
     */
    async initialize() {
        // Check if GitHub is configured
        const configured = await window.electronAPI.isGitHubConfigured();
        if (configured) {
            const token = await window.electronAPI.getGitHubToken();
            if (token && this.tokenInput) {
                this.tokenInput.value = token;
                await this.validateToken(token);
            }
        }

        this.setupEventListeners();
    }

    /**
     * Setup event listeners for GitHub integration
     */
    setupEventListeners() {
        // Token validation on blur or button click
        if (this.tokenInput) {
            this.tokenInput.addEventListener('blur', async e => {
                const token = e.target.value.trim();
                if (token) {
                    await this.validateToken(token);
                }
            });
        }

        // Owner change triggers repository loading
        if (this.ownerInput) {
            this.ownerInput.addEventListener('blur', async e => {
                const owner = e.target.value.trim();
                if (owner) {
                    await this.loadRepositories(owner);
                }
            });
        }

        // Repository change triggers branch loading
        if (this.repoSelect) {
            this.repoSelect.addEventListener('change', async e => {
                const repo = e.target.value;
                const owner = this.ownerInput?.value.trim();
                if (repo && owner) {
                    await this.loadBranches(owner, repo);
                }
            });
        }
    }

    /**
     * Validate GitHub token and get user info
     */
    async validateToken(token) {
        if (!token) return;

        try {
            const statusDiv = document.getElementById('githubStatus');
            if (statusDiv) {
                statusDiv.innerHTML = '<span style="color: #666;">⏳ Validating token...</span>';
            }

            const result = await window.electronAPI.githubValidateToken(token);

            if (result.valid && result.user) {
                this.isValidToken = true;
                this.currentUser = result.user;

                // Save the token
                await window.electronAPI.updateGitHubToken(token);

                // Show success status
                if (statusDiv) {
                    statusDiv.innerHTML = `<span style="color: #27ae60;">✅ Connected as @${result.user.login}</span>`;
                }

                // Load organizations
                await this.loadOrganizations();

                // Create owner dropdown if we have the user info
                this.createOwnerDropdown();

                return true;
            } else {
                this.isValidToken = false;
                if (statusDiv) {
                    statusDiv.innerHTML =
                        '<span style="color: #e74c3c;">✗ Invalid token. Please check and try again.</span>';
                }
                return false;
            }
        } catch (error) {
            console.error('Token validation error:', error);
            this.isValidToken = false;
            const statusDiv = document.getElementById('githubStatus');
            if (statusDiv) {
                statusDiv.innerHTML = `<span style="color: #e74c3c;">✗ Error: ${error.message}</span>`;
            }
            return false;
        }
    }

    /**
     * Load user's organizations
     */
    async loadOrganizations() {
        try {
            this.organizations = await window.electronAPI.githubListUserOrgs();
        } catch (error) {
            console.error('Error loading organizations:', error);
            this.organizations = [];
        }
    }

    /**
     * Create owner dropdown with user and organizations
     */
    createOwnerDropdown() {
        if (!this.currentUser) return;

        // Check if we're in the settings modal or profile modal
        const ownerContainer = this.ownerInput?.parentElement;
        if (!ownerContainer) return;

        // Replace text input with select dropdown
        const ownerSelect = document.createElement('select');
        ownerSelect.id = 'githubOwner';
        ownerSelect.name = 'githubOwner';
        ownerSelect.className = 'form-select';

        // Add current user as first option
        const userOption = document.createElement('option');
        userOption.value = this.currentUser.login;
        userOption.textContent = `${this.currentUser.login} (You)`;
        ownerSelect.appendChild(userOption);

        // Add organizations
        this.organizations.forEach(org => {
            const option = document.createElement('option');
            option.value = org.login;
            option.textContent = org.login;
            ownerSelect.appendChild(option);
        });

        // Set up event listener for owner change
        ownerSelect.addEventListener('change', async e => {
            const owner = e.target.value;
            if (owner) {
                await this.loadRepositories(owner);
            }
        });

        // Replace the input with the select
        if (this.ownerInput) {
            ownerContainer.replaceChild(ownerSelect, this.ownerInput);
            this.ownerInput = ownerSelect;
            this.ownerSelect = ownerSelect;
        }
    }

    /**
     * Load repositories for a given owner
     */
    async loadRepositories(owner) {
        if (!this.repoSelect) return;

        try {
            this.repoSelect.innerHTML = '<option value="">Loading...</option>';
            this.repoSelect.disabled = true;

            const repos = await window.electronAPI.githubListRepos(owner);

            this.repoSelect.innerHTML = '<option value="">Select repository...</option>';

            repos.forEach(repo => {
                const option = document.createElement('option');
                option.value = repo.name;
                option.textContent = repo.name;
                option.title = repo.description || repo.name;
                this.repoSelect.appendChild(option);
            });

            this.repoSelect.disabled = false;
        } catch (error) {
            console.error('Error loading repositories:', error);
            this.repoSelect.innerHTML = '<option value="">Error loading repositories</option>';
            showError(`Failed to load repositories: ${error.message}`);
        }
    }

    /**
     * Load branches for a given repository
     */
    async loadBranches(owner, repo) {
        if (!this.branchSelect) return;

        try {
            this.branchSelect.innerHTML = '<option value="">Loading...</option>';
            this.branchSelect.disabled = true;

            const branches = await window.electronAPI.githubListBranchesDetailed(owner, repo);

            this.branchSelect.innerHTML = '<option value="">Select branch...</option>';

            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.name;

                // Show branch name with indicator if it's protected
                let text = branch.name;
                if (branch.protected) {
                    text += ' 🔒';
                }
                if (branch.lastCommit) {
                    const commitShort = branch.lastCommit.message.split('\n')[0];
                    option.title = `${commitShort}\nby ${branch.lastCommit.author}`;
                }

                option.textContent = text;
                this.branchSelect.appendChild(option);
            });

            this.branchSelect.disabled = false;
        } catch (error) {
            console.error('Error loading branches:', error);
            this.branchSelect.innerHTML = '<option value="">Error loading branches</option>';
            showError(`Failed to load branches: ${error.message}`);
        }
    }

    /**
     * Get current GitHub configuration
     */
    getConfiguration() {
        const owner = this.ownerInput?.value || this.ownerSelect?.value;
        const repo = this.repoSelect?.value;
        const branch = this.branchSelect?.value;

        if (!owner || !repo) {
            return null;
        }

        return {
            owner,
            repo,
            branch: branch || undefined,
        };
    }

    /**
     * Set GitHub configuration (for edit mode)
     */
    async setConfiguration(config) {
        if (!config || !config.owner || !config.repo) return;

        // If we have a valid token, use the enhanced UI
        if (this.isValidToken) {
            // Set owner
            if (this.ownerSelect) {
                this.ownerSelect.value = config.owner;
            } else if (this.ownerInput) {
                this.ownerInput.value = config.owner;
            }

            // Load and set repository
            await this.loadRepositories(config.owner);
            if (this.repoSelect && config.repo) {
                this.repoSelect.value = config.repo;

                // Load and set branch
                if (config.branch) {
                    await this.loadBranches(config.owner, config.repo);
                    if (this.branchSelect) {
                        this.branchSelect.value = config.branch;
                    }
                }
            }
        } else {
            // Fallback to basic text inputs
            if (this.ownerInput) {
                this.ownerInput.value = config.owner;
            }
        }
    }
}
