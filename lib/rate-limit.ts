import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Enterprise-grade distributed rate limiter using Upstash Redis.
 * This works across all Vercel regions and serverless instances.
 */

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface RateLimitOptions {
    key: string;         // Unique identifier (IP, User ID, etc.)
    limit: number;       // Max requests
    windowMs: number;    // Window in milliseconds
}

/**
 * Rate limit a request using a sliding window strategy.
 * @returns {Promise<{ allowed: boolean; remaining: number; reset: number }>}
 */
export async function rateLimit({ key, limit, windowMs }: RateLimitOptions) {
    // Fallback to allowed if Redis is not configured (to prevent breaking the app during local dev)
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn('[RateLimit] Upstash Redis not configured. Falling back to no-limit.');
        return { allowed: true, remaining: limit, reset: Date.now() + windowMs };
    }

    const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${Math.floor(windowMs / 1000)} s`),
        analytics: true,
        prefix: '@upstash/ratelimit',
    });

    const { success, remaining, reset } = await ratelimit.limit(key);

    return { 
        allowed: success, 
        remaining, 
        reset 
    };
}
