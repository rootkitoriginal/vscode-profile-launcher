# Electron IPC Communication

## Overview

The VS Code Profile Launcher uses Electron's Inter-Process Communication (IPC) to enable secure communication between the main process (Node.js backend) and renderer process (UI frontend).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Renderer Process (UI)                        │
│                       src/renderer/app.js                       │
│                                                                 │
│         window.electronAPI.method() → IPC Call                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Context Bridge (Secure)
                          │ src/preload.ts
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Main Process (Backend)                       │
│                        src/main.ts                              │
│                                                                 │
│              ipcMain.handle() → Controller → Service            │
└─────────────────────────────────────────────────────────────────┘
```

## Security Model

### Context Bridge

The `preload.ts` script creates a secure bridge using `contextBridge.exposeInMainWorld()`:

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
    // Exposed methods
    getProfiles: () => ipcRenderer.invoke('get-profiles'),
    createProfile: (data) => ipcRenderer.invoke('create-profile', data),
    // ... more methods
});
```

**Benefits:**
1. **Isolation**: Renderer process cannot access Node.js APIs directly
2. **Type Safety**: Fully typed API surface
3. **Security**: Only explicitly exposed methods are accessible
4. **Validation**: Arguments can be validated before sending

### Why This Approach?

- **Prevents XSS Attacks**: Malicious code in renderer can't access file system
- **Controlled Access**: Only specific operations are allowed
- **Type Safety**: TypeScript ensures correct usage
- **Audit Trail**: All IPC calls go through defined channels

## IPC Channels

### Profile Management

#### get-profiles

Get all profiles from database.

**Renderer:**
```javascript
const profiles = await window.electronAPI.getProfiles();
// Returns: Profile[]
```

**Main Process:**
```typescript
ipcMain.handle('get-profiles', async () => {
    return profileController.getAllProfiles();
});
```

#### create-profile

Create a new profile.

**Renderer:**
```javascript
const newProfile = await window.electronAPI.createProfile({
    name: 'My Profile',
    language: 'TypeScript',
    description: 'Development profile'
});
// Returns: Profile
```

**Main Process:**
```typescript
ipcMain.handle('create-profile', async (event, profileData: CreateProfileData) => {
    return profileController.createProfile(profileData);
});
```

#### update-profile

Update an existing profile.

**Renderer:**
```javascript
const updated = await window.electronAPI.updateProfile(profileId, {
    description: 'Updated description'
});
// Returns: Profile | null
```

**Main Process:**
```typescript
ipcMain.handle('update-profile', async (event, id: number, data: UpdateProfileData) => {
    return profileController.updateProfile(id, data);
});
```

#### delete-profile

Delete a profile.

**Renderer:**
```javascript
const success = await window.electronAPI.deleteProfile(profileId);
// Returns: boolean
```

**Main Process:**
```typescript
ipcMain.handle('delete-profile', async (event, id: number) => {
    return profileController.deleteProfile(id);
});
```

#### get-profile

Get a single profile by ID.

**Renderer:**
```javascript
const profile = await window.electronAPI.getProfile(profileId);
// Returns: Profile | null
```

**Main Process:**
```typescript
ipcMain.handle('get-profile', async (event, id: number) => {
    return profileController.getProfile(id);
});
```

### VS Code Operations

#### launch-vscode

Launch VS Code with a specific profile.

**Renderer:**
```javascript
const launched = await window.electronAPI.launchVSCode(profile);
// Returns: boolean
```

**Main Process:**
```typescript
ipcMain.handle('launch-vscode', async (event, profile: Profile) => {
    return launchVSCodeWithProfile(profile);
});
```

### AI Operations

#### get-ai-providers

Get list of all AI providers and models.

**Renderer:**
```javascript
const providers = await window.electronAPI.getAIProviders();
// Returns: AIProvider[]
```

**Main Process:**
```typescript
ipcMain.handle('get-ai-providers', async () => {
    return aiController.getAIProviders();
});
```

#### get-available-providers

Check which providers are configured.

**Renderer:**
```javascript
const available = await window.electronAPI.getAvailableProviders();
// Returns: Array<{ name: 'gemini' | 'openai', configured: boolean }>
```

**Main Process:**
```typescript
ipcMain.handle('get-available-providers', async () => {
    return aiController.getAvailableProviders();
});
```

#### generate-code-template

Generate code template for a project.

**Renderer:**
```javascript
const template = await window.electronAPI.generateCodeTemplate(
    'TypeScript',
    'MyProject',
    'A web app',
    'gemini',
    'gemini-1.5-flash'
);
// Returns: AIResponse
```

**Main Process:**
```typescript
ipcMain.handle('generate-code-template', async (
    event,
    language: string,
    projectName: string,
    description?: string,
    preferredProvider?: 'gemini' | 'openai',
    preferredModel?: string
) => {
    return aiController.generateCodeTemplate(
        language,
        projectName,
        description,
        preferredProvider,
        preferredModel
    );
});
```

#### generate-code

Generate code from custom prompt.

**Renderer:**
```javascript
const result = await window.electronAPI.generateCode({
    prompt: 'Create a validation function',
    provider: 'gemini',
    model: 'gemini-1.5-flash'
});
// Returns: AIResponse
```

**Main Process:**
```typescript
ipcMain.handle('generate-code', async (event, request: AIRequest) => {
    return aiController.generateCode(request);
});
```

### Configuration Management

#### get-config

Get application configuration.

**Renderer:**
```javascript
const config = await window.electronAPI.getConfig();
// Returns: Config object
```

**Main Process:**
```typescript
ipcMain.handle('get-config', async () => {
    return settingsController.getConfig();
});
```

#### get-api-keys

Get configured API keys.

**Renderer:**
```javascript
const keys = await window.electronAPI.getApiKeys();
// Returns: { geminiApiKey: string, openaiApiKey: string }
```

**Main Process:**
```typescript
ipcMain.handle('get-api-keys', async () => {
    return settingsController.getApiKeys();
});
```

#### update-api-key

Update an AI provider API key.

**Renderer:**
```javascript
const success = await window.electronAPI.updateApiKey('gemini', 'new_key');
// Returns: boolean
```

**Main Process:**
```typescript
ipcMain.handle('update-api-key', async (
    event,
    provider: 'gemini' | 'openai',
    apiKey: string
) => {
    return settingsController.updateApiKey(provider, apiKey);
});
```

#### get-profile-paths

Get VS Code profile directory paths.

**Renderer:**
```javascript
const paths = await window.electronAPI.getProfilePaths('MyProfile');
// Returns: { baseDir: string, dataDir: string, extensionsDir: string }
```

**Main Process:**
```typescript
ipcMain.handle('get-profile-paths', async (event, profileName: string) => {
    return settingsController.getProfilePaths(profileName);
});
```

### GitHub Operations

#### update-github-token

Set or update GitHub access token.

**Renderer:**
```javascript
const success = await window.electronAPI.updateGitHubToken('ghp_xxx');
// Returns: boolean
```

**Main Process:**
```typescript
ipcMain.handle('update-github-token', async (event, token: string) => {
    return settingsController.updateGitHubToken(token);
});
```

#### get-github-token

Get current GitHub token.

**Renderer:**
```javascript
const token = await window.electronAPI.getGitHubToken();
// Returns: string
```

**Main Process:**
```typescript
ipcMain.handle('get-github-token', async () => {
    return settingsController.getGitHubToken();
});
```

#### is-github-configured

Check if GitHub is configured.

**Renderer:**
```javascript
const configured = await window.electronAPI.isGitHubConfigured();
// Returns: boolean
```

**Main Process:**
```typescript
ipcMain.handle('is-github-configured', async () => {
    return githubController.isConfigured();
});
```

#### github-list-issues

List issues from a repository.

**Renderer:**
```javascript
const issues = await window.electronAPI.githubListIssues('owner', 'repo', 'open');
// Returns: GitHubIssue[]
```

**Main Process:**
```typescript
ipcMain.handle('github-list-issues', async (
    event,
    owner: string,
    repo: string,
    state?: 'open' | 'closed'
) => {
    return githubController.listIssues(owner, repo, state);
});
```

#### github-create-issue

Create a new issue.

**Renderer:**
```javascript
const issue = await window.electronAPI.githubCreateIssue(
    'owner',
    'repo',
    'Issue Title',
    'Body text',
    ['bug', 'feature']
);
// Returns: GitHubIssue
```

**Main Process:**
```typescript
ipcMain.handle('github-create-issue', async (
    event,
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels?: string[]
) => {
    return githubController.createIssue(owner, repo, title, body, labels);
});
```

#### github-list-branches

List branches in a repository.

**Renderer:**
```javascript
const branches = await window.electronAPI.githubListBranches('owner', 'repo');
// Returns: string[]
```

**Main Process:**
```typescript
ipcMain.handle('github-list-branches', async (
    event,
    owner: string,
    repo: string
) => {
    return githubController.listBranches(owner, repo);
});
```

#### github-validate-repo

Validate repository exists and is accessible.

**Renderer:**
```javascript
const isValid = await window.electronAPI.githubValidateRepo('owner', 'repo');
// Returns: boolean
```

**Main Process:**
```typescript
ipcMain.handle('github-validate-repo', async (
    event,
    owner: string,
    repo: string
) => {
    return githubController.validateRepository(owner, repo);
});
```

#### github-list-repos

List repositories for a user/org.

**Renderer:**
```javascript
const repos = await window.electronAPI.githubListRepos('username');
// Returns: Array<{ name, fullName, description, defaultBranch }>
```

**Main Process:**
```typescript
ipcMain.handle('github-list-repos', async (event, owner: string) => {
    return githubController.listRepositories(owner);
});
```

### System Operations

#### select-directory

Open directory picker dialog.

**Renderer:**
```javascript
const dirPath = await window.electronAPI.selectDirectory();
// Returns: string | null
```

**Main Process:**
```typescript
ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    return result.canceled ? null : result.filePaths[0];
});
```

## Type Safety

### TypeScript Definitions

All IPC methods are fully typed in `src/preload.ts`:

```typescript
declare global {
    interface Window {
        electronAPI: {
            getProfiles: () => Promise<Profile[]>;
            createProfile: (data: CreateProfileData) => Promise<Profile>;
            // ... all other methods with full types
        };
    }
}
```

### Runtime Validation

Consider adding runtime validation for IPC arguments:

```typescript
import { z } from 'zod';

const CreateProfileSchema = z.object({
    name: z.string().min(1).max(100),
    language: z.string(),
    description: z.string().optional()
});

ipcMain.handle('create-profile', async (event, profileData) => {
    // Validate input
    const validated = CreateProfileSchema.parse(profileData);
    return profileController.createProfile(validated);
});
```

## Error Handling

### In Renderer

```javascript
try {
    const profile = await window.electronAPI.createProfile(data);
    console.log('Profile created:', profile);
} catch (error) {
    console.error('Failed to create profile:', error);
    // Show user-friendly error message
}
```

### In Main Process

```typescript
ipcMain.handle('create-profile', async (event, profileData) => {
    try {
        return await profileController.createProfile(profileData);
    } catch (error) {
        console.error('IPC error:', error);
        throw error; // Propagate to renderer
    }
});
```

## Best Practices

### 1. Always Use invoke/handle

```typescript
// ✅ Good - Two-way communication with response
ipcMain.handle('get-data', async () => {
    return await fetchData();
});

// ❌ Bad - One-way, no response
ipcMain.on('get-data', (event) => {
    // Can't return data easily
});
```

### 2. Validate Input

```typescript
ipcMain.handle('delete-profile', async (event, id: number) => {
    if (typeof id !== 'number' || id < 1) {
        throw new Error('Invalid profile ID');
    }
    return profileController.deleteProfile(id);
});
```

### 3. Keep Preload Minimal

Only expose necessary methods, don't expose entire modules:

```typescript
// ✅ Good - Minimal, specific API
contextBridge.exposeInMainWorld('electronAPI', {
    getProfiles: () => ipcRenderer.invoke('get-profiles')
});

// ❌ Bad - Too much access
contextBridge.exposeInMainWorld('fs', require('fs'));
```

### 4. Use TypeScript

Always define types for better IDE support and type safety:

```typescript
interface ElectronAPI {
    getProfiles: () => Promise<Profile[]>;
    createProfile: (data: CreateProfileData) => Promise<Profile>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
```

### 5. Handle Async Properly

```javascript
// ✅ Good - Proper async/await
async function loadProfiles() {
    try {
        const profiles = await window.electronAPI.getProfiles();
        renderProfiles(profiles);
    } catch (error) {
        handleError(error);
    }
}

// ❌ Bad - Unhandled promise
window.electronAPI.getProfiles()
    .then(renderProfiles); // Missing error handling
```

## Testing IPC

### Mock electronAPI

```typescript
// In test setup
global.window = {
    electronAPI: {
        getProfiles: jest.fn().mockResolvedValue([]),
        createProfile: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
        // ... other mocks
    }
};
```

### Test Main Process Handlers

```typescript
import { ipcMain } from 'electron';

describe('IPC Handlers', () => {
    it('should handle get-profiles', async () => {
        // Trigger handler
        const result = await ipcMain.handle('get-profiles', {});
        expect(result).toBeInstanceOf(Array);
    });
});
```

## Performance Considerations

### 1. Batch Operations

```javascript
// ✅ Good - Single call
const profiles = await window.electronAPI.getProfiles();
profiles.forEach(renderProfile);

// ❌ Bad - Multiple IPC calls
for (let id of profileIds) {
    const profile = await window.electronAPI.getProfile(id);
    renderProfile(profile);
}
```

### 2. Cache When Appropriate

```javascript
let cachedProfiles = null;

async function getProfiles(forceRefresh = false) {
    if (!cachedProfiles || forceRefresh) {
        cachedProfiles = await window.electronAPI.getProfiles();
    }
    return cachedProfiles;
}
```

### 3. Debounce Frequent Calls

```javascript
import { debounce } from 'lodash';

const saveProfileDebounced = debounce(async (id, data) => {
    await window.electronAPI.updateProfile(id, data);
}, 500);
```

## Security Checklist

- [ ] Use `contextBridge` - never `nodeIntegration: true`
- [ ] Validate all input in main process
- [ ] Don't expose sensitive APIs directly
- [ ] Use TypeScript for type safety
- [ ] Implement proper error handling
- [ ] Log security-relevant operations
- [ ] Never send sensitive data unnecessarily
- [ ] Sanitize user input before processing

## Related Documentation

- [MVC Architecture](../architecture/MVC-ARCHITECTURE.md)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Context Bridge](https://www.electronjs.org/docs/latest/api/context-bridge)
- [IPC Main](https://www.electronjs.org/docs/latest/api/ipc-main)
- [IPC Renderer](https://www.electronjs.org/docs/latest/api/ipc-renderer)

## Troubleshooting

### IPC Call Not Working

1. Check method is exposed in `preload.ts`
2. Verify handler exists in `main.ts`
3. Check channel names match exactly
4. Ensure preload script is loaded

### Type Errors

1. Verify TypeScript definitions in `preload.ts`
2. Check `tsconfig.json` includes declaration files
3. Restart TypeScript server in IDE

### Security Errors

1. Never use `nodeIntegration: true`
2. Always use `contextBridge`
3. Enable `contextIsolation: true`
4. Set `sandbox: true` when possible
