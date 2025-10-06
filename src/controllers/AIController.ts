import { AIService } from '../services/AIService';
import { AIRequest, AIResponse } from '../services/AIService';
import { AI_PROVIDERS } from '../types';

/**
 * AIController handles AI-related operations
 */
export class AIController {
    private aiService: AIService;

    constructor(aiService: AIService) {
        this.aiService = aiService;
    }

    /**
     * Get list of available AI providers
     */
    getAIProviders(): typeof AI_PROVIDERS {
        return AI_PROVIDERS;
    }

    /**
     * Get available AI providers based on configured API keys
     */
    async getAvailableProviders(): Promise<
        Array<{ name: 'gemini' | 'openai'; configured: boolean }>
    > {
        try {
            return this.aiService.getAvailableProviders();
        } catch (error) {
            console.error('Error fetching available providers:', error);
            throw error;
        }
    }

    /**
     * Generate code from a prompt
     */
    async generateCode(request: AIRequest): Promise<AIResponse> {
        try {
            return await this.aiService.generateCode(request);
        } catch (error) {
            console.error('Error generating code:', error);
            throw error;
        }
    }

    /**
     * Generate a code template for a specific language
     */
    async generateCodeTemplate(
        language: string,
        projectName: string,
        description?: string,
        preferredProvider?: 'gemini' | 'openai',
        preferredModel?: string
    ): Promise<AIResponse> {
        try {
            return await this.aiService.generateCodeTemplate(
                language,
                projectName,
                description,
                preferredProvider,
                preferredModel
            );
        } catch (error) {
            console.error('Error generating code template:', error);
            throw error;
        }
    }
}
