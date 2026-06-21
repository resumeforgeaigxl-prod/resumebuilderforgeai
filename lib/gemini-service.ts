import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateAIResponse, extractJson } from "@/lib/ai-provider";

// List of Gemini API Keys for rotation to avoid rate limits
const GEMINI_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
].filter(Boolean) as string[];

/**
 * Safe JSON parser that attempts to clean the response if parsing fails.
 */
function safeJsonParse(text: string) {
  try {
    // Attempt standard parse (assuming naked JSON from responseMimeType)
    return JSON.parse(text.trim());
  } catch {
    console.log("JSON parse failed. Cleaning response with extractJson...");

    const extracted = extractJson(text);

    try {
      return JSON.parse(extracted);
    } catch {
      console.warn("Still invalid JSON after extraction. Falling back to structured object.");
      
      const cleanedText = text
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');

      return {
        reply: cleanedText,
        error: "JSON_PARSE_FAILED",
        raw_text: text
      };
    }
  }
}

// Global index for round-robin rotation
let geminiIndex = 0;

async function fallbackViaOpenRouter(
    prompt: string,
    systemInstruction?: string
): Promise<string> {
    const result = await generateAIResponse(
        prompt,
        "google/gemini-2.0-flash-001",
        systemInstruction,
        0.3,
        8000
    );
    return result.text;
}

export async function generateContentGemini(prompt: string, systemInstruction?: string) {
    const keysCount = GEMINI_KEYS.length;
    if (keysCount === 0) {
        return await fallbackViaOpenRouter(prompt, systemInstruction);
    }

    // Try Gemini keys in rotation
    for (let i = 0; i < keysCount; i++) {
        const currentKeyIndex = (geminiIndex + i) % keysCount;
        const apiKey = GEMINI_KEYS[currentKeyIndex];
        
        console.log(`[AI] Attempting Gemini Content with Key #${currentKeyIndex}`);

        try {
            const client = new GoogleGenerativeAI(apiKey);
            const model = client.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction,
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                geminiIndex = (currentKeyIndex + 1) % keysCount; // Success, move index
                return text;
            }
        } catch (error: unknown) {
            const err = error as { status?: number; message?: string };
            const status = err?.status || 0;
            const msg = err?.message || "";
            
            console.error(`[AI] Gemini Key #${currentKeyIndex} failed:`, msg);

            // If quota or unauthorized, rotate
            if (status === 429 || status === 401 || msg.includes('429') || msg.includes('quota')) {
                console.warn(`[AI] Key #${currentKeyIndex} rate limited. Trying next...`);
                continue;
            }
            if (i === keysCount - 1) break; // End of pool
        }
    }

    console.warn("[AI] All Gemini keys failed for Content. Falling back to OpenRouter.");
    return await fallbackViaOpenRouter(prompt, systemInstruction);
}

export async function* generateContentStreamGemini(prompt: string, systemInstruction?: string) {
    const keysCount = GEMINI_KEYS.length;
    if (keysCount === 0) {
        // Fallback to non-streaming or standard OpenRouter if keys are empty
        console.warn("[AI] No Gemini keys found for streaming. Yielding full block from OpenRouter...");
        const result = await fallbackViaOpenRouter(prompt, systemInstruction);
        yield result;
        return;
    }

    for (let i = 0; i < keysCount; i++) {
        const currentKeyIndex = (geminiIndex + i) % keysCount;
        const apiKey = GEMINI_KEYS[currentKeyIndex];

        console.log(`[AI] Attempting Gemini Content Stream with Key #${currentKeyIndex}`);

        try {
            const client = new GoogleGenerativeAI(apiKey);
            const model = client.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction,
            });

            const resultStream = await model.generateContentStream(prompt);
            geminiIndex = (currentKeyIndex + 1) % keysCount; // Success update index

            for await (const chunk of resultStream.stream) {
                const text = chunk.text();
                if (text) {
                    yield text;
                }
            }
            return; // Finished streaming successfully
        } catch (error: unknown) {
            const err = error as { status?: number; message?: string };
            const status = err?.status || 0;
            const msg = err?.message || "";
            
            console.error(`[AI] Gemini Stream Key #${currentKeyIndex} failed:`, msg);

            if (status === 429 || status === 401 || msg.includes('429') || msg.includes('quota')) {
                console.warn(`[AI] Key #${currentKeyIndex} rate limited. Rotating stream key...`);
                continue;
            }
            if (i === keysCount - 1) throw error;
        }
    }
}

export async function generateJsonGemini(prompt: string, systemInstruction?: string) {
    const keysCount = GEMINI_KEYS.length;
    if (keysCount === 0) {
        return await fallbackViaOpenRouterJson(prompt, systemInstruction);
    }

    // Try Gemini keys in rotation
    for (let i = 0; i < keysCount; i++) {
        const currentKeyIndex = (geminiIndex + i) % keysCount;
        const apiKey = GEMINI_KEYS[currentKeyIndex];

        console.log(`[AI] Attempting Gemini JSON with Key #${currentKeyIndex}`);

        try {
            const client = new GoogleGenerativeAI(apiKey);
            const model = client.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction,
                generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 8192,
                },
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                geminiIndex = (currentKeyIndex + 1) % keysCount; // Success
                return safeJsonParse(text);
            }
        } catch (error: unknown) {
            const err = error as { message?: string };
            const msg = err?.message || "";
            console.error(`[AI] Gemini JSON Key #${currentKeyIndex} failed:`, msg);

            if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
                continue; // Rotate
            }
            if (i === keysCount - 1) break;
        }
    }

    console.warn("[AI] All Gemini keys failed for JSON. Falling back to OpenRouter.");
    return await fallbackViaOpenRouterJson(prompt, systemInstruction);
}

async function fallbackViaOpenRouterJson(prompt: string, systemInstruction?: string) {
    try {
        const text = await fallbackViaOpenRouter(
            `${prompt}\n\nIMPORTANT: Return ONLY valid JSON.`,
            (systemInstruction || "") + " You must output valid JSON."
        );
        return safeJsonParse(extractJson(text));
    } catch (err) {
        console.error("[AI] Final Fallback (OpenRouter) also failed:", err);
        throw new Error("AI service unavailable across all providers.");
    }
}

/**
 * Performs a grounded search using Gemini 2.0 Google Search tool
 */
export async function generateGroundedJobSearch(query: string) {
    const keysCount = GEMINI_KEYS.length;
    if (keysCount === 0) return [];

    // Use current rotation key
    const currentKeyIndex = geminiIndex % keysCount;
    const apiKey = GEMINI_KEYS[currentKeyIndex];

    try {
        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({
            model: "gemini-2.0-flash",
            tools: [{ googleSearchRetrieval: {} }]
        });

        const prompt = `Search for specific job openings for: ${query}. 
        Return a JSON array of objects with: title, company, location, job_type, apply_url, description.
        Only include real, active job postings with direct or platform apply URLs. 
        If no specific jobs are found, return an array [].`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(extractJson(text));
    } catch (error) {
        console.error("Gemini Grounded Search Error:", error);
        return [];
    }
}

/**
 * Generates a clean, structured, production-quality learning article.
 */
export async function generateLearningArticle(topicName: string) {
  const prompt = `You are an expert technical educator.
Generate a clean, structured, beginner-to-advanced learning article for the topic: "${topicName}".

STRICT FORMAT:

# ${topicName}

## Introduction
- Simple explanation of the topic
- Why it is important

## Key Concepts
- Point-wise explanation
- Definitions

## Core Topics Breakdown
Use clear sections:
### Topic 1
### Topic 2
### Topic 3

## Code Examples (if applicable)
- Proper formatted code blocks
- With explanation

## Real-world Use Cases

## Common Interview Questions

## Summary

RULES:
- Use proper headings
- Use bullet points
- Proper spacing
- No JSON
- No escape characters like \n
- No markdown backticks wrapping whole response
- Output clean markdown only
- Ensure content is detailed and professional (800+ words)
- Focus on high-quality technical explanations`;

  return generateContentGemini(prompt, "You are a senior technical writer and educator.");
}
