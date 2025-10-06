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

            return {
                name: response.data.name,
                fullName: response.data.full_name,
                description: response.data.description,
                defaultBranch: response.data.default_branch,
                cloneUrl: response.data.clone_url,
                sshUrl: response.data.ssh_url,
            };
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
}

export default new GitHubService();
