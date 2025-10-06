import { contextBridge, ipcRenderer } from 'electron';
import { Profile, CreateProfileData, UpdateProfileData } from './types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Profile management
    getProfiles: (): Promise<Profile[]> => ipcRenderer.invoke('get-profiles'),

    createProfile: (profileData: CreateProfileData): Promise<Profile> =>
        ipcRenderer.invoke('create-profile', profileData),

    updateProfile: (id: number, profileData: UpdateProfileData): Promise<Profile | null> =>
        ipcRenderer.invoke('update-profile', id, profileData),

    deleteProfile: (id: number): Promise<boolean> => ipcRenderer.invoke('delete-profile', id),

    getProfile: (id: number): Promise<Profile | null> => ipcRenderer.invoke('get-profile', id),

    // VS Code launch
    launchVSCode: (profile: Profile): Promise<boolean> =>
        ipcRenderer.invoke('launch-vscode', profile),

    // AI and configuration
    getAIProviders: (): Promise<any[]> => ipcRenderer.invoke('get-ai-providers'),

    getConfig: (): Promise<any> => ipcRenderer.invoke('get-config'),

    updateApiKey: (provider: 'gemini' | 'openai', apiKey: string): Promise<boolean> =>
        ipcRenderer.invoke('update-api-key', provider, apiKey),

    generateCodeTemplate: (
        language: string,
        projectName: string,
        description?: string,
        preferredProvider?: 'gemini' | 'openai',
        preferredModel?: string
    ): Promise<any> =>
        ipcRenderer.invoke(
            'generate-code-template',
            language,
            projectName,
            description,
            preferredProvider,
            preferredModel
        ),

    generateCode: (request: any): Promise<any> => ipcRenderer.invoke('generate-code', request),

    getAvailableProviders: (): Promise<Array<{ name: 'gemini' | 'openai'; configured: boolean }>> =>
        ipcRenderer.invoke('get-available-providers'),

    getProfilePaths: (
        profileName: string
    ): Promise<{ baseDir: string; dataDir: string; extensionsDir: string }> =>
        ipcRenderer.invoke('get-profile-paths', profileName),

    getApiKeys: (): Promise<{ geminiApiKey: string; openaiApiKey: string }> =>
        ipcRenderer.invoke('get-api-keys'),

    // GitHub Integration
    updateGitHubToken: (token: string): Promise<boolean> =>
        ipcRenderer.invoke('update-github-token', token),

    getGitHubToken: (): Promise<string> => ipcRenderer.invoke('get-github-token'),

    githubListIssues: (owner: string, repo: string, state?: 'open' | 'closed') =>
        ipcRenderer.invoke('github-list-issues', owner, repo, state),

    githubCreateIssue: (
        owner: string,
        repo: string,
        title: string,
        body: string,
        labels?: string[]
    ) => ipcRenderer.invoke('github-create-issue', owner, repo, title, body, labels),

    githubListBranches: (owner: string, repo: string) =>
        ipcRenderer.invoke('github-list-branches', owner, repo),

    githubValidateRepo: (owner: string, repo: string): Promise<boolean> =>
        ipcRenderer.invoke('github-validate-repo', owner, repo),

    isGitHubConfigured: (): Promise<boolean> => ipcRenderer.invoke('is-github-configured'),

    // Directory picker
    selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-directory'),

    // GitHub repository listing
    githubListRepos: (
        owner: string
    ): Promise<
        Array<{ name: string; fullName: string; description: string; defaultBranch: string }>
    > => ipcRenderer.invoke('github-list-repos', owner),
});

// Define the API interface for TypeScript
declare global {
    interface Window {
        electronAPI: {
            getProfiles: () => Promise<Profile[]>;
            createProfile: (profileData: CreateProfileData) => Promise<Profile>;
            updateProfile: (id: number, profileData: UpdateProfileData) => Promise<Profile | null>;
            deleteProfile: (id: number) => Promise<boolean>;
            getProfile: (id: number) => Promise<Profile | null>;
            launchVSCode: (profile: Profile) => Promise<boolean>;
            getAIProviders: () => Promise<any[]>;
            getConfig: () => Promise<any>;
            updateApiKey: (provider: 'gemini' | 'openai', apiKey: string) => Promise<boolean>;
            generateCodeTemplate: (
                language: string,
                projectName: string,
                description?: string,
                preferredProvider?: 'gemini' | 'openai',
                preferredModel?: string
            ) => Promise<any>;
            generateCode: (request: any) => Promise<any>;
            getAvailableProviders: () => Promise<
                Array<{ name: 'gemini' | 'openai'; configured: boolean }>
            >;
            getProfilePaths: (
                profileName: string
            ) => Promise<{ baseDir: string; dataDir: string; extensionsDir: string }>;
            getApiKeys: () => Promise<{ geminiApiKey: string; openaiApiKey: string }>;
            updateGitHubToken: (token: string) => Promise<boolean>;
            getGitHubToken: () => Promise<string>;
            githubListIssues: (
                owner: string,
                repo: string,
                state?: 'open' | 'closed'
            ) => Promise<any>;
            githubCreateIssue: (
                owner: string,
                repo: string,
                title: string,
                body: string,
                labels?: string[]
            ) => Promise<any>;
            githubListBranches: (owner: string, repo: string) => Promise<string[]>;
            githubValidateRepo: (owner: string, repo: string) => Promise<boolean>;
            isGitHubConfigured: () => Promise<boolean>;
            selectDirectory: () => Promise<string | null>;
            githubListRepos: (owner: string) => Promise<
                Array<{
                    name: string;
                    fullName: string;
                    description: string;
                    defaultBranch: string;
                }>
            >;
        };
    }
}
