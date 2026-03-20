import { AIProviderName, ProviderClient } from '../types';
import { GeminiProvider } from './gemini';
import { GenericOpenAIProvider } from './generic';

export const providers: Record<AIProviderName, ProviderClient> = {
    'gemini': new GeminiProvider(),
    'openrouter': new GenericOpenAIProvider('openrouter'),
    'groq': new GenericOpenAIProvider('groq'),
    'together': new GenericOpenAIProvider('together'),
    'mistral': new GenericOpenAIProvider('mistral'),
    'deepseek': new GenericOpenAIProvider('deepseek'),
    'huggingface': new GenericOpenAIProvider('huggingface'), // HF needs a specialized client usually, but skipping for now or using generic if compatible
    'cloudflare': new GenericOpenAIProvider('cloudflare'), // Placeholder
};
