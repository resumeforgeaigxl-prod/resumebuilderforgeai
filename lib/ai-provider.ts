/**
 * OpenRouter AI Provider
 * Uses simple fetch — no SDK required.
 * Supports any model available on openrouter.ai
 */

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "openai/gpt-4o-mini";
const FALLBACK_MODEL = "openai/gpt-4o-mini";

export const AVAILABLE_MODELS = [
    { id: "openai/gpt-4o-mini", label: "GPT-4o Mini (Default)" },
    { id: "anthropic/claude-3-haiku", label: "Claude 3 Haiku" },
    { id: "google/gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { id: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
];

interface AIResponseMetadata {
    text: string;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export function stripMarkdown(text: string): string {
    return text
        .replace(/^```[a-z]*\n/i, '') // beginning of code blocks
        .replace(/\n```$/i, '')        // end of code blocks
        .replace(/[*#>`~]/g, '')      // standard markdown symbols
        .replace(/!\[.*?\]\(.*?\)/g, '') // images
        .replace(/\[.*?\]\(.*?\)/g, '$1') // links (keep text)
        .trim();
}

/**
 * Specifically extracts JSON from a string, handles code fences.
 * Supports both objects {...} and arrays [...]
 */
export function extractJson(text: string): string {
    // Try to find the LARGEST possible block between ```json and ```
    // This avoids terminating early at code blocks nested INSIDE the JSON strings
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*)\s*```/i);
    if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1].trim();
    }

    // Try to find the first and last array brackets
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    // Try to find the first and last braces
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    // Determine if we should treat it as an array or object based on which appears first
    const hasArray = firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket;
    const hasObject = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace;

    if (hasArray && (!hasObject || firstBracket < firstBrace)) {
        return text.substring(firstBracket, lastBracket + 1).trim();
    } else if (hasObject) {
        return text.substring(firstBrace, lastBrace + 1).trim();
    }

    // If no brackets but maybe valid JSON string
    return text.trim();
}

// OpenRouter API Keys list for rotation to avoid rate limits
const OPENROUTER_KEYS = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3,
    process.env.OPENROUTER_API_KEY_4,
    process.env.OPENROUTER_API_KEY_5,
    process.env.OPENROUTER_API_KEY_6,
    process.env.OPENROUTER_API_KEY_7,
].filter(Boolean) as string[];

/**
 * Get a random OpenRouter API key from the list
 */
function getRandomOpenRouterKey(): string | null {
    if (OPENROUTER_KEYS.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * OPENROUTER_KEYS.length);
    return OPENROUTER_KEYS[randomIndex];
}

async function fetchFromOpenRouter(
    prompt: string,
    model: string,
    customSystemPrompt?: string,
    temp?: number,
    maxTokens?: number
): Promise<AIResponseMetadata> {
    const apiKey = getRandomOpenRouterKey();

    if (!apiKey) {
        throw new Error("No OPENROUTER_API_KEY found in environment variables.");
    }

    const systemPrompt = customSystemPrompt || "You are an ATS resume optimization AI. When asked to return JSON, return ONLY valid JSON with no markdown formatting, no code blocks, and no extra text.";

    const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
            "X-Title": "ResumeForge AI",
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: temp ?? 0.2,
            max_tokens: maxTokens ?? 4000,
            response_format: model.includes('gpt') || model.includes('gemini') || model.includes('claude') ? { type: 'json_object' } : undefined,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI] OpenRouter error (${response.status}):`, errorText);
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const usage = data?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    if (!content) {
        throw new Error("OpenRouter returned an empty response.");
    }

    return {
        text: content,
        model: data?.model || model,
        usage: usage
    };
}

export async function generateAIResponse(
    prompt: string,
    selectedModel?: string,
    systemPrompt?: string,
    temp?: number,
    maxTokens?: number
): Promise<AIResponseMetadata> {
    const model = selectedModel || DEFAULT_MODEL;

    try {
        console.log(`[AI] Using model: ${model}`);
        const result = await fetchFromOpenRouter(prompt, model, systemPrompt, temp, maxTokens);
        console.log(`[AI] Success. Response length: ${result.text.length}`);
        return result;
    } catch (err: unknown) {
        // If user selected a non-default model and it fails, retry with default
        const errMessage = err instanceof Error ? err.message : String(err);
        if (model !== FALLBACK_MODEL) {
            console.warn(`[AI] Model ${model} failed. Falling back to ${FALLBACK_MODEL}. Error: ${errMessage}`);
            try {
                const result = await fetchFromOpenRouter(prompt, FALLBACK_MODEL, systemPrompt, temp, maxTokens);
                console.log(`[AI] Fallback success. Response length: ${result.text.length}`);
                return result;
            } catch (fallbackErr: unknown) {
                const fallbackMessage = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
                console.error("[AI] Fallback also failed:", fallbackMessage);
                throw new Error(`AI generation failed: ${fallbackMessage}`);
            }
        }
        throw new Error(`AI generation failed: ${errMessage}`);
    }
}

export async function logAIUsage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    userId: string,
    conversationId: string | null,
    result: AIResponseMetadata,
    responseTimeMs: number
) {
    try {
        await supabase.from('ai_usage_logs').insert({
            user_id: userId,
            conversation_id: conversationId,
            model_used: result.model,
            tokens_used: result.usage.total_tokens,
            response_time_ms: responseTimeMs
        });
    } catch (err) {
        console.error('[AI Usage Log Error]', err);
    }
}
