import { ConfigService } from '../services/ConfigService';
import { AIService } from '../services/AIService';

/**
 * SettingsController manages application settings
 */
export class SettingsController {
    private configService: ConfigService;
    private aiService: AIService;

    constructor(configService: ConfigService, aiService: AIService) {
        this.configService = configService;
        this.aiService = aiService;
    }

    /**
     * Get all configuration settings
     */
    async getConfig(): Promise<Record<string, string | boolean | number>> {
        try {
            const config = this.configService.getAll();
            return {
                ...config,
                hasGeminiKey: this.configService.hasValidGeminiKey(),
                hasOpenaiKey: this.configService.hasValidOpenaiKey(),
            };
        } catch (error) {
            console.error('Error fetching config:', error);
            throw error;
        }
    }

    /**
     * Get API keys (with security considerations)
     */
    async getApiKeys(): Promise<{ geminiApiKey: string; openaiApiKey: string }> {
        try {
            return {
                geminiApiKey: this.configService.getApiKey('gemini'),
                openaiApiKey: this.configService.getApiKey('openai'),
            };
        } catch (error) {
            console.error('Error fetching API keys:', error);
            throw error;
        }
    }

    /**
     * Update an API key
     */
    async updateApiKey(provider: 'gemini' | 'openai', apiKey: string): Promise<boolean> {
        try {
            this.aiService.updateApiKey(provider, apiKey);
            await this.configService.saveApiKeys();
            return true;
        } catch (error) {
            console.error('Failed to save API key:', error);
            return false;
        }
    }

    /**
     * Update GitHub token
     */
    async updateGitHubToken(token: string): Promise<boolean> {
        try {
            this.configService.updateGitHubToken(token);
            await this.configService.saveApiKeys();
            return true;
        } catch (error) {
            console.error('Failed to save GitHub token:', error);
            return false;
        }
    }

    /**
     * Get GitHub token
     */
    async getGitHubToken(): Promise<string> {
        try {
            return this.configService.getGitHubToken();
        } catch (error) {
            console.error('Error fetching GitHub token:', error);
            throw error;
        }
    }

    /**
     * Get VS Code command setting
     */
    getVSCodeCommand(): string {
        return this.configService.get('vscodeCommand') || 'code';
    }

    /**
     * Get profile paths for a given profile name
     */
    getProfilePaths(profileName: string): {
        baseDir: string;
        dataDir: string;
        extensionsDir: string;
    } {
        const profileSlug = this.configService.createProfileSlug(profileName);
        return this.configService.getProfilePath(profileSlug);
    }
}
