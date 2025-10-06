import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { ConfigService } from './ConfigService';

export interface AIRequest {
    prompt: string;
    provider: 'gemini' | 'openai';
    model: string;
    systemPrompt?: string;
}

export interface AIResponse {
    content: string;
    success: boolean;
    error?: string;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
}

export class AIService {
    private static instance: AIService;
    private config: ConfigService;
    private geminiClient: GoogleGenerativeAI | null = null;
    private openaiClient: OpenAI | null = null;

    private constructor() {
        this.config = ConfigService.getInstance();
        this.initializeClients();
    }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    private initializeClients(): void {
        // Initialize Gemini client
        const geminiKey = this.config.getApiKey('gemini');
        if (geminiKey) {
            this.geminiClient = new GoogleGenerativeAI(geminiKey);
        }

        // Initialize OpenAI client
        const openaiKey = this.config.getApiKey('openai');
        if (openaiKey) {
            this.openaiClient = new OpenAI({
                apiKey: openaiKey
            });
        }
    }

    public updateApiKey(provider: 'gemini' | 'openai', apiKey: string): void {
        this.config.updateApiKey(provider, apiKey);
        
        if (provider === 'gemini') {
            this.geminiClient = apiKey ? new GoogleGenerativeAI(apiKey) : null;
        } else if (provider === 'openai') {
            this.openaiClient = apiKey ? new OpenAI({ apiKey }) : null;
        }
    }

    public async generateCode(request: AIRequest): Promise<AIResponse> {
        try {
            if (request.provider === 'gemini') {
                return await this.generateWithGemini(request);
            } else if (request.provider === 'openai') {
                return await this.generateWithOpenAI(request);
            } else {
                return {
                    content: '',
                    success: false,
                    error: 'Unsupported AI provider'
                };
            }
        } catch (error) {
            return {
                content: '',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    private async generateWithGemini(request: AIRequest): Promise<AIResponse> {
        if (!this.geminiClient) {
            return {
                content: '',
                success: false,
                error: 'Gemini API key not configured'
            };
        }

        try {
            const model = this.geminiClient.getGenerativeModel({ model: request.model });
            
            let fullPrompt = request.prompt;
            if (request.systemPrompt) {
                fullPrompt = `${request.systemPrompt}\n\n${request.prompt}`;
            }

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            return {
                content: text,
                success: true,
                usage: {
                    promptTokens: 0, // Gemini API doesn't provide detailed token counts
                    completionTokens: 0,
                    totalTokens: 0
                }
            };
        } catch (error) {
            return {
                content: '',
                success: false,
                error: error instanceof Error ? error.message : 'Gemini API error'
            };
        }
    }

    private async generateWithOpenAI(request: AIRequest): Promise<AIResponse> {
        if (!this.openaiClient) {
            return {
                content: '',
                success: false,
                error: 'OpenAI API key not configured'
            };
        }

        try {
            const messages: any[] = [];
            
            if (request.systemPrompt) {
                messages.push({
                    role: 'system',
                    content: request.systemPrompt
                });
            }
            
            messages.push({
                role: 'user',
                content: request.prompt
            });

            const completion = await this.openaiClient.chat.completions.create({
                model: request.model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 4000
            });

            const content = completion.choices[0]?.message?.content || '';

            return {
                content,
                success: true,
                usage: {
                    promptTokens: completion.usage?.prompt_tokens,
                    completionTokens: completion.usage?.completion_tokens,
                    totalTokens: completion.usage?.total_tokens
                }
            };
        } catch (error) {
            return {
                content: '',
                success: false,
                error: error instanceof Error ? error.message : 'OpenAI API error'
            };
        }
    }

    public async generateCodeTemplate(language: string, projectName: string, description?: string, preferredProvider?: 'gemini' | 'openai', preferredModel?: string): Promise<AIResponse> {
        const systemPrompt = `You are a helpful coding assistant. Generate a clean, well-structured code template for the specified programming language. Include comments and best practices. The code should be production-ready and follow language conventions.`;
        
        const prompt = `Create a ${language} project template for "${projectName}".
${description ? `Project description: ${description}` : ''}

Requirements:
- Use modern ${language} practices and conventions
- Include proper error handling where appropriate
- Add meaningful comments
- Create a basic project structure
- Include example usage if applicable

Please generate only the code without additional explanations.`;

        // Use preferred provider if specified and configured, otherwise fallback
        let provider: 'gemini' | 'openai';
        let model: string;

        if (preferredProvider && this.isConfigured(preferredProvider)) {
            provider = preferredProvider;
            model = preferredModel || (provider === 'gemini' 
                ? this.config.get('defaultGeminiModel') 
                : this.config.get('defaultOpenaiModel'));
        } else {
            // Fallback logic: prefer Gemini if configured, otherwise OpenAI
            if (this.config.hasValidGeminiKey()) {
                provider = 'gemini';
                model = this.config.get('defaultGeminiModel');
            } else if (this.config.hasValidOpenaiKey()) {
                provider = 'openai';
                model = this.config.get('defaultOpenaiModel');
            } else {
                return {
                    content: '',
                    success: false,
                    error: 'No AI provider is configured. Please configure at least one API key in settings.'
                };
            }
        }

        return await this.generateCode({
            prompt,
            systemPrompt,
            provider,
            model
        });
    }

    public isConfigured(provider: 'gemini' | 'openai'): boolean {
        return provider === 'gemini' 
            ? this.config.hasValidGeminiKey()
            : this.config.hasValidOpenaiKey();
    }

    public getAvailableProviders(): Array<{ name: 'gemini' | 'openai', configured: boolean }> {
        return [
            { name: 'gemini', configured: this.isConfigured('gemini') },
            { name: 'openai', configured: this.isConfigured('openai') }
        ];
    }
}