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

async function fetchFromOpenRouter(prompt: string, model: string): Promise<string> {
    const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();

    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
    }

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
                    content: "You are an ATS resume optimization AI. When asked to return JSON, return ONLY valid JSON with no markdown formatting, no code blocks, and no extra text.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.2,
            max_tokens: 1800,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI] OpenRouter error (${response.status}):`, errorText);
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("OpenRouter returned an empty response.");
    }

    return content;
}

export async function generateAIResponse(
    prompt: string,
    selectedModel?: string
): Promise<string> {
    const model = selectedModel || DEFAULT_MODEL;

    try {
        console.log(`[AI] Using model: ${model}`);
        const text = await fetchFromOpenRouter(prompt, model);
        console.log(`[AI] Success. Response length: ${text.length}`);
        return text;
    } catch (err: unknown) {
        // If user selected a non-default model and it fails, retry with default
        const errMessage = err instanceof Error ? err.message : String(err);
        if (model !== FALLBACK_MODEL) {
            console.warn(`[AI] Model ${model} failed. Falling back to ${FALLBACK_MODEL}. Error: ${errMessage}`);
            try {
                const text = await fetchFromOpenRouter(prompt, FALLBACK_MODEL);
                console.log(`[AI] Fallback success. Response length: ${text.length}`);
                return text;
            } catch (fallbackErr: unknown) {
                const fallbackMessage = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
                console.error("[AI] Fallback also failed:", fallbackMessage);
                throw new Error(`AI generation failed: ${fallbackMessage}`);
            }
        }
        throw new Error(`AI generation failed: ${errMessage}`);
    }
}
