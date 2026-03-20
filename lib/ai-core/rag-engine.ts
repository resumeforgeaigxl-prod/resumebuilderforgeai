import { generateContentGemini, generateJsonGemini } from '@/lib/gemini-service';
import { buildCentralizedContext, ContextType } from './context-builder';
import { retrieveRelevantDocs } from './retriever';
import { generateQueryHash, getCachedResponse, saveToCache } from './cache';

export interface AIRequestOptions {
    userId: string;
    contextType: ContextType;
    jsonMode?: boolean;
    systemPrompt?: string;
    temperature?: number;
    useCache?: boolean;
    model?: string;
}

/**
 * The Centralized AI Brain (RAG Engine).
 * Orchestrates context, retrieval, and AI generation with caching.
 */
export async function generateAIResponse(
    message: string,
    options: AIRequestOptions
) {
    const { userId, contextType, jsonMode = false, systemPrompt, useCache = true } = options;

    // 1. Generate Query Hash for Caching
    const queryHash = generateQueryHash(message, { contextType, jsonMode, systemPrompt });

    // 2. Check Cache
    if (useCache) {
        const cached = await getCachedResponse(queryHash);
        if (cached) {
            console.log(`[AI Core] Cache hit for query: ${queryHash}`);
            return cached;
        }
    }

    // 3. Build Context (User-specific)
    const context = await buildCentralizedContext(userId, contextType);

    // 4. Retrieve Supporting Knowledge (RAG)
    const docs = await retrieveRelevantDocs(message);
    const knowledgeBase = docs.length > 0 ? `\nSupporting Knowledge:\n${docs.join('\n---\n')}` : "";

    // 5. Final Prompt Construction
    const finalPrompt = `
Context:\n${context}${knowledgeBase}

User Message: ${message}
`;

    const finalSystemPrompt = systemPrompt || "You are the ResumeForgeAI Central Intelligence. Provide helpful, accurate, and concise career-related advice.";

    // 6. Call AI Provider
    let result;
    if (jsonMode) {
        result = await generateJsonGemini(finalPrompt, finalSystemPrompt);
    } else {
        result = await generateContentGemini(finalPrompt, finalSystemPrompt);
    }

    // 7. Save to Cache
    if (useCache && result) {
        await saveToCache(queryHash, result, contextType);
    }

    return result;
}
