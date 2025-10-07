# GitHub Repository Manager Window

A dedicated Electron window for managing GitHub repositories with a GitHub-inspired dark theme interface.

## Features

### Overview Tab

- Repository information (name, description, topics)
- Repository statistics (stars, watchers, forks, commits, branches, etc.)
- Language distribution visualization
- Recent activity (issues, pull requests, commits)
- Quick actions (Sync, Open in VSCode, AI Chat, Settings)

### Issues Tab

- List all issues (open, closed, or all)
- Filter by state
- View issue details
- Open issues on GitHub
- Open issues with AI Assistant

### Pull Requests Tab

- List all pull requests (open, closed, or all)
- Filter by state
- View PR details
- Open PRs on GitHub
- Open PRs with AI Assistant

### Commits Tab

- List recent commits
- View commit details
- Open commits on GitHub

### Branches Tab

- List all branches
- View branch protection status
- View last commit information
- Open branches on GitHub

### Settings Tab

- Repository-specific settings
- Configuration options

## Architecture

### Files

- `index.html` - Main HTML structure
- `styles.css` - GitHub-inspired dark theme styling
- `main.js` - Frontend logic and API calls

### Communication

- Uses IPC (Inter-Process Communication) via `window.githubWindowAPI`
- Secure context isolation with preload script (`src/preload-github-window.ts`)

### Window Management

- Persistent window state (position, size, maximized state)
- Managed by `WindowManager` and `WindowStateManager`
- Minimum size: 900x600px
- Default size: 1200x800px

## Usage

### Opening the Window

The window is opened when clicking on a profile card's GitHub icon if the profile has GitHub integration configured:

```javascript
await window.electronAPI.openGitHubRepoWindow(owner, repo);
```

### URL Parameters

The window receives repository information via URL query parameters:

- `owner` - Repository owner (user or organization)
- `repo` - Repository name

Example: `index.html?owner=rootkitoriginal&repo=vscode-profile-launcher`

## API Integration

### GitHub API Methods

All GitHub API calls are handled through the preload script:

```javascript
// Get repository data
await window.githubWindowAPI.getRepositoryData(owner, repo);

// Get issues
await window.githubWindowAPI.getIssues(owner, repo, state);

// Get pull requests
await window.githubWindowAPI.getPullRequests(owner, repo, state);

// Get commits
await window.githubWindowAPI.getCommits(owner, repo, page);

// Get branches
await window.githubWindowAPI.getBranches(owner, repo);

// Get detailed branches
await window.githubWindowAPI.getDetailedBranches(owner, repo);

// Get languages
await window.githubWindowAPI.getLanguages(owner, repo);

// Get contributors
await window.githubWindowAPI.getContributors(owner, repo);

// Open external link
await window.githubWindowAPI.openExternal(url);

// Open with AI Assistant
await window.githubWindowAPI.openIssueWithAI(issueUrl, issueTitle, issueBody);
```

## Styling

### Color Scheme

The window uses a GitHub-inspired dark theme with the following color palette:

- Primary Background: `#0d1117`
- Secondary Background: `#161b22`
- Tertiary Background: `#21262d`
- Border Color: `#30363d`
- Primary Text: `#c9d1d9`
- Secondary Text: `#8b949e`
- Link Color: `#58a6ff`
- Accent Green: `#238636`
- Accent Red: `#da3633`

### Components

- **Cards**: Rounded corners (6px), subtle borders
- **Buttons**: Primary (green), secondary (bordered), icon buttons
- **Tabs**: Bottom border on active tab
- **Badges**: Rounded, blue background for counts
- **Stats**: Grid layout with stat cards
- **Language Bar**: Horizontal bar with color-coded segments

## Security

### Content Security Policy

- Default: `'self'`
- Styles: `'self' 'unsafe-inline'`
- Scripts: `'self'`

### Context Isolation

- Enabled via preload script
- No direct access to Node.js APIs from renderer
- All IPC communication is controlled and validated

## Future Enhancements

### Planned Features

- [ ] AI Assistant window integration
- [ ] Create new issues/PRs from window
- [ ] Branch management (create, delete, merge)
- [ ] Code review interface
- [ ] Notification system for repository events
- [ ] Search functionality across issues/PRs/commits
- [ ] Repository activity timeline
- [ ] Contributor insights
- [ ] Code frequency graphs
- [ ] Webhook management

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm run test:unit
```

### Running

```bash
npm start
```

## Related Files

- `src/windows/WindowManager.ts` - Window creation and management
- `src/windows/WindowStateManager.ts` - Window state persistence
- `src/preload-github-window.ts` - Secure IPC bridge
- `src/main.ts` - IPC handlers and window lifecycle
- `src/services/GitHubService.ts` - GitHub API integration
