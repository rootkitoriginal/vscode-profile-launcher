import { app, BrowserWindow, ipcMain, shell, IpcMainInvokeEvent, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { DatabaseManager } from './database';
import { ConfigManager } from './config';
import { AIManager } from './ai-manager';
import { Profile, AI_PROVIDERS } from './types';

class App {
    private mainWindow: BrowserWindow | null = null;
    private db: DatabaseManager;
    private config: ConfigManager;
    private aiManager: AIManager;
    private githubManager: any = null;

    constructor() {
        this.config = ConfigManager.getInstance();
        this.db = new DatabaseManager();
        this.aiManager = AIManager.getInstance();
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
                preload: path.join(__dirname, 'preload.js')
            },
            titleBarStyle: 'default',
            show: false
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

    private setupIpcHandlers(): void {
        // Profile management handlers
        ipcMain.handle('get-profiles', async () => {
            return this.db.getAllProfiles();
        });

        ipcMain.handle('create-profile', async (_: IpcMainInvokeEvent, profileData: any) => {
            return this.db.createProfile(profileData);
        });

        ipcMain.handle('update-profile', async (_: IpcMainInvokeEvent, id: number, profileData: any) => {
            return this.db.updateProfile(id, profileData);
        });

        ipcMain.handle('delete-profile', async (_: IpcMainInvokeEvent, id: number) => {
            return this.db.deleteProfile(id);
        });

        ipcMain.handle('get-profile', async (_: IpcMainInvokeEvent, id: number) => {
            return this.db.getProfile(id);
        });

        // VS Code launch handler
        ipcMain.handle('launch-vscode', async (_: IpcMainInvokeEvent, profile: Profile) => {
            return this.launchVSCode(profile);
        });

        // Profile path info
        ipcMain.handle('get-profile-paths', async (_: IpcMainInvokeEvent, profileName: string) => {
            const profileSlug = this.config.createProfileSlug(profileName);
            return this.config.getProfilePath(profileSlug);
        });

        // AI and configuration handlers
        ipcMain.handle('get-ai-providers', async () => {
            return AI_PROVIDERS;
        });

        ipcMain.handle('get-config', async () => {
            const config = this.config.getAll();
            // Include current API key status (but not the actual keys for security)
            return {
                ...config,
                hasGeminiKey: this.config.hasValidGeminiKey(),
                hasOpenaiKey: this.config.hasValidOpenaiKey()
            };
        });

        ipcMain.handle('get-api-keys', async () => {
            return {
                geminiApiKey: this.config.getApiKey('gemini'),
                openaiApiKey: this.config.getApiKey('openai')
            };
        });

        ipcMain.handle('update-api-key', async (_: IpcMainInvokeEvent, provider: 'gemini' | 'openai', apiKey: string) => {
            try {
                this.aiManager.updateApiKey(provider, apiKey);
                await this.config.saveApiKeys();
                return true;
            } catch (error) {
                console.error('Failed to save API key:', error);
                return false;
            }
        });

        ipcMain.handle('generate-code-template', async (_: IpcMainInvokeEvent, language: string, projectName: string, description?: string, preferredProvider?: 'gemini' | 'openai', preferredModel?: string) => {
            return this.aiManager.generateCodeTemplate(language, projectName, description, preferredProvider, preferredModel);
        });

        ipcMain.handle('generate-code', async (_: IpcMainInvokeEvent, request: any) => {
            return this.aiManager.generateCode(request);
        });

        ipcMain.handle('get-available-providers', async () => {
            return this.aiManager.getAvailableProviders();
        });

        // GitHub Integration Handlers
        ipcMain.handle('update-github-token', async (_: IpcMainInvokeEvent, token: string) => {
            try {
                this.config.updateGitHubToken(token);
                await this.initGitHubManager();
                if (this.githubManager) {
                    await this.githubManager.updateToken(token);
                }
                await this.config.saveApiKeys();
                return true;
            } catch (error) {
                console.error('Failed to save GitHub token:', error);
                return false;
            }
        });

        ipcMain.handle('get-github-token', async () => {
            return this.config.getGitHubToken();
        });

        ipcMain.handle('github-list-issues', async (_: IpcMainInvokeEvent, owner: string, repo: string, state?: 'open' | 'closed') => {
            try {
                await this.initGitHubManager();
                if (!this.githubManager) {
                    throw new Error('GitHub not configured');
                }
                return await this.githubManager.listIssues(owner, repo, state);
            } catch (error) {
                console.error('Failed to list GitHub issues:', error);
                throw error;
            }
        });

        ipcMain.handle('github-create-issue', async (_: IpcMainInvokeEvent, owner: string, repo: string, title: string, body: string, labels?: string[]) => {
            try {
                await this.initGitHubManager();
                if (!this.githubManager) {
                    throw new Error('GitHub not configured');
                }
                return await this.githubManager.createIssue(owner, repo, title, body, labels);
            } catch (error) {
                console.error('Failed to create GitHub issue:', error);
                throw error;
            }
        });

        ipcMain.handle('github-list-branches', async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
            try {
                await this.initGitHubManager();
                if (!this.githubManager) {
                    throw new Error('GitHub not configured');
                }
                return await this.githubManager.listBranches(owner, repo);
            } catch (error) {
                console.error('Failed to list GitHub branches:', error);
                throw error;
            }
        });

        ipcMain.handle('github-validate-repo', async (_: IpcMainInvokeEvent, owner: string, repo: string) => {
            try {
                await this.initGitHubManager();
                if (!this.githubManager) {
                    return false;
                }
                return await this.githubManager.validateRepository(owner, repo);
            } catch (error) {
                console.error('Failed to validate GitHub repository:', error);
                return false;
            }
        });

        ipcMain.handle('is-github-configured', async () => {
            try {
                await this.initGitHubManager();
                if (!this.githubManager) {
                    return false;
                }
                return await this.githubManager.isConfigured();
            } catch (error) {
                return false;
            }
        });

        // Directory picker handler
        ipcMain.handle('select-directory', async () => {
            const result = await dialog.showOpenDialog({
                properties: ['openDirectory']
            });
            return result.canceled ? null : result.filePaths[0];
        });

        // GitHub repository listing handler
        ipcMain.handle('github-list-repos', async (_: IpcMainInvokeEvent, owner: string) => {
            try {
                await this.initGitHubManager();
                if (!this.githubManager) {
                    throw new Error('GitHub not configured');
                }
                return await this.githubManager.listRepositories(owner);
            } catch (error) {
                console.error('Failed to list GitHub repositories:', error);
                throw error;
            }
        });
    }

    private async initGitHubManager() {
        if (!this.githubManager) {
            try {
                const githubModule = await import('./github-manager');
                this.githubManager = githubModule.default;
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
                '--user-data-dir', profilePaths.dataDir,
                '--extensions-dir', profilePaths.extensionsDir,
                '--new-window'
            ];

            // Add workspace path if provided, otherwise just open VS Code
            if (profile.workspacePath && profile.workspacePath.trim() !== '') {
                args.push(profile.workspacePath);
            }

            // Spawn VS Code process
            const vscodeCommand = this.config.get('vscodeCommand') || 'code';
            const vscode = spawn(vscodeCommand, args, {
                detached: true,
                stdio: 'ignore'
            });

            vscode.unref();
            
            // Update last used timestamp
            this.db.updateLastUsed(profile.id!);
            
            return true;
        } catch (error) {
            console.error('Failed to launch VS Code:', error);
            return false;
        }
    }

    private async ensureProfileDirectories(profilePaths: { baseDir: string; dataDir: string; extensionsDir: string }): Promise<void> {
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