import { GitHubIssue } from '../types';
import { GitHubService } from '../services/GitHubService';

/**
 * GitHubController handles GitHub integration operations
 */
export class GitHubController {
    private githubService: GitHubService | null;

    constructor(githubService: GitHubService | null) {
        this.githubService = githubService;
    }

    /**
     * Update GitHub service instance (for lazy loading)
     */
    updateService(githubService: GitHubService): void {
        this.githubService = githubService;
    }

    /**
     * List issues for a repository
     */
    async listIssues(
        owner: string,
        repo: string,
        state?: 'open' | 'closed'
    ): Promise<GitHubIssue[]> {
        try {
            if (!this.githubService) {
                throw new Error('GitHub service not initialized');
            }
            return await this.githubService.listIssues(owner, repo, state);
        } catch (error) {
            console.error('Failed to list GitHub issues:', error);
            throw error;
        }
    }

    /**
     * Create a new issue
     */
    async createIssue(
        owner: string,
        repo: string,
        title: string,
        body: string,
        labels?: string[]
    ): Promise<GitHubIssue> {
        try {
            if (!this.githubService) {
                throw new Error('GitHub service not initialized');
            }
            return await this.githubService.createIssue(owner, repo, title, body, labels);
        } catch (error) {
            console.error('Failed to create GitHub issue:', error);
            throw error;
        }
    }

    /**
     * List branches for a repository
     */
    async listBranches(owner: string, repo: string): Promise<string[]> {
        try {
            if (!this.githubService) {
                throw new Error('GitHub service not initialized');
            }
            return await this.githubService.listBranches(owner, repo);
        } catch (error) {
            console.error('Failed to list GitHub branches:', error);
            throw error;
        }
    }

    /**
     * Validate if a repository exists
     */
    async validateRepository(owner: string, repo: string): Promise<boolean> {
        try {
            if (!this.githubService) {
                throw new Error('GitHub service not initialized');
            }
            return await this.githubService.validateRepository(owner, repo);
        } catch (error) {
            console.error('Failed to validate GitHub repository:', error);
            throw error;
        }
    }

    /**
     * List repositories for a given owner
     * @param owner The owner (user or organization) whose repositories to list
     */
    async listRepositories(
        owner: string
    ): Promise<
        Array<{ name: string; fullName: string; description: string; defaultBranch: string }>
    > {
        try {
            if (!this.githubService) {
                throw new Error('GitHub service not initialized');
            }
            return await this.githubService.listRepositories(owner);
        } catch (error) {
            console.error('Failed to list GitHub repositories:', error);
            throw error;
        }
    }

    /**
     * Check if GitHub is configured
     */
    async isConfigured(): Promise<boolean> {
        try {
            if (!this.githubService) {
                return false;
            }
            return await this.githubService.isConfigured();
        } catch (error) {
            console.error('Error checking GitHub configuration:', error);
            return false;
        }
    }

    /**
     * Validate GitHub token
     */
    async validateToken(
        token: string
    ): Promise<{ valid: boolean; user?: { login: string; name: string; avatarUrl: string } }> {
        try {
            if (!this.githubService) {
                throw new Error('GitHub service not initialized');
            }
            return await this.githubService.validateToken(token);
        } catch (error) {
            console.error('Failed to validate GitHub token:', error);
            return { valid: false };
        }
    }

    /**
     * List organizations for the authenticated user
     */
    async listUserOrganizations(): Promise<
        Array<{ login: string; name: string; avatarUrl: string; description: string }>
    > {
        try {
            if (!this.githubService) {
                throw new Error('GitHub service not initialized');
            }
            return await this.githubService.listUserOrganizations();
        } catch (error) {
            console.error('Failed to list user organizations:', error);
            throw error;
        }
    }

    /**
     * Get detailed branch information
     */
    async listBranchesDetailed(
        owner: string,
        repo: string
    ): Promise<
        Array<{
            name: string;
            protected: boolean;
            sha: string;
            lastCommit?: { message: string; author: string; date: string };
        }>
    > {
        try {
            if (!this.githubService) {
                throw new Error('GitHub service not initialized');
            }
            return await this.githubService.listBranchesDetailed(owner, repo);
        } catch (error) {
            console.error('Failed to list detailed branches:', error);
            throw error;
        }
    }
}
