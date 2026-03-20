import { AIKey, AIProviderName } from './types';

export class AIKeyPool {
    private keys: AIKey[] = [];
    private providerIndices: Record<string, number> = {};

    constructor() {
        this.initializeFromEnv();
    }

    private initializeFromEnv() {
        // Providers and their expected key counts
        const providerCounts: Record<AIProviderName, number> = {
            'gemini': 10,
            'openrouter': 10,
            'groq': 20,
            'together': 10,
            'huggingface': 10,
            'mistral': 15,
            'cloudflare': 15,
            'deepseek': 20
        };

        const providers: AIProviderName[] = Object.keys(providerCounts) as AIProviderName[];

        providers.forEach(provider => {
            const count = providerCounts[provider];
            for (let i = 0; i < count; i++) {
                // Check for keys like GEMINI_API_KEY, GEMINI_API_KEY_1, ...
                const envName = i === 0 
                    ? `${provider.toUpperCase()}_API_KEY` 
                    : `${provider.toUpperCase()}_API_KEY_${i}`;
                
                const keyValue = process.env[envName];
                if (keyValue) {
                    this.keys.push({
                        id: `${provider}_${i}`,
                        provider: provider,
                        key: keyValue,
                        status: 'active',
                        cooldownUntil: null,
                        usageCount: 0
                    });
                }
            }
        });

        console.log(`[AIKeyPool] Initialized with ${this.keys.length} keys across ${new Set(this.keys.map(k => k.provider)).size} providers.`);
    }

    public getNextKey(provider: AIProviderName): AIKey | null {
        const providerKeys = this.keys.filter(k => 
            k.provider === provider && 
            (k.status === 'active' || (k.status === 'cooldown' && k.cooldownUntil && k.cooldownUntil < Date.now()))
        );

        if (providerKeys.length === 0) return null;

        // Reset cooldowns if they expired
        providerKeys.forEach(k => {
            if (k.status === 'cooldown' && k.cooldownUntil && k.cooldownUntil < Date.now()) {
                k.status = 'active';
                k.cooldownUntil = null;
            }
        });

        const activeKeys = providerKeys.filter(k => k.status === 'active');
        if (activeKeys.length === 0) return null;

        // Round robin
        if (this.providerIndices[provider] === undefined) {
            this.providerIndices[provider] = 0;
        }

        const index = this.providerIndices[provider] % activeKeys.length;
        const selectedKey = activeKeys[index];
        
        this.providerIndices[provider] = (index + 1) % activeKeys.length;
        
        selectedKey.usageCount++;
        return selectedKey;
    }

    public markFailure(keyId: string, isQuotaError: boolean) {
        const key = this.keys.find(k => k.id === keyId);
        if (key) {
            if (isQuotaError) {
                // 60-120 seconds cooldown
                const cooldownSeconds = 60 + Math.floor(Math.random() * 61);
                key.status = 'cooldown';
                key.cooldownUntil = Date.now() + (cooldownSeconds * 1000);
                console.warn(`[AIKeyPool] Key ${keyId} entered cooldown for ${cooldownSeconds}s.`);
            } else {
                // Other errors might just decrement usage or track for health
                console.warn(`[AIKeyPool] Key ${keyId} encountered a generic error.`);
            }
        }
    }

    public markSuccess(keyId: string) {
        const key = this.keys.find(k => k.id === keyId);
        if (key && key.status === 'cooldown') {
            key.status = 'active';
            key.cooldownUntil = null;
        }
    }
}

// Singleton instance
export const keyPool = new AIKeyPool();
