import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateAIResponse, extractJson } from "@/lib/ai-provider";

// Configuration for Gemini API Keys
// In production, these should be in environment variables like GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
const GEMINI_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
].filter(Boolean) as string[];

/**
 * Get a random Gemini API key from the list to avoid rate limits
 */
function getRandomApiKey(): string | null {
    if (GEMINI_KEYS.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * GEMINI_KEYS.length);
    return GEMINI_KEYS[randomIndex];
}

export interface ProjectForgeOutput {
    project_name: string;
    tech_stack: string[];
    folder_structure: string;
    files: Array<{
        path: string;
        code: string;
    }>;
    preview_html: string;
    explanation: string;
}

const SYSTEM_PROMPT = `You are an expert software architect and project generator.
Your task is to convert a user project idea into a complete starter project.

Return a structured project output.

Requirements:
1. Project Overview: Explain what the project does.
2. Tech Stack: Choose appropriate technologies.
3. Folder Structure: Provide a clear project directory structure.
4. Code Files: Generate starter code for the project. 
   Include multiple files such as: frontend components, backend server, database schema.
   All code must be inside markdown code blocks.
5. Preview HTML: Generate a simplified HTML preview of the user interface.
   The preview must be plain HTML + CSS only.
   Do NOT include external libraries or scripts.
6. Explanation: Explain how the project works in simple beginner language.

Output Format (JSON):
{
  "project_name": "",
  "tech_stack": [],
  "folder_structure": "",
  "files": [
    {
      "path": "",
      "code": ""
    }
  ],
  "preview_html": "",
  "explanation": ""
}

Important rules:
- Do not include unsafe scripts.
- Preview HTML must render correctly inside an iframe.
- Code must be clean, readable, and structured for beginners.`;

async function generateViaOpenRouter(userIdea: string): Promise<ProjectForgeOutput> {
    const prompt = `User Idea: ${userIdea}\n\nPlease generate the starter project based on this idea.`;
    const result = await generateAIResponse(
        prompt,
        "google/gemini-flash-1.5",
        SYSTEM_PROMPT,
        0.3,
        4000
    );
    const jsonText = extractJson(result.text);
    return JSON.parse(jsonText) as ProjectForgeOutput;
}

export async function generateProject(userIdea: string): Promise<ProjectForgeOutput> {
    const apiKey = getRandomApiKey();

    // Fallback if no direct Gemini keys are configured
    if (!apiKey) {
        console.warn("No Gemini API keys found in environment, falling back to OpenRouter...");
        return await generateViaOpenRouter(userIdea);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `User Idea: ${userIdea}\n\nPlease generate the starter project based on this idea.`;

        const result = await model.generateContent([
            { text: SYSTEM_PROMPT },
            { text: prompt }
        ]);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text) as ProjectForgeOutput;
    } catch (error) {
        console.error("ProjectForge Gemini Direct API Error:", error);
        // Secondary fallback to OpenRouter
        return await generateViaOpenRouter(userIdea);
    }
}
