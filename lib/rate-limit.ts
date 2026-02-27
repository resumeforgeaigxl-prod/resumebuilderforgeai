/** Simple in-memory sliding-window rate limiter (per IP). */

const store = new Map<string, number[]>();

interface RateLimitOptions {
    key: string;         // usually IP
    limit: number;       // max requests
    windowMs: number;    // window in milliseconds
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = (store.get(key) ?? []).filter(t => t > windowStart);
    timestamps.push(now);
    store.set(key, timestamps);

    const allowed = timestamps.length <= limit;
    const remaining = Math.max(0, limit - timestamps.length);
    return { allowed, remaining };
}
