import { AIService } from './AIService';
import { Profile } from '../types';

/**
 * Service for generating AI-powered profile descriptions
 */
export class DescriptionGeneratorService {
    private static instance: DescriptionGeneratorService;
    private aiService: AIService;

    private constructor() {
        this.aiService = AIService.getInstance();
    }

    public static getInstance(): DescriptionGeneratorService {
        if (!DescriptionGeneratorService.instance) {
            DescriptionGeneratorService.instance = new DescriptionGeneratorService();
        }
        return DescriptionGeneratorService.instance;
    }

    /**
     * Generate a description for a profile based on its characteristics
     */
    public async generateDescription(
        profileName: string,
        language: string,
        workspacePath?: string,
        aiProvider?: string,
        aiModel?: string
    ): Promise<{ success: boolean; description?: string; error?: string }> {
        try {
            const context = `Profile for ${language} development`;
            const prompt = `Generate a concise professional description (max 150 characters) for a VS Code profile with these characteristics:

Profile Name: ${profileName}
Programming Language: ${language}
${workspacePath ? `Workspace: ${workspacePath}` : ''}

The description should:
- Be clear and professional
- Highlight the main purpose/technology
- Be under 150 characters
- Not include the profile name (already shown separately)

Return ONLY the description text, nothing else.`;

            // Use generateCodeTemplate which has proper fallback logic
            const response = await this.aiService.generateCodeTemplate(
                language,
                profileName,
                context,
                aiProvider as 'gemini' | 'openai' | undefined,
                aiModel
            );

            if (response.success && response.content) {
                // Clean up the response - extract first non-empty line
                const lines = response.content.split('\n').filter(line => line.trim());
                let description = lines[0] || response.content;
                description = description.trim();

                // Remove code block markers if present
                description = description.replace(/^```[\w]*\n?/g, '').replace(/\n?```$/g, '');
                // Remove quotes if wrapped
                description = description.replace(/^["']|["']$/g, '');
                // Remove common prefixes
                description = description.replace(/^(Description:|Profile:|Summary:)\s*/i, '');

                // Truncate if too long
                if (description.length > 150) {
                    description = description.substring(0, 147) + '...';
                }

                return {
                    success: true,
                    description,
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Failed to generate description',
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Analyze a profile to provide context for description generation
     */
    private buildProfileContext(
        profileName: string,
        language: string,
        workspacePath?: string,
        aiProvider?: string,
        aiModel?: string
    ): string {
        const parts: string[] = [];

        parts.push(`Profile for ${language} development`);

        if (profileName.toLowerCase().includes('web')) {
            parts.push('web development');
        } else if (profileName.toLowerCase().includes('api')) {
            parts.push('API development');
        } else if (profileName.toLowerCase().includes('test')) {
            parts.push('testing and QA');
        } else if (profileName.toLowerCase().includes('data')) {
            parts.push('data science/analysis');
        }

        if (workspacePath) {
            const pathParts = workspacePath.split('/').filter(Boolean);
            const projectName = pathParts[pathParts.length - 1];
            if (projectName) {
                parts.push(`project: ${projectName}`);
            }
        }

        if (aiProvider) {
            parts.push(`with ${aiProvider} AI assistance`);
        }

        return parts.join(', ');
    }
}

export default DescriptionGeneratorService.getInstance();
