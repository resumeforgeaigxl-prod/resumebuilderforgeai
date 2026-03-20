import { AIRouterOptions, AIResponse, ProviderClient, AIProviderName } from '../types';
import { PROVIDER_CONFIGS } from '../config';

export class GenericOpenAIProvider implements ProviderClient {
    constructor(public name: AIProviderName) {}

    async call(options: AIRouterOptions, key: string): Promise<AIResponse> {
        const startTime = Date.now();
        const config = PROVIDER_CONFIGS[this.name];
        
        if (!config.baseUrl) {
            throw new Error(`Provider ${this.name} missing baseUrl in config.`);
        }

        const model = options.task === 'code' && this.name === 'deepseek' 
            ? 'deepseek-coder' 
            : config.defaultModel;

        const response = await fetch(config.baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                // Specific headers for OpenRouter
                ...(this.name === 'openrouter' ? {
                    'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
                    'X-Title': 'ResumeForge AI',
                } : {}),
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
                    { role: 'user', content: options.prompt },
                ],
                temperature: options.temperature ?? 0.2,
                max_tokens: options.maxTokens ?? 4000,
                response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`[${this.name}] API Error ${response.status}: ${error}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const endTime = Date.now();

        return {
            text: content.trim(),
            model: data.model || model,
            provider: this.name,
            usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            latencyMs: endTime - startTime,
        };
    }
}
