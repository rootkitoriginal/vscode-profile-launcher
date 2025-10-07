import config from './ConfigService';
import { GitHubIssue, IssueState } from '../types';

export class GitHubService {
    private octokit: any = null;
    private Octokit: any = null;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            const { Octokit } = await import('@octokit/rest');
            this.Octokit = Octokit;

            const token = config.getGitHubToken();
            if (token) {
                this.octokit = new Octokit({
                    auth: token,
                });
            }
        } catch (error) {
            console.error('Failed to initialize GitHub manager:', error);
        }
    }

    public async updateToken(token: string) {
        if (!this.Octokit) {
            await this.initialize();
        }

        if (this.Octokit) {
            this.octokit = new this.Octokit({
                auth: token,
            });
        }
    }

    public async isConfigured(): Promise<boolean> {
        if (!this.octokit && this.Octokit) {
            await this.initialize();
        }
        return this.octokit !== null;
    }

    public async listIssues(
        owner: string,
        repo: string,
        state?: IssueState
    ): Promise<GitHubIssue[]> {
        if (!this.octokit) {
            await this.initialize();
        }
        if (!this.octokit) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await this.octokit.rest.issues.listForRepo({
                owner,
                repo,
                state: state || 'open',
                sort: 'updated',
                direction: 'desc',
            });

            return response.data.map((issue: any) => ({
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body || '',
                state: issue.state as IssueState,
                labels: issue.labels.map((label: any) =>
                    typeof label === 'string' ? label : label.name || ''
                ),
                assignee: issue.assignee?.login,
                createdAt: issue.created_at,
                updatedAt: issue.updated_at,
                htmlUrl: issue.html_url,
            }));
        } catch (error) {
            console.error('Error fetching issues:', error);
            throw new Error(`Failed to fetch issues: ${error}`);
        }
    }

    public async createIssue(
        owner: string,
        repo: string,
        title: string,
        body: string,
        labels?: string[]
    ): Promise<GitHubIssue> {
        if (!this.octokit) {
            await this.initialize();
        }

        if (!this.octokit) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await this.octokit.rest.issues.create({
                owner,
                repo,
                title,
                body,
                labels,
            });

            const issue = response.data;
            return {
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body || '',
                state: issue.state as IssueState,
                labels: issue.labels.map((label: any) =>
                    typeof label === 'string' ? label : label.name || ''
                ),
                assignee: issue.assignee?.login,
                createdAt: issue.created_at,
                updatedAt: issue.updated_at,
                htmlUrl: issue.html_url,
            };
        } catch (error) {
            console.error('Error creating issue:', error);
            throw new Error(`Failed to create issue: ${error}`);
        }
    }

    public async listBranches(owner: string, repo: string): Promise<string[]> {
        if (!this.octokit) {
            await this.initialize();
        }

        if (!this.octokit) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await this.octokit.rest.repos.listBranches({
                owner,
                repo,
            });

            return response.data.map((branch: any) => branch.name);
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw new Error(`Failed to fetch branches: ${error}`);
        }
    }

    public async getRepository(owner: string, repo: string) {
        if (!this.octokit) {
            await this.initialize();
        }

        if (!this.octokit) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await this.octokit.rest.repos.get({
                owner,
                repo,
            });

            // Return full data for GitHub window
            return response.data;
        } catch (error) {
            console.error('Error fetching repository:', error);
            throw new Error(`Failed to fetch repository: ${error}`);
        }
    }

    public async validateRepository(owner: string, repo: string): Promise<boolean> {
        try {
            await this.getRepository(owner, repo);
            return true;
        } catch {
            return false;
        }
    }

    public async listRepositories(
        owner: string
    ): Promise<
        Array<{ name: string; fullName: string; description: string; defaultBranch: string }>
    > {
        if (!this.octokit) {
            await this.initialize();
        }

        if (!this.octokit) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await this.octokit.rest.repos.listForUser({
                username: owner,
                type: 'owner',
                sort: 'updated',
                direction: 'desc',
                per_page: 100,
            });

            return response.data.map((repo: any) => ({
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description || '',
                defaultBranch: repo.default_branch,
            }));
        } catch (error) {
            console.error('Error fetching repositories:', error);
            throw new Error(`Failed to fetch repositories: ${error}`);
        }
    }

    /**
     * Validate GitHub token and get authenticated user info
     */
    public async validateToken(
        token: string
    ): Promise<{ valid: boolean; user?: { login: string; name: string; avatarUrl: string } }> {
        try {
            if (!this.Octokit) {
                await this.initialize();
            }

            const tempOctokit = new this.Octokit({
                auth: token,
            });

            const response = await tempOctokit.rest.users.getAuthenticated();

            return {
                valid: true,
                user: {
                    login: response.data.login,
                    name: response.data.name || response.data.login,
                    avatarUrl: response.data.avatar_url,
                },
            };
        } catch (error) {
            console.error('Error validating token:', error);
            return { valid: false };
        }
    }

    /**
     * List organizations for the authenticated user
     */
    public async listUserOrganizations(): Promise<
        Array<{ login: string; name: string; avatarUrl: string; description: string }>
    > {
        if (!this.octokit) {
            await this.initialize();
        }

        if (!this.octokit) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await this.octokit.rest.orgs.listForAuthenticatedUser({
                per_page: 100,
            });

            return response.data.map((org: any) => ({
                login: org.login,
                name: org.name || org.login,
                avatarUrl: org.avatar_url,
                description: org.description || '',
            }));
        } catch (error) {
            console.error('Error fetching organizations:', error);
            throw new Error(`Failed to fetch organizations: ${error}`);
        }
    }

    /**
     * Get detailed branch information including last commit
     */
    public async listBranchesDetailed(
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
        if (!this.octokit) {
            await this.initialize();
        }

        if (!this.octokit) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await this.octokit.rest.repos.listBranches({
                owner,
                repo,
                per_page: 100,
            });

            return response.data.map((branch: any) => ({
                name: branch.name,
                protected: branch.protected || false,
                sha: branch.commit.sha,
                lastCommit: branch.commit
                    ? {
                          message: branch.commit.commit?.message || '',
                          author: branch.commit.commit?.author?.name || '',
                          date: branch.commit.commit?.author?.date || '',
                      }
                    : undefined,
            }));
        } catch (error) {
            console.error('Error fetching detailed branches:', error);
            throw new Error(`Failed to fetch detailed branches: ${error}`);
        }
    }

    public async listPullRequests(
        owner: string,
        repo: string,
        state: 'open' | 'closed' | 'all' = 'open'
    ): Promise<any[]> {
        if (!this.octokit) {
            throw new Error('GitHub service not initialized');
        }

        try {
            const { data } = await this.octokit.pulls.list({
                owner,
                repo,
                state,
                per_page: 30,
            });

            return data;
        } catch (error) {
            console.error('Error fetching pull requests:', error);
            throw new Error(`Failed to fetch pull requests: ${error}`);
        }
    }

    public async listCommits(owner: string, repo: string, page: number = 1): Promise<any[]> {
        if (!this.octokit) {
            throw new Error('GitHub service not initialized');
        }

        try {
            const { data } = await this.octokit.repos.listCommits({
                owner,
                repo,
                page,
                per_page: 30,
            });

            return data;
        } catch (error) {
            console.error('Error fetching commits:', error);
            throw new Error(`Failed to fetch commits: ${error}`);
        }
    }

    public async getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
        if (!this.octokit) {
            throw new Error('GitHub service not initialized');
        }

        try {
            const { data } = await this.octokit.repos.listLanguages({
                owner,
                repo,
            });

            return data;
        } catch (error) {
            console.error('Error fetching languages:', error);
            throw new Error(`Failed to fetch languages: ${error}`);
        }
    }

    public async listContributors(owner: string, repo: string): Promise<any[]> {
        if (!this.octokit) {
            throw new Error('GitHub service not initialized');
        }

        try {
            const { data } = await this.octokit.repos.listContributors({
                owner,
                repo,
                per_page: 30,
            });

            return data;
        } catch (error) {
            console.error('Error fetching contributors:', error);
            throw new Error(`Failed to fetch contributors: ${error}`);
        }
    }
}

export default new GitHubService();
