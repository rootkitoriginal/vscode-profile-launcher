# GitHub API Integration

## Overview

The VS Code Profile Launcher integrates with GitHub's REST API to provide repository management, issue tracking, and branch operations. This integration is handled by the `GitHubService` class located in `src/services/GitHubService.ts`.

## Architecture

```
GitHubController → GitHubService → Octokit (GitHub REST API)
```

## Authentication

### Setting Up GitHub Token

1. Generate a personal access token at: https://github.com/settings/tokens
2. Required scopes:
   - `repo` - Full control of private repositories
   - `read:org` - Read org and team membership
   - `workflow` - Update GitHub Action workflows

3. Configure in application:
   ```javascript
   await window.electronAPI.updateGitHubToken('your_token_here');
   ```

### Checking Configuration Status

```javascript
const isConfigured = await window.electronAPI.isGitHubConfigured();
if (!isConfigured) {
    console.log('GitHub token not configured');
}
```

## API Operations

### 1. Repository Management

#### List Repositories

Get all repositories for a user or organization:

```javascript
const repos = await window.electronAPI.githubListRepos('username');
// Returns: Array<{
//   name: string,
//   fullName: string,
//   description: string,
//   defaultBranch: string
// }>
```

**Service Method:**
```typescript
public async listRepositories(): Promise<Array<{
    name: string;
    fullName: string;
    description: string;
    defaultBranch: string;
}>>
```

#### Validate Repository

Check if a repository exists and is accessible:

```javascript
const isValid = await window.electronAPI.githubValidateRepo('owner', 'repo');
// Returns: boolean
```

**Service Method:**
```typescript
public async validateRepository(owner: string, repo: string): Promise<boolean>
```

### 2. Issue Management

#### List Issues

Retrieve issues from a repository:

```javascript
const issues = await window.electronAPI.githubListIssues('owner', 'repo', 'open');
// state can be: 'open' | 'closed' | undefined (for all)
```

**Response Format:**
```typescript
interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body: string;
    state: 'open' | 'closed';
    labels: string[];
    assignee?: string;
    createdAt: string;
    updatedAt: string;
    htmlUrl: string;
}
```

**Service Method:**
```typescript
public async listIssues(
    owner: string,
    repo: string,
    state?: IssueState
): Promise<GitHubIssue[]>
```

#### Create Issue

Create a new issue in a repository:

```javascript
const issue = await window.electronAPI.githubCreateIssue(
    'owner',
    'repo',
    'Issue Title',
    'Issue body content',
    ['bug', 'enhancement'] // optional labels
);
```

**Service Method:**
```typescript
public async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels?: string[]
): Promise<GitHubIssue>
```

### 3. Branch Management

#### List Branches

Get all branches for a repository:

```javascript
const branches = await window.electronAPI.githubListBranches('owner', 'repo');
// Returns: string[] - array of branch names
```

**Service Method:**
```typescript
public async listBranches(owner: string, repo: string): Promise<string[]>
```

## Service Implementation

### Class: GitHubService

**Location:** `src/services/GitHubService.ts`

#### Initialization

```typescript
constructor() {
    this.initialize();
}

private async initialize() {
    const { Octokit } = await import('@octokit/rest');
    this.Octokit = Octokit;
    
    const token = config.getGitHubToken();
    if (token) {
        this.octokit = new Octokit({ auth: token });
    }
}
```

#### Token Management

```typescript
public async updateToken(token: string) {
    if (!this.Octokit) {
        await this.initialize();
    }
    
    if (this.Octokit) {
        this.octokit = new this.Octokit({ auth: token });
    }
}
```

## Controller Layer

### GitHubController

**Location:** `src/controllers/GitHubController.ts`

The controller provides business logic validation and orchestration:

```typescript
export class GitHubController {
    private githubService: GitHubService;
    
    constructor(githubService: GitHubService) {
        this.githubService = githubService;
    }
    
    // Methods delegate to service after validation
    public async listIssues(owner: string, repo: string, state?: IssueState) {
        return this.githubService.listIssues(owner, repo, state);
    }
}
```

## Error Handling

All GitHub API methods handle errors gracefully:

```javascript
try {
    const issues = await window.electronAPI.githubListIssues('owner', 'repo');
} catch (error) {
    if (error.status === 401) {
        console.error('Invalid GitHub token');
    } else if (error.status === 404) {
        console.error('Repository not found');
    } else {
        console.error('GitHub API error:', error);
    }
}
```

## Common Error Codes

- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Token doesn't have required permissions
- `404 Not Found` - Repository or resource doesn't exist
- `422 Unprocessable Entity` - Invalid request data
- `500 Internal Server Error` - GitHub API issue

## Rate Limiting

GitHub API has rate limits:
- **Authenticated requests**: 5,000 requests per hour
- **Unauthenticated**: 60 requests per hour

Check rate limit status:
```typescript
const rateLimit = await this.octokit.rateLimit.get();
console.log('Remaining:', rateLimit.data.rate.remaining);
console.log('Reset time:', new Date(rateLimit.data.rate.reset * 1000));
```

## Best Practices

1. **Always validate input** before making API calls
2. **Handle errors gracefully** with user-friendly messages
3. **Cache responses** when appropriate to reduce API calls
4. **Check rate limits** for high-volume operations
5. **Use specific scopes** - only request necessary permissions
6. **Store tokens securely** - never commit tokens to version control

## Testing

### Mock GitHub Service

For testing, create a mock service:

```typescript
class MockGitHubService implements GitHubService {
    async listIssues(): Promise<GitHubIssue[]> {
        return [
            {
                id: 1,
                number: 1,
                title: 'Test Issue',
                body: 'Test body',
                state: 'open',
                labels: ['bug'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                htmlUrl: 'https://github.com/test/repo/issues/1'
            }
        ];
    }
}
```

## Examples

### Complete Profile with GitHub Integration

```javascript
const profile = {
    name: 'My Project',
    language: 'TypeScript',
    description: 'Project with GitHub integration',
    githubRepo: {
        owner: 'myusername',
        repo: 'my-project',
        branch: 'main'
    }
};

const createdProfile = await window.electronAPI.createProfile(profile);
```

### Workflow: Create Issue from Profile

```javascript
// 1. Get profile with GitHub repo
const profile = await window.electronAPI.getProfile(profileId);

// 2. Create issue in the profile's repository
if (profile.githubRepo) {
    const issue = await window.electronAPI.githubCreateIssue(
        profile.githubRepo.owner,
        profile.githubRepo.repo,
        'Setup Development Environment',
        'Need to configure development environment for this profile',
        ['setup', 'documentation']
    );
    console.log('Created issue:', issue.htmlUrl);
}
```

## Related Documentation

- [MVC Architecture](../architecture/MVC-ARCHITECTURE.md)
- [Electron IPC](./electron-ipc.md)
- [GitHub REST API Docs](https://docs.github.com/en/rest)
- [Octokit.js Documentation](https://github.com/octokit/octokit.js)

## Security Considerations

1. **Token Storage**: Tokens are stored securely using Electron's safeStorage
2. **Token Transmission**: Never send tokens to untrusted sources
3. **Scope Limitation**: Only request necessary GitHub API scopes
4. **Token Expiration**: Handle expired tokens gracefully
5. **User Education**: Inform users about token generation and security

## Troubleshooting

### Token Not Working

1. Verify token has correct scopes
2. Check token hasn't expired
3. Ensure token is correctly configured:
   ```javascript
   const token = await window.electronAPI.getGitHubToken();
   console.log('Token configured:', token ? 'Yes' : 'No');
   ```

### Repository Not Found

1. Check repository name spelling
2. Verify you have access to the repository
3. For private repos, ensure token has `repo` scope

### Rate Limit Exceeded

1. Wait for rate limit reset
2. Implement caching for frequently accessed data
3. Consider using conditional requests with ETags
