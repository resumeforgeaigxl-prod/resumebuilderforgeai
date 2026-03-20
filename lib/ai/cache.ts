import { AIResponse } from './types';

class AICache {
    private cache: Map<string, { response: AIResponse, expires: number }> = new Map();
    private readonly DEFAULT_TTL = 3600 * 1000; // 1 hour

    private generateKey(prompt: string, task: string): string {
        return `${task}:${Buffer.from(prompt).toString('base64').substring(0, 100)}`;
    }

    public get(prompt: string, task: string): AIResponse | null {
        const key = this.generateKey(prompt, task);
        const entry = this.cache.get(key);
        if (entry && entry.expires > Date.now()) {
            return entry.response;
        }
        if (entry) this.cache.delete(key);
        return null;
    }

    public set(prompt: string, task: string, response: AIResponse, ttlMs?: number) {
        const key = this.generateKey(prompt, task);
        this.cache.set(key, {
            response,
            expires: Date.now() + (ttlMs || this.DEFAULT_TTL)
        });
    }

    public clear() {
        this.cache.clear();
    }
}

export const aiCache = new AICache();
