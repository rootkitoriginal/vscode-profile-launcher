import { DescriptionGeneratorService } from '../services/DescriptionGeneratorService';

/**
 * Controller for AI-powered description generation
 */
export class DescriptionGeneratorController {
    private descriptionService: DescriptionGeneratorService;

    constructor(descriptionService: DescriptionGeneratorService) {
        this.descriptionService = descriptionService;
    }

    /**
     * Generate a description for a profile
     */
    async generateDescription(
        profileName: string,
        language: string,
        workspacePath?: string,
        aiProvider?: string,
        aiModel?: string
    ): Promise<{ success: boolean; description?: string; error?: string }> {
        try {
            return await this.descriptionService.generateDescription(
                profileName,
                language,
                workspacePath,
                aiProvider,
                aiModel
            );
        } catch (error) {
            console.error('Failed to generate description:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
