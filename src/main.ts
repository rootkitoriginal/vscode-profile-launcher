import { app, BrowserWindow, ipcMain, shell, IpcMainInvokeEvent, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { DatabaseService } from './services/DatabaseService';
import { ConfigService } from './services/ConfigService';
import { AIService } from './services/AIService';
import { DescriptionGeneratorService } from './services/DescriptionGeneratorService';
import { ProfileController } from './controllers/ProfileController';
import { SettingsController } from './controllers/SettingsController';
import { AIController } from './controllers/AIController';
import { GitHubController } from './controllers/GitHubController';
import { DescriptionGeneratorController } from './controllers/DescriptionGeneratorController';
import { GitHubService } from './services/GitHubService';
import { Profile, CreateProfileData, UpdateProfileData } from './types';
import { WindowManager } from './windows/WindowManager';

class App {
    private mainWindow: BrowserWindow | null = null;
    private githubWindow: BrowserWindow | null = null;
    private githubWindowProfile: Profile | null = null;
    private db: DatabaseService;
    private config: ConfigService;
    private aiManager: AIService;
    private descriptionGenerator: DescriptionGeneratorService;
    private githubManager: GitHubService | null = null;
    private windowManager: WindowManager;

    // Controllers
    private profileController: ProfileController;
    private settingsController: SettingsController;
    private aiController: AIController;
    private githubController: GitHubController;
    private descriptionGeneratorController: DescriptionGeneratorController;

    constructor() {
        this.config = ConfigService.getInstance();
        this.db = new DatabaseService();
        this.aiManager = AIService.getInstance();
        this.descriptionGenerator = DescriptionGeneratorService.getInstance();
        this.windowManager = new WindowManager();

        // Initialize controllers
        this.profileController = new ProfileController(this.db);
        this.settingsController = new SettingsController(this.config, this.aiManager);
        this.aiController = new AIController(this.aiManager);
        this.githubController = new GitHubController(null);
        this.descriptionGeneratorController = new DescriptionGeneratorController(
            this.descriptionGenerator
        );

        this.initialize();
    }

    private async initialize(): Promise<void> {
        // Load saved API keys
        await this.config.loadApiKeys();

        this.setupElectronEvents();
        this.setupIpcHandlers();
    }

    private setupElectronEvents(): void {
        app.whenReady().then(() => {
            this.createWindow();

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }

    private createWindow(): void {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
            },
            titleBarStyle: 'default',
            show: false,
        });

        this.mainWindow.loadFile(path.join(__dirname, '../src/renderer/index.html'));

        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        // Open external links in default browser
        this.mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
    }

    private createGitHubWindow(profile: Profile): void {
        // Close existing GitHub window if open
        if (this.githubWindow) {
            this.githubWindow.close();
        }

        this.githubWindowProfile = profile;

        this.githubWindow = new BrowserWindow({
            width: 900,
            height: 700,
            minWidth: 700,
            minHeight: 500,
            parent: this.mainWindow || undefined,
            modal: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
            },
            titleBarStyle: 'default',
            show: false,
            title: `GitHub Integration - ${profile.name}`,
        });

        this.githubWindow.loadFile(path.join(__dirname, '../src/renderer/github-integration.html'));

        this.githubWindow.once('ready-to-show', () => {
            this.githubWindow?.show();
        });

        this.githubWindow.on('closed', () => {
            this.githubWindow = null;
            this.githubWindowProfile = null;
        });

        // Open external links in default browser
        this.githubWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
    }

    private setupIpcHandlers(): void {
        // Profile management handlers - Using ProfileController
        ipcMain.handle('get-profiles', async () => {
            return this.profileController.getAllProfiles();
        });

        ipcMain.handle(
            'create-profile',
            async (_: IpcMainInvokeEvent, profileData: CreateProfileData) => {
                return this.profileController.createProfile(profileData);
            }
        );

        ipcMain.handle(
            'update-profile',
            async (_: IpcMainInvokeEvent, id: number, profileData: UpdateProfileData) => {
                return this.profileController.updateProfile(id, profileData);
            }
        );

        ipcMain.handle('delete-profile', async (_: IpcMainInvokeEvent, id: number) => {
            return this.profileController.deleteProfile(id);
        });

        ipcMain.handle('get-profile', async (_: IpcMainInvokeEvent, id: number) => {
            return this.profileController.getProfile(id);
        });

        // VS Code launch handler
        ipcMain.handle('launch-vscode', async (_: IpcMainInvokeEvent, profile: Profile) => {
            return this.launchVSCode(profile);
        });

        // Profile path info - Using SettingsController
        ipcMain.handle('get-profile-paths', async (_: IpcMainInvokeEvent, profileName: string) => {
            return this.settingsController.getProfilePaths(profileName);
        });

        // AI and configuration handlers - Using AIController and SettingsController
        ipcMain.handle('get-ai-providers', async () => {
            return this.aiController.getAIProviders();
        });

        ipcMain.handle('get-config', async () => {
            return this.settingsController.getConfig();
        });

        ipcMain.handle('get-api-keys', async () => {
            return this.settingsController.getApiKeys();
        });

        ipcMain.handle(
            'update-api-key',
            async (_: IpcMainInvokeEvent, provider: 'gemini' | 'openai', apiKey: string) => {
                return this.settingsController.updateApiKey(provider, apiKey);
            }
        );

        ipcMain.handle(
            'generate-code-template',
            async (
                _: IpcMainInvokeEvent,
                language: string,
                projectName: string,
                description?: string,
                preferredProvider?: 'gemini' | 'openai',
                preferredModel?: string
            ) => {
                return this.aiController.generateCodeTemplate(
                    language,
                    projectName,
                    description,
                    preferredProvider,
                    preferredModel
                );
            }
        );

        ipcMain.handle('generate-code', async (_: IpcMainInvokeEvent, request: any) => {
            return this.aiController.generateCode(request);
        });

        ipcMain.handle('get-available-providers', async () => {
            return this.aiController.getAvailableProviders();
        });

        // Description Generator Handler
        ipcMain.handle(
            'generate-profile-description',
            async (
                _: IpcMainInvokeEvent,
                profileName: string,
                language: string,
                workspacePath?: string,
                aiProvider?: string,
                aiModel?: string
            ) => {
                return this.descriptionGeneratorController.generateDescription(
                    profileName,
                    language,
                    workspacePath,
                    aiProvider,
                    aiModel
                );
            }
        );

        // GitHub Integration Handlers - Using SettingsController and GitHubController
        ipcMain.handle('update-github-token', async (_: IpcMainInvokeEvent, token: string) => {
            try {
                await this.settingsController.updateGitHubToken(token);
                await this.initGitHubManager();
                if (this.githubManager) {
                    await this.githubManager.updateToken(token);
                }
                return true;
            } catch (error) {
                console.error('Failed to save GitHub token:', error);
                return false;
            }
        });

        ipcMain.handle('get-github-token', async () => {
            return this.settingsController.getGitHubToken();
        });

        ipcMain.handle(
            'github-list-issues',
            async (
                _: IpcMainInvokeEvent,
                owner: string,
                repo: string,
                state?: 'open' | 'closed'
            ) => {
                await this.initGitHubManager();
                return this.githubController.listIssues(owner, repo, state);
            }
        );

        ipcMain.handle(
            'github-create-issue',
            async (
                _: IpcMainInvokeEvent,
                owner: string,
                repo: string,
                title: string,
                body: string,
                labels?: string[]
            ) => {
                await this.initGitHubManager();
                return this.githubController.createIssue(owner, repo, title, body, labels);
            }
        );

        ipcMain.handle(
            'github-list-branches',
            async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
                await this.initGitHubManager();
                return this.githubController.listBranches(owner, repo);
            }
        );

        ipcMain.handle(
            'github-validate-repo',
            async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
                await this.initGitHubManager();
                return this.githubController.validateRepository(owner, repo);
            }
        );

        ipcMain.handle('is-github-configured', async () => {
            await this.initGitHubManager();
            return this.githubController.isConfigured();
        });

        ipcMain.handle('github-validate-token', async (_: IpcMainInvokeEvent, token: string) => {
            await this.initGitHubManager();
            return this.githubController.validateToken(token);
        });

        ipcMain.handle('github-list-user-orgs', async () => {
            await this.initGitHubManager();
            return this.githubController.listUserOrganizations();
        });

        ipcMain.handle(
            'github-list-branches-detailed',
            async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
                await this.initGitHubManager();
                return this.githubController.listBranchesDetailed(owner, repo);
            }
        );

        // Directory picker handler
        ipcMain.handle('select-directory', async () => {
            const result = await dialog.showOpenDialog({
                properties: ['openDirectory'],
            });
            return result.canceled ? null : result.filePaths[0];
        });

        // GitHub repository listing handler
        ipcMain.handle('github-list-repos', async (_: IpcMainInvokeEvent, owner: string) => {
            await this.initGitHubManager();
            return this.githubController.listRepositories(owner);
        });

        // GitHub Window handlers
        ipcMain.handle('open-github-window', async (_: IpcMainInvokeEvent, profileId: number) => {
            const profile = await this.profileController.getProfile(profileId);
            if (profile) {
                this.createGitHubWindow(profile);
                return true;
            }
            return false;
        });

        ipcMain.handle('get-github-window-profile', async () => {
            return this.githubWindowProfile;
        });

        ipcMain.handle(
            'launch-profile-with-issue',
            async (_: IpcMainInvokeEvent, profileId: number, issueNumber: number) => {
                const profile = await this.profileController.getProfile(profileId);
                if (profile) {
                    // Store issue number for the launch
                    // You can extend this to pass issue info to VS Code
                    await this.launchVSCode(profile);
                    return true;
                }
                return false;
            }
        );

        // New GitHub Repository Manager Window handlers
        ipcMain.handle(
            'open-github-repo-window',
            async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
                try {
                    if (!this.mainWindow) return { success: false, error: 'No main window' };

                    if (this.windowManager.isWindowOpen('github-window')) {
                        this.windowManager.focusWindow('github-window');
                        return { success: true, focused: true };
                    }

                    await this.windowManager.createGitHubWindow(this.mainWindow);
                    return { success: true };
                } catch (error: any) {
                    console.error('Failed to open GitHub window:', error);
                    return { success: false, error: error.message };
                }
            }
        );

        ipcMain.handle(
            'github-get-repository-data',
            async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
                await this.initGitHubManager();
                try {
                    if (!this.githubManager) {
                        return { success: false, error: 'GitHub manager not initialized' };
                    }
                    const data = await this.githubManager.getRepository(owner, repo);
                    return { success: true, data };
                } catch (error: any) {
                    return { success: false, error: error.message };
                }
            }
        );

        ipcMain.handle(
            'github-get-pull-requests',
            async (_: IpcMainInvokeEvent, owner: string, repo: string, state?: string) => {
                await this.initGitHubManager();
                try {
                    if (!this.githubManager) {
                        return { success: false, error: 'GitHub manager not initialized' };
                    }
                    const data = await this.githubManager.listPullRequests(
                        owner,
                        repo,
                        state as 'open' | 'closed' | 'all'
                    );
                    return { success: true, data };
                } catch (error: any) {
                    return { success: false, error: error.message };
                }
            }
        );

        ipcMain.handle(
            'github-get-commits',
            async (_: IpcMainInvokeEvent, owner: string, repo: string, page?: number) => {
                await this.initGitHubManager();
                try {
                    if (!this.githubManager) {
                        return { success: false, error: 'GitHub manager not initialized' };
                    }
                    const data = await this.githubManager.listCommits(owner, repo, page);
                    return { success: true, data };
                } catch (error: any) {
                    return { success: false, error: error.message };
                }
            }
        );

        ipcMain.handle(
            'github-get-detailed-branches',
            async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
                await this.initGitHubManager();
                return this.githubController.listBranchesDetailed(owner, repo);
            }
        );

        ipcMain.handle(
            'github-get-repository-stats',
            async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
                await this.initGitHubManager();
                try {
                    if (!this.githubManager) {
                        return { success: false, error: 'GitHub manager not initialized' };
                    }
                    const repo_data = await this.githubManager.getRepository(owner, repo);
                    return {
                        success: true,
                        data: {
                            stars: repo_data.stargazers_count,
                            watchers: repo_data.watchers_count,
                            forks: repo_data.forks_count,
                            size: repo_data.size,
                        },
                    };
                } catch (error: any) {
                    return { success: false, error: error.message };
                }
            }
        );

        ipcMain.handle(
            'github-get-languages',
            async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
                await this.initGitHubManager();
                try {
                    if (!this.githubManager) {
                        return { success: false, error: 'GitHub manager not initialized' };
                    }
                    const data = await this.githubManager.getLanguages(owner, repo);
                    return { success: true, data };
                } catch (error: any) {
                    return { success: false, error: error.message };
                }
            }
        );

        ipcMain.handle(
            'github-get-contributors',
            async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
                await this.initGitHubManager();
                try {
                    if (!this.githubManager) {
                        return { success: false, error: 'GitHub manager not initialized' };
                    }
                    const data = await this.githubManager.listContributors(owner, repo);
                    return { success: true, data };
                } catch (error: any) {
                    return { success: false, error: error.message };
                }
            }
        );

        ipcMain.handle('open-external', async (_: IpcMainInvokeEvent, url: string) => {
            await shell.openExternal(url);
            return true;
        });

        ipcMain.handle('open-in-vscode', async (_: IpcMainInvokeEvent, workspacePath: string) => {
            // TODO: Implement opening workspace in VSCode
            return true;
        });

        ipcMain.handle(
            'open-ai-assistant-window',
            async (
                _: IpcMainInvokeEvent,
                issueUrl: string,
                issueTitle: string,
                issueBody: string
            ) => {
                // TODO: Implement AI Assistant window
                console.log('Opening AI assistant for:', issueTitle);
                return true;
            }
        );

        ipcMain.handle('close-github-window', async () => {
            this.windowManager.closeWindow('github-window');
            return true;
        });

        ipcMain.handle('minimize-github-window', async () => {
            const window = this.windowManager.getWindow('github-window');
            if (window && !window.isDestroyed()) {
                window.minimize();
            }
            return true;
        });

        ipcMain.handle('maximize-github-window', async () => {
            const window = this.windowManager.getWindow('github-window');
            if (window && !window.isDestroyed()) {
                if (window.isMaximized()) {
                    window.unmaximize();
                } else {
                    window.maximize();
                }
            }
            return true;
        });
    }

    private async initGitHubManager() {
        if (!this.githubManager) {
            try {
                const githubModule = await import('./services/GitHubService');
                this.githubManager = githubModule.default;
                this.githubController.updateService(this.githubManager);
            } catch (error) {
                console.error('Failed to load GitHub manager:', error);
            }
        }
    }

    private async launchVSCode(profile: Profile): Promise<boolean> {
        try {
            // Create profile slug for directory naming
            const profileSlug = this.config.createProfileSlug(profile.name);
            const profilePaths = this.config.getProfilePath(profileSlug);

            // Create profile directories if they don't exist
            await this.ensureProfileDirectories(profilePaths);

            const args = [
                '--user-data-dir',
                profilePaths.dataDir,
                '--extensions-dir',
                profilePaths.extensionsDir,
                '--new-window',
            ];

            // Add workspace path if provided, otherwise just open VS Code
            if (profile.workspacePath && profile.workspacePath.trim() !== '') {
                args.push(profile.workspacePath);
            }

            // Spawn VS Code process
            const vscodeCommand = this.config.get('vscodeCommand') || 'code';
            const vscode = spawn(vscodeCommand, args, {
                detached: true,
                stdio: 'ignore',
            });

            vscode.unref();

            // Update last used timestamp
            await this.profileController.updateLastUsed(profile.id!);

            return true;
        } catch (error) {
            console.error('Failed to launch VS Code:', error);
            return false;
        }
    }

    private async ensureProfileDirectories(profilePaths: {
        baseDir: string;
        dataDir: string;
        extensionsDir: string;
    }): Promise<void> {
        try {
            await fs.promises.mkdir(profilePaths.baseDir, { recursive: true });
            await fs.promises.mkdir(profilePaths.dataDir, { recursive: true });
            await fs.promises.mkdir(profilePaths.extensionsDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create profile directories:', error);
            throw error;
        }
    }
}

// Initialize the app
new App();
