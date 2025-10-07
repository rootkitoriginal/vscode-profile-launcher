import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods for GitHub window
contextBridge.exposeInMainWorld('githubWindowAPI', {
    // Get repository data
    getRepositoryData: (owner: string, repo: string) =>
        ipcRenderer.invoke('github-get-repository-data', owner, repo),

    // Get issues
    getIssues: (owner: string, repo: string, state?: 'open' | 'closed' | 'all') =>
        ipcRenderer.invoke('github-list-issues', owner, repo, state),

    // Get pull requests
    getPullRequests: (owner: string, repo: string, state?: 'open' | 'closed' | 'all') =>
        ipcRenderer.invoke('github-get-pull-requests', owner, repo, state),

    // Get commits
    getCommits: (owner: string, repo: string, page?: number) =>
        ipcRenderer.invoke('github-get-commits', owner, repo, page),

    // Get branches
    getBranches: (owner: string, repo: string) =>
        ipcRenderer.invoke('github-list-branches', owner, repo),

    // Get detailed branches
    getDetailedBranches: (owner: string, repo: string) =>
        ipcRenderer.invoke('github-get-detailed-branches', owner, repo),

    // Get repository stats
    getRepositoryStats: (owner: string, repo: string) =>
        ipcRenderer.invoke('github-get-repository-stats', owner, repo),

    // Get languages
    getLanguages: (owner: string, repo: string) =>
        ipcRenderer.invoke('github-get-languages', owner, repo),

    // Get contributors
    getContributors: (owner: string, repo: string) =>
        ipcRenderer.invoke('github-get-contributors', owner, repo),

    // Open issue in AI window
    openIssueWithAI: (issueUrl: string, issueTitle: string, issueBody: string) =>
        ipcRenderer.invoke('open-ai-assistant-window', issueUrl, issueTitle, issueBody),

    // Check if GitHub is configured
    isGitHubConfigured: () => ipcRenderer.invoke('is-github-configured'),

    // Get GitHub token
    getGitHubToken: () => ipcRenderer.invoke('get-github-token'),

    // Open external link
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

    // Open in VSCode
    openInVSCode: (path: string) => ipcRenderer.invoke('open-in-vscode', path),

    // Window controls
    closeWindow: () => ipcRenderer.invoke('close-github-window'),
    minimizeWindow: () => ipcRenderer.invoke('minimize-github-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-github-window'),

    // Listen to window events
    onRepositoryChange: (callback: (data: any) => void) => {
        ipcRenderer.on('github-window-repository-changed', (_event, data) => callback(data));
    },
});
