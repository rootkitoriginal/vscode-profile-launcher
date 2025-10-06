import { GitHubRepository } from '../types';

export class Profile {
    id?: number;
    name: string;
    language: string;
    description?: string;
    workspacePath?: string;
    extensions?: string[];
    aiProvider?: 'gemini' | 'openai';
    aiModel?: string;
    envVariables?: Record<string, string>;
    codeTemplate?: string;
    githubRepo?: GitHubRepository;
    createdAt?: string;
    lastUsed?: string;

    constructor(data: ProfileData) {
        this.id = data.id;
        this.name = data.name;
        this.language = data.language;
        this.description = data.description;
        this.workspacePath = data.workspacePath;
        this.extensions = data.extensions || [];
        this.aiProvider = data.aiProvider;
        this.aiModel = data.aiModel;
        this.envVariables = data.envVariables || {};
        this.codeTemplate = data.codeTemplate;
        this.githubRepo = data.githubRepo;
        this.createdAt = data.createdAt;
        this.lastUsed = data.lastUsed;
    }

    /**
     * Validates the profile data
     */
    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.name || this.name.trim().length === 0) {
            errors.push('Profile name is required');
        }

        if (!this.language || this.language.trim().length === 0) {
            errors.push('Language is required');
        }

        if (this.name && this.name.length > 100) {
            errors.push('Profile name must be less than 100 characters');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Returns a plain object representation of the profile
     */
    toJSON(): ProfileData {
        return {
            id: this.id,
            name: this.name,
            language: this.language,
            description: this.description,
            workspacePath: this.workspacePath,
            extensions: this.extensions,
            aiProvider: this.aiProvider,
            aiModel: this.aiModel,
            envVariables: this.envVariables,
            codeTemplate: this.codeTemplate,
            githubRepo: this.githubRepo,
            createdAt: this.createdAt,
            lastUsed: this.lastUsed,
        };
    }
}

export interface ProfileData {
    id?: number;
    name: string;
    language: string;
    description?: string;
    workspacePath?: string;
    extensions?: string[];
    aiProvider?: 'gemini' | 'openai';
    aiModel?: string;
    envVariables?: Record<string, string>;
    codeTemplate?: string;
    githubRepo?: GitHubRepository;
    createdAt?: string;
    lastUsed?: string;
}
