import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateAIResponse, extractJson } from "@/lib/ai-provider";

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
const geminiClient = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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
        if (geminiClient) {
            const model = geminiClient.getGenerativeModel({
                model: "gemini-1.5-flash",
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
        if (geminiClient) {
            const model = geminiClient.getGenerativeModel({
                model: "gemini-1.5-flash",
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
