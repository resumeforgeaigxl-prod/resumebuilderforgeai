import { AIRouterOptions, AIResponse, ProviderClient } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PROVIDER_CONFIGS } from '../config';

export class GeminiProvider implements ProviderClient {
    name = 'gemini' as const;

    async call(options: AIRouterOptions, key: string): Promise<AIResponse> {
        const startTime = Date.now();
        const genAI = new GoogleGenerativeAI(key);
        const config = PROVIDER_CONFIGS.gemini;
        const model = genAI.getGenerativeModel({ 
            model: options.task === 'code' ? 'gemini-1.5-pro' : config.defaultModel,
            generationConfig: {
                temperature: options.temperature ?? 0.2,
                maxOutputTokens: options.maxTokens ?? 4000,
                responseMimeType: options.responseFormat === 'json' ? 'application/json' : 'text/plain',
            }
        });

        const prompt = options.systemPrompt 
            ? `${options.systemPrompt}\n\nUser Request: ${options.prompt}`
            : options.prompt;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const endTime = Date.now();

        // Gemini doesn't always provide detailed usage in the same way, 
        // but we can estimate or use metadata if available.
        return {
            text: text.trim(),
            model: config.defaultModel,
            provider: 'gemini',
            usage: {
                prompt_tokens: 0, // Simplified for now
                completion_tokens: 0,
                total_tokens: 0,
            },
            latencyMs: endTime - startTime,
        };
    }
}
