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
 * Get a random Gemini client
 */
function getGeminiClient() {
    if (GEMINI_KEYS.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * GEMINI_KEYS.length);
    return new GoogleGenerativeAI(GEMINI_KEYS[randomIndex]);
}

async function fallbackViaOpenRouter(
    prompt: string,
    systemInstruction?: string
): Promise<string> {
    const result = await generateAIResponse(
        prompt,
        "google/gemini-2.0-flash-001",
        systemInstruction,
        0.3,
        2500
    );
    return result.text;
}

export async function generateContentGemini(prompt: string, systemInstruction?: string) {
    try {
        const client = getGeminiClient();
        if (client) {
            const model = client.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction,
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }

        return await fallbackViaOpenRouter(prompt, systemInstruction);
    } catch (error) {
        console.error("Gemini API Error:", error);

        try {
            return await fallbackViaOpenRouter(prompt, systemInstruction);
        } catch (fallbackError) {
            console.error("OpenRouter fallback for Gemini content failed:", fallbackError);
            throw new Error("AI service unavailable");
        }
    }
}

export async function generateJsonGemini(prompt: string, systemInstruction?: string) {
    try {
        const client = getGeminiClient();
        if (client) {
            const model = client.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction,
                generationConfig: {
                    responseMimeType: "application/json",
                },
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        }

        const text = await fallbackViaOpenRouter(
            `${prompt}\n\nReturn only valid JSON with no markdown.`,
            systemInstruction
        );
        return JSON.parse(extractJson(text));
    } catch (error) {
        console.error("Gemini JSON Error:", error);

        try {
            const text = await fallbackViaOpenRouter(
                `${prompt}\n\nReturn only valid JSON with no markdown.`,
                systemInstruction
            );
            return JSON.parse(extractJson(text));
        } catch (fallbackError) {
            console.error("OpenRouter fallback for Gemini JSON failed:", fallbackError);
            throw new Error("AI service unavailable");
        }
    }
}

/**
 * Performs a grounded search using Gemini 2.0 Google Search tool
 */
export async function generateGroundedJobSearch(query: string) {
    try {
        const client = getGeminiClient();
        if (!client) throw new Error("No Gemini client available");

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
