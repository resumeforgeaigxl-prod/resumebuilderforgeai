import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

/**
 * Generates a stable query hash for caching.
 * @param prompt - The user prompt.
 * @param options - Additional parameters like system prompt or model.
 */
export function generateQueryHash(prompt: string, options: Record<string, unknown> = {}): string {
    const data = JSON.stringify({ prompt, ...options });
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Checks the cache for a previous response.
 * @param queryHash - The hash of the query.
 * @returns The cached response or null.
 */
export async function getCachedResponse<T = unknown>(queryHash: string): Promise<T | null> {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('ai_cache')
            .select('response')
            .eq('query_hash', queryHash)
            .single();

        if (error || !data) return null;
        return data.response as T;
    } catch (err) {
        console.error('[AI Core Cache] Error fetching:', err);
        return null;
    }
}

/**
 * Saves an AI response to the cache.
 * @param queryHash - Unique query hash.
 * @param response - AI generated response object.
 * @param contextType - Type of context used.
 */
export async function saveToCache<T = unknown>(queryHash: string, response: T, contextType: string): Promise<void> {
    const supabase = createClient();
    try {
        await supabase
            .from('ai_cache')
            .upsert({
                query_hash: queryHash,
                response,
                context_type: contextType,
                created_at: new Date().toISOString(),
                // expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 day TTL
            }, { onConflict: 'query_hash' });
    } catch (err) {
        console.error('[AI Core Cache] Error saving:', err);
    }
}
