// GitHub Repository Manager - Main JavaScript
// PR #14: Implement GitHub Repository Manager

let currentRepo = null;
let currentOwner = null;
let currentTab = 'overview';
let connectionStatus = {
    mainProcess: false,
    github: false,
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('GitHub window initializing...');
    initializeWindow();
    setupEventListeners();
    checkMainProcessConnection();
    loadRepositoryFromURL();

    // Notificar o processo principal que a janela está pronta
    window.githubWindowAPI
        .notifyWindowReady()
        .then(() => {
            connectionStatus.mainProcess = true;
            console.log('Main process connection established');
        })
        .catch(err => {
            console.error('Failed to connect to main process:', err);
            showError('Failed to connect to main process. Please restart the application.');
        });
});

/**
 * Initialize window and check GitHub configuration
 */
async function initializeWindow() {
    try {
        const isConfigured = await window.githubWindowAPI.isGitHubConfigured();
        if (!isConfigured) {
            showError('GitHub is not configured. Please configure GitHub token in settings.');
            return;
        }

        // Verificar status da autenticação do GitHub
        const authStatus = await window.githubWindowAPI.getGitHubAuthStatus();
        connectionStatus.github = authStatus.isAuthenticated;

        if (authStatus.isAuthenticated) {
            console.log(`GitHub authenticated as ${authStatus.username}`);
            document.getElementById('github-user').textContent = authStatus.username;
            if (authStatus.avatar) {
                document.getElementById('github-avatar').src = authStatus.avatar;
                document.getElementById('github-avatar').style.display = 'block';
            }
        } else {
            showError('GitHub authentication failed. Please check your token.');
        }
    } catch (error) {
        console.error('Failed to check GitHub configuration:', error);
        showError('Failed to check GitHub configuration');
    }
}

/**
 * Verifica conexão com o processo principal
 */
async function checkMainProcessConnection() {
    try {
        const pingResult = await window.githubWindowAPI.ping();
        connectionStatus.mainProcess = pingResult === 'pong';
        console.log(`Main process connection: ${connectionStatus.mainProcess ? 'OK' : 'Failed'}`);

        if (!connectionStatus.mainProcess) {
            showError('Failed to connect to main process. Some features may not work properly.');
        }
    } catch (error) {
        console.error('Connection check failed:', error);
        connectionStatus.mainProcess = false;
        showError('Connection to main process failed. Please restart the application.');
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Window controls
    document.getElementById('btnClose').addEventListener('click', () => {
        window.githubWindowAPI.closeWindow();
    });

    document.getElementById('btnMinimize').addEventListener('click', () => {
        window.githubWindowAPI.minimizeWindow();
    });

    document.getElementById('btnMaximize').addEventListener('click', () => {
        window.githubWindowAPI.maximizeWindow();
    });

    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Quick actions
    document.getElementById('btnSync').addEventListener('click', () => {
        if (currentOwner && currentRepo) {
            loadRepositoryData(currentOwner, currentRepo);
        }
    });

    document.getElementById('btnOpenVSCode').addEventListener('click', () => {
        // TODO: Implement open in VSCode
        showNotification('Opening in VSCode...', 'info');
    });

    document.getElementById('btnAIChat').addEventListener('click', () => {
        // TODO: Implement AI chat
        showNotification('Opening AI Chat...', 'info');
    });

    document.getElementById('btnRepoSettings').addEventListener('click', () => {
        switchTab('settings');
    });

    // External links
    document.getElementById('repoUrl').addEventListener('click', e => {
        e.preventDefault();
        window.githubWindowAPI.openExternal(e.target.href);
    });

    // Filter buttons for issues and PRs
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const state = btn.dataset.state;
            const parent = btn.parentElement;
            parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Reload data based on tab
            if (currentTab === 'issues') {
                loadIssues(currentOwner, currentRepo, state);
            } else if (currentTab === 'pullrequests') {
                loadPullRequests(currentOwner, currentRepo, state);
            }
        });
    });
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load tab-specific data
    if (currentOwner && currentRepo) {
        loadTabData(tabName);
    }
}

/**
 * Load data for specific tab
 */
async function loadTabData(tabName) {
    switch (tabName) {
        case 'issues':
            await loadIssues(currentOwner, currentRepo, 'open');
            break;
        case 'pullrequests':
            await loadPullRequests(currentOwner, currentRepo, 'open');
            break;
        case 'commits':
            await loadCommits(currentOwner, currentRepo);
            break;
        case 'branches':
            await loadBranches(currentOwner, currentRepo);
            break;
    }
}

/**
 * Load repository data from URL parameters or storage
 */
function loadRepositoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const owner = urlParams.get('owner');
    const repo = urlParams.get('repo');

    if (owner && repo) {
        loadRepositoryData(owner, repo);
    } else {
        showError('No repository specified');
    }
}

/**
 * Load complete repository data
 */
async function loadRepositoryData(owner, repo) {
    currentOwner = owner;
    currentRepo = repo;

    showLoading(true);

    try {
        // Load repository basic info
        const repoData = await window.githubWindowAPI.getRepositoryData(owner, repo);

        if (repoData.success) {
            displayRepositoryInfo(repoData.data);
            await loadStatistics(owner, repo);
            await loadRecentActivity(owner, repo);
        } else {
            showError(`Failed to load repository: ${repoData.error}`);
        }
    } catch (error) {
        console.error('Failed to load repository:', error);
        showError('Failed to load repository data');
    } finally {
        showLoading(false);
    }
}

/**
 * Display repository basic information
 */
function displayRepositoryInfo(repo) {
    // Header
    document.getElementById('repoFullName').textContent = repo.full_name;
    document.getElementById('visibility').textContent = repo.private ? '🔒 Private' : '🌍 Public';

    // About section
    document.getElementById('repoDescription').textContent =
        repo.description || 'No description provided';

    // Topics
    const topicsContainer = document.getElementById('repoTopics');
    topicsContainer.innerHTML = '';
    if (repo.topics && repo.topics.length > 0) {
        repo.topics.forEach(topic => {
            const topicElement = document.createElement('span');
            topicElement.className = 'topic';
            topicElement.textContent = topic;
            topicsContainer.appendChild(topicElement);
        });
    }

    // Links and meta
    const repoUrl = document.getElementById('repoUrl');
    repoUrl.href = repo.html_url;
    repoUrl.textContent = `🔗 ${repo.html_url}`;

    document.getElementById('repoLicense').textContent =
        `📜 License: ${repo.license?.name || 'None'}`;
    document.getElementById('repoCreated').textContent =
        `📅 Created: ${formatDate(repo.created_at)}`;
    document.getElementById('repoUpdated').textContent = `Updated: ${formatDate(repo.updated_at)}`;
    document.getElementById('repoLanguage').textContent = `Language: ${repo.language || 'N/A'}`;

    // Basic stats
    document.getElementById('statStars').textContent = repo.stargazers_count || 0;
    document.getElementById('statWatchers').textContent = repo.watchers_count || 0;
    document.getElementById('statForks').textContent = repo.forks_count || 0;
    document.getElementById('statSize').textContent = formatBytes(repo.size * 1024);
}

/**
 * Load repository statistics
 */
async function loadStatistics(owner, repo) {
    try {
        // Load branches count
        const branches = await window.githubWindowAPI.getBranches(owner, repo);
        if (branches.success) {
            document.getElementById('statBranches').textContent = branches.data.length;
        }

        // Load commits count (from first page)
        const commits = await window.githubWindowAPI.getCommits(owner, repo, 1);
        if (commits.success) {
            document.getElementById('statCommits').textContent =
                commits.data.length > 0 ? '100+' : commits.data.length;
        }

        // Load language statistics
        const languages = await window.githubWindowAPI.getLanguages(owner, repo);
        if (languages.success) {
            displayLanguageBar(languages.data);
        }

        // Load issues count
        const issues = await window.githubWindowAPI.getIssues(owner, repo, 'open');
        if (issues.success) {
            document.getElementById('issuesCount').textContent = issues.data.length;
        }

        // Load PRs count
        const prs = await window.githubWindowAPI.getPullRequests(owner, repo, 'open');
        if (prs.success) {
            document.getElementById('prsCount').textContent = prs.data.length;
        }
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

/**
 * Display language bar
 */
function displayLanguageBar(languages) {
    const languageBar = document.getElementById('languageBar');

    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

    const barFill = document.createElement('div');
    barFill.className = 'language-bar-fill';

    const labels = document.createElement('div');
    labels.className = 'language-labels';

    const colors = {
        TypeScript: '#3178c6',
        JavaScript: '#f1e05a',
        Python: '#3572A5',
        Java: '#b07219',
        Go: '#00ADD8',
        Rust: '#dea584',
        CSS: '#563d7c',
        HTML: '#e34c26',
    };

    Object.entries(languages).forEach(([lang, bytes]) => {
        const percentage = ((bytes / total) * 100).toFixed(1);
        const color = colors[lang] || '#' + Math.floor(Math.random() * 16777215).toString(16);

        // Bar segment
        const segment = document.createElement('div');
        segment.className = 'language-segment';
        segment.style.width = `${percentage}%`;
        segment.style.backgroundColor = color;
        barFill.appendChild(segment);

        // Label
        const label = document.createElement('div');
        label.className = 'language-label';
        label.innerHTML = `
            <span class="language-dot" style="background-color: ${color}"></span>
            <span>${lang} ${percentage}%</span>
        `;
        labels.appendChild(label);
    });

    languageBar.innerHTML = '';
    languageBar.appendChild(barFill);
    languageBar.appendChild(labels);
}

/**
 * Load recent activity (issues and PRs)
 */
async function loadRecentActivity(owner, repo) {
    const activityContainer = document.getElementById('recentActivity');
    activityContainer.innerHTML = '<div class="activity-loading">Loading activity...</div>';

    try {
        const [issuesResult, prsResult] = await Promise.all([
            window.githubWindowAPI.getIssues(owner, repo, 'all'),
            window.githubWindowAPI.getPullRequests(owner, repo, 'all'),
        ]);

        const activities = [];

        if (issuesResult.success) {
            issuesResult.data.slice(0, 3).forEach(issue => {
                activities.push({ type: 'issue', data: issue });
            });
        }

        if (prsResult.success) {
            prsResult.data.slice(0, 2).forEach(pr => {
                activities.push({ type: 'pr', data: pr });
            });
        }

        // Sort by date
        activities.sort((a, b) => new Date(b.data.updated_at) - new Date(a.data.updated_at));

        if (activities.length === 0) {
            activityContainer.innerHTML = '<div class="activity-loading">No recent activity</div>';
            return;
        }

        activityContainer.innerHTML = '';
        activities.slice(0, 5).forEach(activity => {
            const element = createActivityElement(activity);
            activityContainer.appendChild(element);
        });
    } catch (error) {
        console.error('Failed to load recent activity:', error);
        activityContainer.innerHTML = '<div class="activity-loading">Failed to load activity</div>';
    }
}

/**
 * Create activity element
 */
function createActivityElement(activity) {
    const { type, data } = activity;
    const div = document.createElement('div');
    div.className = 'activity-item';

    const icon = type === 'issue' ? '📋' : '🔀';
    const stateColor =
        data.state === 'open' ? '#238636' : data.state === 'closed' ? '#da3633' : '#8b949e';

    div.innerHTML = `
        <div class="activity-header">
            <div class="activity-title">${icon} ${data.title}</div>
        </div>
        <div class="activity-meta">
            <span style="color: ${stateColor}">● ${data.state}</span> • 
            #${data.number} • 
            ${formatDate(data.updated_at)} • 
            ${data.user?.login || 'Unknown'}
        </div>
        ${data.body ? `<div class="activity-body">${truncateText(data.body, 150)}</div>` : ''}
        <div class="activity-actions">
            <button class="btn-secondary" onclick="openInBrowser('${data.html_url}')">View on GitHub</button>
            <button class="btn-secondary" onclick="openWithAI('${data.html_url}', '${escapeHtml(data.title)}', '${escapeHtml(data.body || '')}')">🤖 Open with AI</button>
        </div>
    `;

    return div;
}

/**
 * Load issues
 */
async function loadIssues(owner, repo, state = 'open') {
    const issuesList = document.getElementById('issuesList');
    issuesList.innerHTML = '<div class="loading">Loading issues...</div>';

    try {
        const result = await window.githubWindowAPI.getIssues(owner, repo, state);

        if (result.success) {
            if (result.data.length === 0) {
                issuesList.innerHTML = '<div class="loading">No issues found</div>';
                return;
            }

            issuesList.innerHTML = '';
            result.data.forEach(issue => {
                const element = createIssueElement(issue);
                issuesList.appendChild(element);
            });
        } else {
            issuesList.innerHTML = `<div class="loading">Failed to load issues: ${result.error}</div>`;
        }
    } catch (error) {
        console.error('Failed to load issues:', error);
        issuesList.innerHTML = '<div class="loading">Failed to load issues</div>';
    }
}

/**
 * Create issue element
 */
function createIssueElement(issue) {
    const div = document.createElement('div');
    div.className = 'item';

    const stateColor = issue.state === 'open' ? '#238636' : '#da3633';

    div.innerHTML = `
        <div class="item-header">
            <div class="item-title">${issue.title}</div>
            <div class="item-number">#${issue.number}</div>
        </div>
        <div class="item-meta">
            <span style="color: ${stateColor}">● ${issue.state}</span>
            <span>Opened ${formatDate(issue.created_at)}</span>
            <span>by ${issue.user?.login || 'Unknown'}</span>
            ${issue.comments > 0 ? `<span>💬 ${issue.comments} comments</span>` : ''}
        </div>
        ${
            issue.labels && issue.labels.length > 0
                ? `
            <div class="item-labels">
                ${issue.labels.map(label => `<span class="label" style="background-color: #${label.color}; color: ${getContrastColor(label.color)}">${label.name}</span>`).join('')}
            </div>
        `
                : ''
        }
        ${issue.body ? `<div class="item-body">${truncateText(issue.body, 200)}</div>` : ''}
        <div class="item-actions">
            <button class="btn-secondary" onclick="openInBrowser('${issue.html_url}')">View on GitHub</button>
            <button class="btn-secondary" onclick="openWithAI('${issue.html_url}', '${escapeHtml(issue.title)}', '${escapeHtml(issue.body || '')}')">🤖 Open with AI</button>
        </div>
    `;

    return div;
}

/**
 * Load pull requests
 */
async function loadPullRequests(owner, repo, state = 'open') {
    const prsList = document.getElementById('prsList');
    prsList.innerHTML = '<div class="loading">Loading pull requests...</div>';

    try {
        const result = await window.githubWindowAPI.getPullRequests(owner, repo, state);

        if (result.success) {
            if (result.data.length === 0) {
                prsList.innerHTML = '<div class="loading">No pull requests found</div>';
                return;
            }

            prsList.innerHTML = '';
            result.data.forEach(pr => {
                const element = createPRElement(pr);
                prsList.appendChild(element);
            });
        } else {
            prsList.innerHTML = `<div class="loading">Failed to load pull requests: ${result.error}</div>`;
        }
    } catch (error) {
        console.error('Failed to load pull requests:', error);
        prsList.innerHTML = '<div class="loading">Failed to load pull requests</div>';
    }
}

/**
 * Create PR element
 */
function createPRElement(pr) {
    const div = document.createElement('div');
    div.className = 'item';

    const stateColor = pr.state === 'open' ? '#238636' : pr.merged ? '#8b949e' : '#da3633';
    const stateText = pr.merged ? 'merged' : pr.state;

    div.innerHTML = `
        <div class="item-header">
            <div class="item-title">${pr.title}</div>
            <div class="item-number">#${pr.number}</div>
        </div>
        <div class="item-meta">
            <span style="color: ${stateColor}">● ${stateText}</span>
            <span>Opened ${formatDate(pr.created_at)}</span>
            <span>by ${pr.user?.login || 'Unknown'}</span>
            ${pr.comments > 0 ? `<span>💬 ${pr.comments} comments</span>` : ''}
        </div>
        ${
            pr.labels && pr.labels.length > 0
                ? `
            <div class="item-labels">
                ${pr.labels.map(label => `<span class="label" style="background-color: #${label.color}; color: ${getContrastColor(label.color)}">${label.name}</span>`).join('')}
            </div>
        `
                : ''
        }
        ${pr.body ? `<div class="item-body">${truncateText(pr.body, 200)}</div>` : ''}
        <div class="item-actions">
            <button class="btn-secondary" onclick="openInBrowser('${pr.html_url}')">View on GitHub</button>
            <button class="btn-secondary" onclick="openWithAI('${pr.html_url}', '${escapeHtml(pr.title)}', '${escapeHtml(pr.body || '')}')">🤖 Open with AI</button>
        </div>
    `;

    return div;
}

/**
 * Load commits
 */
async function loadCommits(owner, repo) {
    const commitsList = document.getElementById('commitsList');
    commitsList.innerHTML = '<div class="loading">Loading commits...</div>';

    try {
        const result = await window.githubWindowAPI.getCommits(owner, repo, 1);

        if (result.success) {
            if (result.data.length === 0) {
                commitsList.innerHTML = '<div class="loading">No commits found</div>';
                return;
            }

            commitsList.innerHTML = '';
            result.data.forEach(commit => {
                const element = createCommitElement(commit);
                commitsList.appendChild(element);
            });
        } else {
            commitsList.innerHTML = `<div class="loading">Failed to load commits: ${result.error}</div>`;
        }
    } catch (error) {
        console.error('Failed to load commits:', error);
        commitsList.innerHTML = '<div class="loading">Failed to load commits</div>';
    }
}

/**
 * Create commit element
 */
function createCommitElement(commit) {
    const div = document.createElement('div');
    div.className = 'item';

    div.innerHTML = `
        <div class="item-header">
            <div class="item-title">${commit.commit.message.split('\n')[0]}</div>
            <div class="item-number">${commit.sha.substring(0, 7)}</div>
        </div>
        <div class="item-meta">
            <span>${formatDate(commit.commit.author.date)}</span>
            <span>by ${commit.commit.author.name}</span>
        </div>
        <div class="item-actions">
            <button class="btn-secondary" onclick="openInBrowser('${commit.html_url}')">View on GitHub</button>
        </div>
    `;

    return div;
}

/**
 * Load branches
 */
async function loadBranches(owner, repo) {
    const branchesList = document.getElementById('branchesList');
    branchesList.innerHTML = '<div class="loading">Loading branches...</div>';

    try {
        const result = await window.githubWindowAPI.getDetailedBranches(owner, repo);

        if (result.success) {
            if (result.data.length === 0) {
                branchesList.innerHTML = '<div class="loading">No branches found</div>';
                return;
            }

            branchesList.innerHTML = '';
            result.data.forEach(branch => {
                const element = createBranchElement(branch);
                branchesList.appendChild(element);
            });
        } else {
            branchesList.innerHTML = `<div class="loading">Failed to load branches: ${result.error}</div>`;
        }
    } catch (error) {
        console.error('Failed to load branches:', error);
        branchesList.innerHTML = '<div class="loading">Failed to load branches</div>';
    }
}

/**
 * Create branch element
 */
function createBranchElement(branch) {
    const div = document.createElement('div');
    div.className = 'item';

    div.innerHTML = `
        <div class="item-header">
            <div class="item-title">🌿 ${branch.name}</div>
        </div>
        <div class="item-meta">
            ${branch.protected ? '<span>🔒 Protected</span>' : ''}
            <span>Last commit: ${formatDate(branch.commit?.commit?.author?.date || '')}</span>
        </div>
        <div class="item-actions">
            <button class="btn-secondary" onclick="openInBrowser('https://github.com/${currentOwner}/${currentRepo}/tree/${branch.name}')">View on GitHub</button>
        </div>
    `;

    return div;
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ');
}

function getContrastColor(hexColor) {
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    // TODO: Implement proper error notification
    console.error(message);
    alert(message);
}

function showNotification(message, type = 'info') {
    // TODO: Implement proper notification system
    console.log(`[${type}] ${message}`);
}

// Global functions for inline handlers
function openInBrowser(url) {
    window.githubWindowAPI.openExternal(url);
}

function openWithAI(url, title, body) {
    window.githubWindowAPI.openIssueWithAI(url, title, body);
}
