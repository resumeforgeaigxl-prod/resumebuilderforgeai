import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { toolsRegistry } from './tools/registry';
import { extractJson } from '@/lib/ai-provider';

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

let currentKeyIndex = 0;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentResult {
  reply: string;
  suggestedAction?: string;
  memoryExtraction?: {
    goals?: string[];
    weaknesses?: string[];
    improvements?: string[];
  };
}

/**
 * Runs the ResumeForgeAI Agentic Intelligence Loop using native Gemini function calling.
 */
export async function runAgenticLoop(
  message: string,
  history: Message[],
  userId: string,
  mode: string
): Promise<AgentResult> {
  const keysCount = GEMINI_KEYS.length;
  if (keysCount === 0) {
    throw new Error('No Gemini API keys configured.');
  }

  // Define tools for Gemini
  const functionDeclarations = Object.values(toolsRegistry).map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters as any
  })) as any[];

  // Build specialized mode context instructions
  const systemPrompt = `You are MentorForge AI, the elite centralized agent brain for ResumeForgeAI.
You act as the OS governing all 8 modules (resumes, coding, interviews, jobs, learning, etc.).
You have access to tools to inspect and modify user profiles, coding sandbox submissions, resume details, mock interviews, and learning progress.

STRICT RESPONSE RULE:
You MUST output your final response as a JSON object matching this schema:
{
  "reply": "Your markdown formatted technical advice or answer",
  "suggestedAction": "CodingForge | ResumeForge | InterviewForge | JobForge | StudyForge | null (one of the modules related to user query, if helpful)",
  "memoryExtraction": {
    "goals": ["extracted new learning goals"],
    "weaknesses": ["extracted technical weaknesses"],
    "improvements": ["suggested action items"]
  }
}

Guidelines:
- Explain concepts first using Markdown formatting.
- Always use tools if the user asks about their resumes, code execution, mock test scores, or jobs.
- Do not let the user know you are calling tools, simply use the tool observations to formulate your final response.
- Keep "reply" markdown structured and professional.
`;

  // Rotate through keys in case of quota issues
  for (let attempt = 0; attempt < keysCount; attempt++) {
    const keyIdx = (currentKeyIndex + attempt) % keysCount;
    const apiKey = GEMINI_KEYS[keyIdx];

    try {
      console.log(`[AgentLoop] Starting agent loop with Gemini Key #${keyIdx}`);
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({
        model: 'gemini-2.0-flash',
        tools: [{ functionDeclarations }],
        systemInstruction: systemPrompt,
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        }
      });

      // Prepare conversation history for Gemini (roles: user / model)
      const geminiHistory = (history || []).map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      const chat = model.startChat({
        history: geminiHistory
      });

      // 1. Initial turn
      let result = await chat.sendMessage(message);
      let functionCalls = result.response.functionCalls();
      let iterations = 0;

      // 2. Tool Execution Reasoning Loop (cap at 5 turns)
      while (functionCalls && functionCalls.length > 0 && iterations < 5) {
        iterations++;
        console.log(`[AgentLoop] Iteration ${iterations}: Model requested ${functionCalls.length} tool call(s)`);

        const responsesParts = await Promise.all(functionCalls.map(async (call: any) => {
          const tool = toolsRegistry[call.name];
          let toolResult;
          if (!tool) {
            toolResult = { error: `Tool '${call.name}' not registered.` };
          } else {
            try {
              toolResult = await tool.execute(call.args, userId);
            } catch (err: any) {
              console.error(`[AgentLoop] Tool execution failed [${call.name}]:`, err.message);
              toolResult = { error: `Failed to execute: ${err.message}` };
            }
          }
          return {
            functionResponse: {
              name: call.name,
              response: toolResult
            }
          };
        }));

        // Send tool observations back
        result = await chat.sendMessage(responsesParts);
        functionCalls = result.response.functionCalls();
      }

      // Success, move global key index for next call
      currentKeyIndex = (keyIdx + 1) % keysCount;

      const finalResponseText = result.response.text();
      try {
        const parsed = JSON.parse(extractJson(finalResponseText));
        return {
          reply: parsed.reply || '',
          suggestedAction: parsed.suggestedAction || undefined,
          memoryExtraction: parsed.memoryExtraction || undefined
        };
      } catch (parseError) {
        console.warn('[AgentLoop] Final response was not valid JSON, returning raw text.');
        return {
          reply: finalResponseText,
          suggestedAction: undefined,
          memoryExtraction: undefined
        };
      }

    } catch (error: any) {
      console.error(`[AgentLoop] Key #${keyIdx} failed:`, error.message);
      if (error.message?.includes('429') || error.message?.toLowerCase().includes('quota')) {
        console.warn(`[AgentLoop] Key #${keyIdx} rate limited, trying next...`);
        continue;
      }
      throw error; // Rethrow other errors
    }
  }

  throw new Error('All Gemini API keys exhausted or rate limited.');
}
