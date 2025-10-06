import * as dotenv from 'dotenv';
import * as path from 'path';
import { app } from 'electron';

// Load environment variables
dotenv.config();

export class ConfigService {
    private static instance: ConfigService;
    private config: Record<string, any>;

    private constructor() {
        this.config = {
            // AI API Keys
            geminiApiKey: process.env.GEMINI_API_KEY || '',
            openaiApiKey: process.env.OPENAI_API_KEY || '',

            // GitHub Settings
            githubToken: process.env.GITHUB_TOKEN || '',

            // Default AI Settings
            defaultAiProvider: process.env.DEFAULT_AI_PROVIDER || 'gemini',
            defaultGeminiModel: process.env.DEFAULT_GEMINI_MODEL || 'gemini-1.5-flash',
            defaultOpenaiModel: process.env.DEFAULT_OPENAI_MODEL || 'gpt-3.5-turbo',

            // Application Settings
            appName: process.env.APP_NAME || 'VS Code Profile Launcher',
            appVersion: process.env.APP_VERSION || '1.0.0',
            debugMode: process.env.DEBUG_MODE === 'true',

            // VS Code Settings
            vscodeCommand: process.env.VSCODE_COMMAND || 'code',
            vscodeInsidersCommand: process.env.VSCODE_INSIDERS_COMMAND || 'code-insiders',

            // Database Settings
            dbName: process.env.DB_NAME || 'profiles.db',

            // VS Code Profile Settings
            profilesBaseDir: process.env.PROFILES_BASE_DIR || '/home/rootkit/profiles',

            // Paths
            userDataPath: app.getPath('userData'),
            tempPath: app.getPath('temp'),
        };
    }

    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    public get(key: string): any {
        return this.config[key];
    }

    public set(key: string, value: any): void {
        this.config[key] = value;
    }

    public getAll(): Record<string, any> {
        return { ...this.config };
    }

    public hasValidGeminiKey(): boolean {
        return !!this.config.geminiApiKey && this.config.geminiApiKey.length > 0;
    }

    public hasValidOpenaiKey(): boolean {
        return !!this.config.openaiApiKey && this.config.openaiApiKey.length > 0;
    }

    public hasValidGitHubToken(): boolean {
        return !!this.config.githubToken && this.config.githubToken.length > 0;
    }

    public getDbPath(): string {
        return path.join(this.config.userDataPath, this.config.dbName);
    }

    public updateApiKey(provider: 'gemini' | 'openai', apiKey: string): void {
        if (provider === 'gemini') {
            this.config.geminiApiKey = apiKey;
        } else if (provider === 'openai') {
            this.config.openaiApiKey = apiKey;
        }
    }

    public getApiKey(provider: 'gemini' | 'openai'): string {
        return provider === 'gemini' ? this.config.geminiApiKey : this.config.openaiApiKey;
    }

    public updateGitHubToken(token: string): void {
        this.config.githubToken = token;
    }

    public getGitHubToken(): string {
        return this.config.githubToken;
    }

    public async saveApiKeys(): Promise<void> {
        const fs = require('fs').promises;
        const path = require('path');

        try {
            // Save to a config file in user data directory
            const configPath = path.join(this.config.userDataPath, 'app-config.json');
            const configData = {
                geminiApiKey: this.config.geminiApiKey,
                openaiApiKey: this.config.openaiApiKey,
                githubToken: this.config.githubToken,
                lastUpdated: new Date().toISOString(),
            };

            await fs.writeFile(configPath, JSON.stringify(configData, null, 2));
        } catch (error) {
            console.error('Failed to save API keys:', error);
            throw error;
        }
    }

    public async loadApiKeys(): Promise<void> {
        const fs = require('fs').promises;
        const path = require('path');

        try {
            const configPath = path.join(this.config.userDataPath, 'app-config.json');

            // Check if config file exists
            try {
                await fs.access(configPath);
            } catch {
                // File doesn't exist, that's OK
                return;
            }

            const configData = JSON.parse(await fs.readFile(configPath, 'utf8'));

            if (configData.geminiApiKey) {
                this.config.geminiApiKey = configData.geminiApiKey;
            }
            if (configData.openaiApiKey) {
                this.config.openaiApiKey = configData.openaiApiKey;
            }
            if (configData.githubToken) {
                this.config.githubToken = configData.githubToken;
            }
        } catch (error) {
            console.error('Failed to load API keys:', error);
            // Don't throw error, just continue with default values
        }
    }

    public getProfilesBaseDir(): string {
        return this.config.profilesBaseDir;
    }

    public createProfileSlug(profileName: string): string {
        return profileName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    }

    public getProfilePath(profileSlug: string): {
        dataDir: string;
        extensionsDir: string;
        baseDir: string;
    } {
        const baseDir = path.join(this.config.profilesBaseDir, profileSlug);
        return {
            baseDir,
            dataDir: path.join(baseDir, 'data'),
            extensionsDir: path.join(baseDir, 'extensions'),
        };
    }
}

// Export default instance
export default ConfigService.getInstance();
