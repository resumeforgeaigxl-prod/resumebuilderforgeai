export type AITask = 
  | 'resume'
  | 'code'
  | 'interview'
  | 'explain'
  | 'mentor'
  | 'project'
  | 'career'
  | 'learn'
  | 'knowledge'
  | 'job'
  | 'company-prep'
  | 'roadmap'
  | 'study'
  | 'portfolio';

export type AIProviderName = 
  | 'gemini'
  | 'openrouter'
  | 'groq'
  | 'together'
  | 'huggingface'
  | 'mistral'
  | 'cloudflare'
  | 'deepseek';

export type KeyStatus = 'active' | 'cooldown' | 'inactive';

export interface AIKey {
    id: string;
    provider: AIProviderName;
    key: string;
    status: KeyStatus;
    cooldownUntil: number | null;
    usageCount: number;
}

export interface AIResponse {
    text: string;
    model: string;
    provider: AIProviderName;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    latencyMs: number;
}

export interface AIRouterOptions {
    task: AITask;
    prompt: string;
    systemPrompt?: string;
    priority?: 'high' | 'normal' | 'low';
    userId?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json';
}

export interface ProviderClient {
    name: AIProviderName;
    call(options: AIRouterOptions, key: string): Promise<AIResponse>;
}
