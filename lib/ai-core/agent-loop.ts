import { GoogleGenerativeAI } from '@google/generative-ai';
import { toolsRegistry } from './tools/registry';
import { extractJson } from '@/lib/ai-provider';
import { keyPool } from '@/lib/ai/key-pool';
import { TASK_ROUTING_CHAINS, PROVIDER_CONFIGS } from '@/lib/ai/config';

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
 * Maps toolsRegistry tools schema to standard OpenAI tools format
 */
function mapToolsToOpenAI(registry: typeof toolsRegistry) {
  return Object.values(registry).map(t => {
    const mapProperties = (properties: any): any => {
      if (!properties) return {};
      const mapped: any = {};
      for (const [key, value] of Object.entries(properties)) {
        const val = value as any;
        mapped[key] = {
          ...val,
          type: String(val.type || 'string').toLowerCase(),
          ...(val.items ? {
            items: {
              ...val.items,
              type: String(val.items.type || 'string').toLowerCase()
            }
          } : {})
        };
      }
      return mapped;
    };

    return {
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object',
          properties: mapProperties(t.parameters.properties),
          required: t.parameters.required
        }
      }
    };
  });
}

/**
 * Runs the ResumeForgeAI Agentic Intelligence Loop using native Gemini or OpenAI tool calling.
 * Dynamically rotates across 5 providers (gemini, groq, openrouter, together, mistral, deepseek)
 * with robust key rotation, cooldown tracking, and failover fallback.
 */
export async function runAgenticLoop(
  message: string,
  history: Message[],
  userId: string,
  mode: string
): Promise<AgentResult> {
  const chain = TASK_ROUTING_CHAINS['mentor'] || ['gemini', 'groq', 'openrouter', 'together', 'mistral', 'deepseek'];
  console.log(`[AgentLoop] Starting task loop for 'mentor' task | Chain: ${JSON.stringify(chain)}`);

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
- When you generate a resume using the tool 'trigger_resume_generation' and it returns the resume ID, you MUST include a clickable PDF download link in your markdown response using the exact path: /api/resume/download?id=RESUME_ID (e.g. "[Download Resume PDF](/api/resume/download?id=uuid)").
`;

  let lastError: Error | null = null;

  for (const provider of chain) {
    const maxRetriesPerProvider = 3;
    for (let retry = 0; retry < maxRetriesPerProvider; retry++) {
      const key = keyPool.getNextKey(provider);
      if (!key) {
        console.warn(`[AgentLoop] No active keys for provider ${provider}.`);
        break; // Try next provider in chain
      }

      try {
        if (provider === 'gemini') {
          console.log(`[AgentLoop] Running Agent Loop on Gemini (Key ID: ${key.id})`);
          
          const functionDeclarations = Object.values(toolsRegistry).map(t => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters as any
          })) as any[];

          const client = new GoogleGenerativeAI(key.key);
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
            console.log(`[AgentLoop] Iteration ${iterations}: Gemini requested ${functionCalls.length} tool call(s)`);

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

          keyPool.markSuccess(key.id);
          const finalResponseText = result.response.text();
          const parsed = JSON.parse(extractJson(finalResponseText));
          return {
            reply: parsed.reply || '',
            suggestedAction: parsed.suggestedAction || undefined,
            memoryExtraction: parsed.memoryExtraction || undefined
          };
        } else {
          // OpenAI-style providers (Groq, OpenRouter, Together, Mistral, DeepSeek)
          console.log(`[AgentLoop] Running Agent Loop on OpenAI-style provider: ${provider} (Key ID: ${key.id})`);
          const config = PROVIDER_CONFIGS[provider];
          if (!config || !config.baseUrl) {
            throw new Error(`Provider ${provider} is missing baseUrl in config.`);
          }

          const modelName = provider === 'deepseek' ? 'deepseek-chat' : config.defaultModel;
          const openAITools = mapToolsToOpenAI(toolsRegistry);

          const messages: any[] = [
            { role: 'system', content: systemPrompt },
            ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' as const : 'user' as const, content: h.content })),
            { role: 'user', content: message }
          ];

          let iterations = 0;
          let toolCallsRequested = true;
          let finalReply = '';

          while (toolCallsRequested && iterations < 5) {
            iterations++;
            console.log(`[AgentLoop] calling ${provider} (${modelName}) iteration ${iterations}`);

            const response = await fetch(config.baseUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${key.key}`,
                'Content-Type': 'application/json',
                ...(provider === 'openrouter' ? {
                  'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
                  'X-Title': 'ResumeForge AI',
                } : {})
              },
              body: JSON.stringify({
                model: modelName,
                messages: messages,
                tools: openAITools,
                tool_choice: 'auto',
                temperature: 0.2,
                max_tokens: 4000,
                response_format: { type: 'json_object' }
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`[${provider}] API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices?.[0]?.message;
            if (!assistantMessage) {
              throw new Error(`[${provider}] Empty response from model.`);
            }

            messages.push(assistantMessage);

            const toolCalls = assistantMessage.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
              console.log(`[AgentLoop] ${provider} requested ${toolCalls.length} tool call(s)`);

              const toolOutputs = await Promise.all(toolCalls.map(async (call: any) => {
                const tool = toolsRegistry[call.function.name];
                let toolResult;
                if (!tool) {
                  toolResult = { error: `Tool '${call.function.name}' not registered.` };
                } else {
                  try {
                    const args = typeof call.function.arguments === 'string'
                      ? JSON.parse(call.function.arguments)
                      : call.function.arguments;
                    toolResult = await tool.execute(args, userId);
                  } catch (err: any) {
                    console.error(`[AgentLoop] Tool execution failed [${call.function.name}]:`, err.message);
                    toolResult = { error: `Failed to execute: ${err.message}` };
                  }
                }
                return {
                  role: 'tool',
                  tool_call_id: call.id,
                  name: call.function.name,
                  content: JSON.stringify(toolResult)
                };
              }));

              messages.push(...toolOutputs);
            } else {
              toolCallsRequested = false;
              finalReply = assistantMessage.content || '';
            }
          }

          keyPool.markSuccess(key.id);
          const parsed = JSON.parse(extractJson(finalReply));
          return {
            reply: parsed.reply || '',
            suggestedAction: parsed.suggestedAction || undefined,
            memoryExtraction: parsed.memoryExtraction || undefined
          };
        }
      } catch (error: any) {
        lastError = error;
        console.error(`[AgentLoop] Provider ${provider} with key ${key.id} failed:`, error.message);
        const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota') || error.message?.includes('Rate limit');
        keyPool.markFailure(key.id, isQuotaError);
      }
    }
  }

  throw lastError || new Error(`AI generation failed for 'mentor' task. All providers in chain exhausted.`);
}

