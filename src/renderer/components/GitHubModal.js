/**
 * GitHubModal Component
 * Manages GitHub issues and branches modal
 */

import { escapeHtml, formatDate } from '../utils/formatters.js';
import { showLoading, hideLoading, showSuccess, showError } from '../utils/dom.js';

export class GitHubModal {
    constructor(modalId = 'githubIssuesModal', newIssueModalId = 'newIssueModal') {
        this.modal = document.getElementById(modalId);
        this.newIssueModal = document.getElementById(newIssueModalId);
        this.currentProfile = null;
        this.issues = [];
        this.branches = [];
        this.selectedIssue = null;
        this.selectedBranch = null;
    }

    /**
     * Show GitHub modal for a profile
     * @param {Object} profile - Profile with GitHub configuration
     */
    async show(profile) {
        if (!profile.githubRepo || !profile.githubRepo.owner || !profile.githubRepo.repo) {
            showError('GitHub repository not configured for this profile');
            return;
        }

        this.currentProfile = profile;

        if (this.modal) {
            this.modal.style.display = 'block';
        }

        await this.loadBranches();
        await this.loadIssues();
    }

    /**
     * Hide GitHub modal
     */
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        this.reset();
    }

    /**
     * Reset modal state
     */
    reset() {
        this.currentProfile = null;
        this.issues = [];
        this.branches = [];
        this.selectedIssue = null;
        this.selectedBranch = null;
    }

    /**
     * Load GitHub branches
     */
    async loadBranches() {
        if (!this.currentProfile?.githubRepo) return;

        try {
            const { owner, repo } = this.currentProfile.githubRepo;
            this.branches = await window.electronAPI.githubListBranches(owner, repo);

            const branchSelect = document.getElementById('branchSelect');
            if (!branchSelect) return;

            branchSelect.innerHTML = '';

            this.branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch;
                option.textContent = branch;

                if (
                    branch === this.currentProfile.githubRepo.branch ||
                    branch === 'main' ||
                    branch === 'master'
                ) {
                    option.selected = true;
                    this.selectedBranch = branch;
                }

                branchSelect.appendChild(option);
            });

            branchSelect.addEventListener('change', e => {
                this.selectedBranch = e.target.value;
            });
        } catch (error) {
            console.error('Failed to load branches:', error);
            showError('Failed to load branches: ' + error.message);
        }
    }

    /**
     * Load GitHub issues
     * @param {string} state - Issue state (open, closed, all)
     */
    async loadIssues(state = 'open') {
        if (!this.currentProfile?.githubRepo) return;

        try {
            const { owner, repo } = this.currentProfile.githubRepo;
            this.issues = await window.electronAPI.githubListIssues(owner, repo, state);

            this.renderIssues();
        } catch (error) {
            console.error('Failed to load issues:', error);
            showError('Failed to load issues: ' + error.message);
        }
    }

    /**
     * Render issues list
     */
    renderIssues() {
        const issuesList = document.getElementById('issuesList');
        if (!issuesList) return;

        if (this.issues.length === 0) {
            issuesList.innerHTML = '<div class="empty-state">No issues found</div>';
            return;
        }

        issuesList.innerHTML = '';

        this.issues.forEach(issue => {
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
                document.querySelectorAll('.issue-item').forEach(item => {
                    item.classList.remove('selected');
                });

                issueElement.classList.add('selected');
                this.selectedIssue = issue;
            });

            issuesList.appendChild(issueElement);
        });
    }

    /**
     * Filter issues by category
     * @param {string} filter - Filter category (All, Todo, InProgress)
     */
    filterIssues(filter) {
        // Update filter buttons
        document.querySelectorAll('.filter-controls .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const filterBtn = document.getElementById('filter' + filter);
        if (filterBtn) {
            filterBtn.classList.add('active');
        }

        let filteredIssues = this.issues;

        if (filter === 'Todo') {
            filteredIssues = this.issues.filter(
                issue => issue.labels.includes('todo') || issue.labels.includes('enhancement')
            );
        } else if (filter === 'InProgress') {
            filteredIssues = this.issues.filter(
                issue => issue.labels.includes('in-progress') || issue.labels.includes('bug')
            );
        }

        // Temporarily update issues for rendering
        const originalIssues = this.issues;
        this.issues = filteredIssues;
        this.renderIssues();
        this.issues = originalIssues;
    }

    /**
     * Show new issue modal
     */
    showNewIssueModal() {
        if (this.newIssueModal) {
            this.newIssueModal.style.display = 'block';
        }
    }

    /**
     * Hide new issue modal
     */
    hideNewIssueModal() {
        if (this.newIssueModal) {
            this.newIssueModal.style.display = 'none';
        }

        const form = document.getElementById('newIssueForm');
        if (form) {
            form.reset();
        }
    }

    /**
     * Create new issue
     * @param {string} title - Issue title
     * @param {string} body - Issue body
     * @param {Array} labels - Issue labels
     */
    async createIssue(title, body, labels = []) {
        if (!this.currentProfile?.githubRepo) return;

        try {
            showLoading();
            const { owner, repo } = this.currentProfile.githubRepo;

            await window.electronAPI.githubCreateIssue(owner, repo, title, body, labels);

            showSuccess('Issue created successfully!');
            this.hideNewIssueModal();
            await this.loadIssues();
        } catch (error) {
            console.error('Failed to create issue:', error);
            showError('Failed to create issue: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    /**
     * Open VS Code with selected branch
     */
    async openVSCodeWithBranch() {
        if (!this.currentProfile) return;

        try {
            showLoading();

            // Note: Branch checkout is handled by the main process
            // This is just launching VS Code
            await window.electronAPI.launchVSCode(this.currentProfile);

            if (this.selectedBranch) {
                showSuccess(`Opening VS Code with branch: ${this.selectedBranch}`);
            }

            this.hide();
        } catch (error) {
            console.error('Failed to open VS Code:', error);
            showError('Failed to open VS Code: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    /**
     * Get selected issue
     * @returns {Object|null}
     */
    getSelectedIssue() {
        return this.selectedIssue;
    }

    /**
     * Get selected branch
     * @returns {string|null}
     */
    getSelectedBranch() {
        return this.selectedBranch;
    }
}
