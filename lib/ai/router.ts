import { AIRouterOptions, AIResponse } from './types';
import { TASK_ROUTING_CHAINS } from './config';
import { providers } from './providers';
import { keyPool } from './key-pool';
import { aiCache } from './cache';
import { PricingService } from '../pricing/service';

export async function callAI(options: AIRouterOptions): Promise<AIResponse> {
    // Check credits/access first (unless it's an internal call without userId)
    if (options.userId) {
        const access = await PricingService.canPerformTask(options.userId, options.task);
        if (!access.allowed) {
            throw new Error(`[Pricing] ${access.reason}`);
        }
    }

    // Check cache first
    const cachedResponse = aiCache.get(options.prompt, options.task);
    if (cachedResponse) {
        console.log(`[AIRouter] Cache hit for task: ${options.task}`);
        return cachedResponse;
    }

    const chain = TASK_ROUTING_CHAINS[options.task];
    if (!chain || chain.length === 0) {
        throw new Error(`No routing chain defined for task: ${options.task}`);
    }

    let lastError: Error | null = null;

    for (const providerName of chain) {
        const provider = providers[providerName];
        if (!provider) {
            console.error(`[AIRouter] Provider ${providerName} not found in registry.`);
            continue;
        }

        // Try the provider with available keys
        const maxRetriesPerProvider = 3;
        for (let retry = 0; retry < maxRetriesPerProvider; retry++) {
            const key = keyPool.getNextKey(providerName);
            if (!key) {
                console.warn(`[AIRouter] No active keys for provider ${providerName}.`);
                break; // Switch to next provider in chain
            }

            try {
                console.log(`[AIRouter] Calling ${providerName} for task: ${options.task} (Attempt ${retry + 1})`);
                const response = await provider.call(options, key.key);
                
                // Success!
                keyPool.markSuccess(key.id);
                aiCache.set(options.prompt, options.task, response);

                // Track Usage (Deduct Credits)
                if (options.userId) {
                    await PricingService.trackUsage(options.userId, options.task).catch(e => 
                        console.error('[AIRouter] Usage tracking failed but AI call succeeded:', e)
                    );
                }

                return response;

            } catch (err: unknown) {
                lastError = err instanceof Error ? err : new Error(String(err));
                const message = lastError.message;
                const isQuotaError = message.includes('429') || message.includes('quota') || message.includes('Rate limit');
                
                keyPool.markFailure(key.id, isQuotaError);
                
                if (!isQuotaError && retry === maxRetriesPerProvider - 1) {
                    console.error(`[AIRouter] ${providerName} failed after ${maxRetriesPerProvider} retries:`, lastError);
                }
            }
        }
    }

    // If all providers in chain fail, return fallback structured response if requested
    if (options.responseFormat === 'json') {
        return {
            text: JSON.stringify({
                error: "AI is busy, showing partial result",
                is_fallback: true
            }),
            model: 'fallback',
            provider: 'gemini', // Dummy
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            latencyMs: 0
        };
    }

    throw lastError || new Error(`AI generation failed for task: ${options.task}. All providers exhausted.`);
}
