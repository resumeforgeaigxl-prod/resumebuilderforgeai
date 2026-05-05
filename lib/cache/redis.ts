import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Enterprise Caching Service for AI Responses.
 * Reduces costs and improves latency for repeated expensive calls.
 */
export const aiCache = {
    /**
     * Get a cached AI response.
     */
    async get<T>(key: string): Promise<T | null> {
        if (!process.env.UPSTASH_REDIS_REST_URL) return null;
        try {
            return await redis.get<T>(`ai_cache:${key}`);
        } catch (error) {
            console.error('[Cache] Get Error:', error);
            return null;
        }
    },

    /**
     * Set an AI response in cache with a default 24h TTL.
     */
    async set(key: string, value: any, ttlSeconds: number = 86400) {
        if (!process.env.UPSTASH_REDIS_REST_URL) return;
        try {
            await redis.set(`ai_cache:${key}`, value, { ex: ttlSeconds });
        } catch (error) {
            console.error('[Cache] Set Error:', error);
        }
    },

    /**
     * Generate a unique cache key from a prompt/input object.
     */
    generateKey(input: any): string {
        const str = typeof input === 'string' ? input : JSON.stringify(input);
        // Simple hash or just base64 for key safety
        return Buffer.from(str).toString('base64').slice(0, 100);
    }
};
