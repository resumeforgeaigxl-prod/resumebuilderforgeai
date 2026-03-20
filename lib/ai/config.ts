import { AITask, AIProviderName } from './types';

export const TASK_ROUTING_CHAINS: Record<AITask, AIProviderName[]> = {
    'resume': ['gemini', 'mistral', 'openrouter'],
    'code': ['deepseek', 'together', 'groq'],
    'interview': ['groq', 'gemini', 'openrouter'],
    'explain': ['gemini', 'deepseek', 'huggingface'],
    'mentor': ['gemini', 'groq', 'openrouter'],
    'project': ['deepseek', 'together', 'gemini'],
    'career': ['gemini', 'mistral', 'openrouter'],
    'learn': ['gemini', 'groq', 'together'],
    'knowledge': ['gemini', 'mistral', 'openrouter'],
    'job': ['gemini', 'mistral', 'openrouter'],
    'company-prep': ['gemini', 'groq', 'openrouter'],
    'roadmap': ['gemini', 'groq', 'together'],
    'study': ['gemini', 'mistral', 'openrouter'],
    'portfolio': ['gemini', 'mistral', 'openrouter'],
};

export const PROVIDER_CONFIGS: Record<AIProviderName, {
    baseUrl?: string;
    defaultModel: string;
    concurrencyLimit: number;
}> = {
    'gemini': {
        defaultModel: 'gemini-1.5-flash',
        concurrencyLimit: 5,
    },
    'openrouter': {
        baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
        defaultModel: 'openai/gpt-4o-mini',
        concurrencyLimit: 10,
    },
    'groq': {
        baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: 'llama-3.1-70b-versatile',
        concurrencyLimit: 5,
    },
    'together': {
        baseUrl: 'https://api.together.xyz/v1/chat/completions',
        defaultModel: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        concurrencyLimit: 5,
    },
    'huggingface': {
        baseUrl: 'https://api-inference.huggingface.co/models/',
        defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
        concurrencyLimit: 3,
    },
    'mistral': {
        baseUrl: 'https://api.mistral.ai/v1/chat/completions',
        defaultModel: 'mistral-medium-latest',
        concurrencyLimit: 5,
    },
    'cloudflare': {
        baseUrl: 'https://api.cloudflare.com/client/v4/accounts/',
        defaultModel: '@cf/meta/llama-3-8b-instruct',
        concurrencyLimit: 5,
    },
    'deepseek': {
        baseUrl: 'https://api.deepseek.com/chat/completions',
        defaultModel: 'deepseek-chat',
        concurrencyLimit: 5,
    },
};
