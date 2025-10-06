import { GitHubIssue, IssueState } from '../types';

/**
 * GitHubController handles GitHub integration operations
 */
export class GitHubController {
    private githubService: any;

    constructor(githubService: any) {
        this.githubService = githubService;
    }

    /**
     * Update GitHub service instance (for lazy loading)
     */
    updateService(githubService: any): void {
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
    async listRepositories(owner: string): Promise<any[]> {
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
}
