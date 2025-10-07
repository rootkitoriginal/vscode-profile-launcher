/**
 * GitHub Integration Window
 * Standalone window for managing GitHub issues and branches
 */

import { escapeHtml, formatDate } from './utils/formatters.js';

let currentProfile = null;
let issues = [];
let branches = [];
let selectedIssue = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Get profile data from main process
    currentProfile = await window.electronAPI.getGitHubWindowProfile();
    
    if (!currentProfile || !currentProfile.githubRepo) {
        alert('No GitHub repository configured for this profile');
        window.close();
        return;
    }

    setupEventListeners();
    await loadData();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Close window button
    document.getElementById('closeWindowBtn')?.addEventListener('click', () => {
        window.close();
    });

    // Filter buttons
    document.querySelectorAll('.filter-controls .btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            document.querySelectorAll('.filter-controls .btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            await loadIssues(e.target.dataset.filter);
        });
    });

    // Refresh button
    document.getElementById('refreshBtn')?.addEventListener('click', async () => {
        await loadData();
    });

    // New issue button
    document.getElementById('newIssueBtn')?.addEventListener('click', () => {
        showNewIssueModal();
    });

    // New issue modal controls
    document.getElementById('closeNewIssueModal')?.addEventListener('click', () => {
        hideNewIssueModal();
    });

    document.getElementById('cancelNewIssueBtn')?.addEventListener('click', () => {
        hideNewIssueModal();
    });

    document.getElementById('createIssueBtn')?.addEventListener('click', async () => {
        await createIssue();
    });

    // Issue details close
    document.getElementById('closeDetailsBtn')?.addEventListener('click', () => {
        hideIssueDetails();
    });

    // Launch with issue
    document.getElementById('launchIssueBtn')?.addEventListener('click', async () => {
        if (selectedIssue && currentProfile) {
            await window.electronAPI.launchProfileWithIssue(currentProfile.id, selectedIssue.number);
            window.close();
        }
    });

    // Branch selection
    document.getElementById('branchSelect')?.addEventListener('change', async (e) => {
        if (e.target.value) {
            // Could trigger branch-specific actions here
            console.log('Selected branch:', e.target.value);
        }
    });
}

/**
 * Load all data
 */
async function loadData() {
    await Promise.all([loadBranches(), loadIssues('open')]);
}

/**
 * Load branches
 */
async function loadBranches() {
    if (!currentProfile?.githubRepo) return;

    const { owner, repo } = currentProfile.githubRepo;
    
    try {
        branches = await window.electronAPI.githubListBranchesDetailed(owner, repo);
        renderBranches();
    } catch (error) {
        console.error('Error loading branches:', error);
    }
}

/**
 * Render branches dropdown
 */
function renderBranches() {
    const branchSelect = document.getElementById('branchSelect');
    if (!branchSelect) return;

    branchSelect.innerHTML = '<option value="">Select branch...</option>';
    
    branches.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch.name;
        option.textContent = branch.name + (branch.protected ? ' 🔒' : '');
        if (currentProfile.githubRepo.branch === branch.name) {
            option.selected = true;
        }
        branchSelect.appendChild(option);
    });
}

/**
 * Load issues
 */
async function loadIssues(state = 'open') {
    if (!currentProfile?.githubRepo) return;

    const { owner, repo } = currentProfile.githubRepo;
    
    try {
        issues = await window.electronAPI.githubListIssues(owner, repo, state);
        renderIssues();
    } catch (error) {
        console.error('Error loading issues:', error);
        document.getElementById('issuesList').innerHTML = 
            '<div class="error-state">Failed to load issues</div>';
    }
}

/**
 * Render issues list
 */
function renderIssues() {
    const issuesList = document.getElementById('issuesList');
    if (!issuesList) return;

    if (issues.length === 0) {
        issuesList.innerHTML = '<div class="empty-state">No issues found</div>';
        return;
    }

    issuesList.innerHTML = '';
    
    issues.forEach(issue => {
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
            <div class="issue-meta">
                <span class="issue-author">by ${escapeHtml(issue.author)}</span>
                <span class="issue-date">${formatDate(issue.createdAt)}</span>
            </div>
        `;

        issueElement.addEventListener('click', () => {
            showIssueDetails(issue);
        });

        issuesList.appendChild(issueElement);
    });
}

/**
 * Show issue details
 */
function showIssueDetails(issue) {
    selectedIssue = issue;
    
    const detailsPanel = document.getElementById('issueDetails');
    if (!detailsPanel) return;

    document.getElementById('issueTitle').textContent = issue.title;
    document.getElementById('issueNumber').textContent = `#${issue.number}`;
    document.getElementById('issueState').textContent = issue.state;
    document.getElementById('issueAuthor').textContent = `by ${issue.author}`;
    document.getElementById('issueDate').textContent = formatDate(issue.createdAt);
    document.getElementById('issueBody').innerHTML = escapeHtml(issue.body || 'No description');

    detailsPanel.style.display = 'block';
}

/**
 * Hide issue details
 */
function hideIssueDetails() {
    const detailsPanel = document.getElementById('issueDetails');
    if (detailsPanel) {
        detailsPanel.style.display = 'none';
    }
    selectedIssue = null;
}

/**
 * Show new issue modal
 */
function showNewIssueModal() {
    const modal = document.getElementById('newIssueModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('issueTitleInput').focus();
    }
}

/**
 * Hide new issue modal
 */
function hideNewIssueModal() {
    const modal = document.getElementById('newIssueModal');
    if (modal) {
        modal.style.display = 'none';
        // Clear form
        document.getElementById('issueTitleInput').value = '';
        document.getElementById('issueBodyInput').value = '';
        document.getElementById('issueLabelsInput').value = '';
    }
}

/**
 * Create new issue
 */
async function createIssue() {
    const title = document.getElementById('issueTitleInput').value.trim();
    const body = document.getElementById('issueBodyInput').value.trim();
    const labelsInput = document.getElementById('issueLabelsInput').value.trim();
    const labels = labelsInput ? labelsInput.split(',').map(l => l.trim()) : [];

    if (!title) {
        alert('Issue title is required');
        return;
    }

    if (!currentProfile?.githubRepo) return;

    const { owner, repo } = currentProfile.githubRepo;

    try {
        const createBtn = document.getElementById('createIssueBtn');
        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';

        await window.electronAPI.githubCreateIssue(owner, repo, title, body, labels);
        
        hideNewIssueModal();
        await loadIssues('open');
    } catch (error) {
        console.error('Error creating issue:', error);
        alert('Failed to create issue: ' + error.message);
    } finally {
        const createBtn = document.getElementById('createIssueBtn');
        createBtn.disabled = false;
        createBtn.textContent = 'Create Issue';
    }
}
