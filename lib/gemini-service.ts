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
    return JSON.parse(text);
  } catch {
    console.log("JSON parse failed. Cleaning response...");

    // Use the improved extractJson logic to find the JSON block inside text
    const extracted = extractJson(text);

    try {
      return JSON.parse(extracted);
    } catch {
      console.log("Still invalid JSON. Returning content wrapped in 'reply' to prevent crash.");
      
      // Clean up stringified newlines and quotes if they exist in the raw text
      const cleanedText = text
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');

      // Return a structure that matches common AI routes (especially MentorForge)
      return {
        reply: cleanedText,
        suggestedAction: null,
        memoryExtraction: { goals: [], weaknesses: [], strengths: [] },
        error: "JSON_PARSE_FAILED"
      };
    }
  }
}

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
        8000
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
                    maxOutputTokens: 8000,
                },
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return safeJsonParse(response.text());
        }
        console.warn("No Gemini client available, using fallback");

        const text = await fallbackViaOpenRouter(
            `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. Escape all special characters and newlines correctly.`,
            (systemInstruction || "") + " You must output valid JSON."
        );
        return safeJsonParse(extractJson(text));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Native Gemini JSON Error:", msg);

        try {
            const text = await fallbackViaOpenRouter(
                `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. Escape all special characters and newlines correctly.`,
                (systemInstruction || "") + " You must output valid JSON."
            );
            return safeJsonParse(extractJson(text));
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
