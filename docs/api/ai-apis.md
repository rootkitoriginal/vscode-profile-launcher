# AI APIs Integration

## Overview

The VS Code Profile Launcher integrates with two major AI providers:
- **Google Gemini** - Advanced AI models from Google
- **OpenAI** - GPT models including GPT-4 and GPT-3.5

These integrations enable code generation, template creation, and intelligent suggestions for development profiles.

## Architecture

```
AIController → AIService → AI Providers (Gemini/OpenAI)
```

## Supported Providers

### Google Gemini

**Models Available:**
- `gemini-2.0-flash-exp` - Latest experimental flash model
- `gemini-1.5-flash` - Fast and efficient model
- `gemini-1.5-pro` - Most capable model
- `gemini-1.0-pro` - Previous generation model

### OpenAI

**Models Available:**
- `gpt-4` - Most capable GPT model
- `gpt-4-turbo` - Enhanced GPT-4 with larger context
- `gpt-3.5-turbo` - Fast and cost-effective

## Authentication

### Setting Up API Keys

#### Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Create a new API key
3. Configure in application:
   ```javascript
   await window.electronAPI.updateApiKey('gemini', 'your_api_key_here');
   ```

#### OpenAI API Key

1. Visit: https://platform.openai.com/api-keys
2. Create a new API key
3. Configure in application:
   ```javascript
   await window.electronAPI.updateApiKey('openai', 'your_api_key_here');
   ```

### Retrieving Configured Keys

```javascript
const keys = await window.electronAPI.getApiKeys();
// Returns: { geminiApiKey: string, openaiApiKey: string }
```

### Checking Available Providers

```javascript
const providers = await window.electronAPI.getAvailableProviders();
// Returns: Array<{ name: 'gemini' | 'openai', configured: boolean }>

// Example response:
// [
//   { name: 'gemini', configured: true },
//   { name: 'openai', configured: false }
// ]
```

## API Operations

### 1. Get AI Providers

Retrieve list of all available AI providers and their models:

```javascript
const providers = await window.electronAPI.getAIProviders();
```

**Response Format:**
```typescript
interface AIProvider {
    name: 'gemini' | 'openai';
    displayName: string;
    models: AIModel[];
}

interface AIModel {
    id: string;
    name: string;
    description?: string;
}
```

**Example Response:**
```json
[
    {
        "name": "gemini",
        "displayName": "Google Gemini",
        "models": [
            {
                "id": "gemini-2.0-flash-exp",
                "name": "Gemini 2.0 Flash",
                "description": "Latest experimental flash model"
            }
        ]
    },
    {
        "name": "openai",
        "displayName": "OpenAI",
        "models": [
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "description": "Most capable GPT model"
            }
        ]
    }
]
```

### 2. Generate Code Template

Generate a complete code template for a new project:

```javascript
const template = await window.electronAPI.generateCodeTemplate(
    'TypeScript',           // language
    'MyAwesomeProject',     // project name
    'A web application',    // description (optional)
    'gemini',              // preferred provider (optional)
    'gemini-1.5-flash'     // preferred model (optional)
);
```

**Response Format:**
```typescript
interface AIResponse {
    content: string;      // Generated code
    success: boolean;     // Whether request succeeded
    error?: string;       // Error message if failed
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
}
```

### 3. Generate Custom Code

Generate code based on a custom prompt:

```javascript
const request = {
    prompt: 'Create a function to validate email addresses',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    systemPrompt: 'You are a helpful coding assistant' // optional
};

const result = await window.electronAPI.generateCode(request);
```

## Service Implementation

### Class: AIService

**Location:** `src/services/AIService.ts`

#### Service Structure

```typescript
export class AIService {
    private static instance: AIService;
    private config: ConfigService;
    private geminiClient: GoogleGenerativeAI | null = null;
    private openaiClient: OpenAI | null = null;
    
    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }
}
```

#### Client Initialization

```typescript
private initializeClients(): void {
    // Initialize Gemini client
    const geminiKey = this.config.getApiKey('gemini');
    if (geminiKey) {
        this.geminiClient = new GoogleGenerativeAI(geminiKey);
    }
    
    // Initialize OpenAI client
    const openaiKey = this.config.getApiKey('openai');
    if (openaiKey) {
        this.openaiClient = new OpenAI({ apiKey: openaiKey });
    }
}
```

#### Gemini Integration

```typescript
private async generateWithGemini(request: AIRequest): Promise<AIResponse> {
    if (!this.geminiClient) {
        throw new Error('Gemini API key not configured');
    }
    
    const model = this.geminiClient.getGenerativeModel({ 
        model: request.model 
    });
    
    const result = await model.generateContent(request.prompt);
    const response = await result.response;
    
    return {
        content: response.text(),
        success: true,
        usage: {
            promptTokens: response.usageMetadata?.promptTokenCount,
            completionTokens: response.usageMetadata?.candidatesTokenCount,
            totalTokens: response.usageMetadata?.totalTokenCount
        }
    };
}
```

#### OpenAI Integration

```typescript
private async generateWithOpenAI(request: AIRequest): Promise<AIResponse> {
    if (!this.openaiClient) {
        throw new Error('OpenAI API key not configured');
    }
    
    const completion = await this.openaiClient.chat.completions.create({
        model: request.model,
        messages: [
            { role: 'system', content: request.systemPrompt || 'You are a helpful assistant.' },
            { role: 'user', content: request.prompt }
        ]
    });
    
    return {
        content: completion.choices[0]?.message?.content || '',
        success: true,
        usage: {
            promptTokens: completion.usage?.prompt_tokens,
            completionTokens: completion.usage?.completion_tokens,
            totalTokens: completion.usage?.total_tokens
        }
    };
}
```

### Automatic Provider Selection

The service automatically selects an available provider if none is specified:

```typescript
public async generateCode(request: AIRequest): Promise<AIResponse> {
    // If no provider specified, use first available
    if (!request.provider) {
        const available = this.getAvailableProviders();
        if (available.length === 0) {
            throw new Error('No AI providers configured');
        }
        request.provider = available[0].name;
    }
    
    // Route to appropriate provider
    if (request.provider === 'gemini') {
        return this.generateWithGemini(request);
    } else {
        return this.generateWithOpenAI(request);
    }
}
```

## Controller Layer

### AIController

**Location:** `src/controllers/AIController.ts`

```typescript
export class AIController {
    private aiService: AIService;
    
    constructor(aiService: AIService) {
        this.aiService = aiService;
    }
    
    public getAIProviders(): AIProvider[] {
        return AI_PROVIDERS;
    }
    
    public getAvailableProviders(): Array<{ name: 'gemini' | 'openai'; configured: boolean }> {
        return this.aiService.getAvailableProviders();
    }
    
    public async generateCode(request: AIRequest): Promise<AIResponse> {
        return this.aiService.generateCode(request);
    }
}
```

## Error Handling

### Common Errors

```javascript
try {
    const result = await window.electronAPI.generateCode(request);
} catch (error) {
    if (error.message.includes('API key not configured')) {
        console.error('Please configure AI API key');
    } else if (error.message.includes('quota')) {
        console.error('API quota exceeded');
    } else {
        console.error('AI generation error:', error);
    }
}
```

### Error Types

1. **Configuration Errors**
   - Missing API key
   - Invalid API key format

2. **API Errors**
   - Quota exceeded
   - Rate limit hit
   - Invalid model specified
   - Network errors

3. **Content Errors**
   - Content filtered by safety settings
   - Prompt too long
   - Invalid request format

## Rate Limiting & Quotas

### Gemini API

- **Free tier**: 60 requests per minute
- **Rate limit**: Automatic exponential backoff recommended
- **Context window**: Varies by model (up to 2M tokens for Gemini 1.5 Pro)

### OpenAI API

- **Rate limits**: Depend on your organization's tier
- **Token limits**: Vary by model (up to 128K for GPT-4 Turbo)
- **Cost**: Pay per token (input + output)

## Best Practices

### 1. Provider Selection

```javascript
// Check available providers before requesting
const available = await window.electronAPI.getAvailableProviders();
const configuredProvider = available.find(p => p.configured);

if (configuredProvider) {
    const result = await window.electronAPI.generateCode({
        prompt: 'Generate code',
        provider: configuredProvider.name,
        model: getDefaultModel(configuredProvider.name)
    });
}
```

### 2. Prompt Engineering

```javascript
// Be specific and provide context
const prompt = `
Create a TypeScript function that:
- Validates email addresses using regex
- Returns boolean
- Has proper error handling
- Includes JSDoc comments

Example usage should be included.
`;
```

### 3. Error Recovery

```javascript
async function generateWithFallback(prompt) {
    const providers = await window.electronAPI.getAvailableProviders();
    
    for (const provider of providers.filter(p => p.configured)) {
        try {
            return await window.electronAPI.generateCode({
                prompt,
                provider: provider.name,
                model: getDefaultModel(provider.name)
            });
        } catch (error) {
            console.warn(`${provider.name} failed, trying next...`);
        }
    }
    
    throw new Error('All AI providers failed');
}
```

### 4. Token Management

```javascript
// Monitor token usage
const result = await window.electronAPI.generateCode(request);
if (result.usage) {
    console.log('Tokens used:', result.usage.totalTokens);
    // Implement usage tracking and limits
}
```

## Code Templates

Default templates are available for common languages:

```typescript
export const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
    TypeScript: `// TypeScript Project Template...`,
    JavaScript: `// JavaScript Project Template...`,
    Python: `#!/usr/bin/env python3...`,
    Go: `// Go Project Template...`,
    Rust: `// Rust Project Template...`
};
```

## Testing

### Mock AI Service

```typescript
class MockAIService {
    async generateCode(request: AIRequest): Promise<AIResponse> {
        return {
            content: '// Generated code',
            success: true,
            usage: {
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30
            }
        };
    }
}
```

### Test Different Providers

```typescript
describe('AIService', () => {
    it('should generate code with Gemini', async () => {
        const result = await aiService.generateCode({
            prompt: 'Test',
            provider: 'gemini',
            model: 'gemini-1.5-flash'
        });
        expect(result.success).toBe(true);
    });
    
    it('should fallback to available provider', async () => {
        const result = await aiService.generateCode({
            prompt: 'Test'
            // No provider specified - should auto-select
        });
        expect(result.success).toBe(true);
    });
});
```

## Examples

### Generate Project Scaffold

```javascript
async function createNewProject(language, projectName) {
    const template = await window.electronAPI.generateCodeTemplate(
        language,
        projectName,
        `A ${language} project with best practices and modern architecture`
    );
    
    if (template.success) {
        // Use generated template
        console.log('Generated code:', template.content);
    }
}
```

### Generate Code with Context

```javascript
const profile = await window.electronAPI.getProfile(profileId);

const request = {
    prompt: `Generate a ${profile.language} function for data validation`,
    provider: profile.aiProvider,
    model: profile.aiModel,
    systemPrompt: `You are an expert ${profile.language} developer`
};

const result = await window.electronAPI.generateCode(request);
```

## Security Considerations

1. **API Key Storage**: Keys are stored securely and never exposed to renderer
2. **Key Rotation**: Change keys periodically
3. **Rate Limiting**: Implement client-side rate limiting
4. **Content Filtering**: Be aware of provider content policies
5. **Cost Management**: Monitor usage to avoid unexpected costs

## Related Documentation

- [MVC Architecture](../architecture/MVC-ARCHITECTURE.md)
- [Configuration Management](./config-service.md)
- [Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)

## Troubleshooting

### API Key Not Working

1. Verify key is correctly copied (no extra spaces)
2. Check key hasn't been revoked
3. Ensure key has proper permissions

### Model Not Available

1. Check model name spelling
2. Verify model is available in your region
3. Ensure you have access to the model (some require approval)

### Generation Fails

1. Check prompt isn't too long for model's context window
2. Verify prompt doesn't violate content policies
3. Check API quota/rate limits
4. Review error message for specific issues
