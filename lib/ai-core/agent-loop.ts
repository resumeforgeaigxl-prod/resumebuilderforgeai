import { GoogleGenerativeAI } from '@google/generative-ai';
import { toolsRegistry } from './tools/registry';
import { extractJson } from '@/lib/ai-provider';
import { keyPool } from '@/lib/ai/key-pool';
import { TASK_ROUTING_CHAINS, PROVIDER_CONFIGS } from '@/lib/ai/config';
import { getConstitutionPrompt, ToolAuthorizer, AgentTracer } from '@/lib/agent-os';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentProgressEvent {
  type: 'tool_start' | 'tool_end' | 'thinking';
  name: string;
  args?: Record<string, unknown>;
  result?: any;
  status?: 'running' | 'finished' | 'error';
  iteration?: number;
}

export interface AgentResult {
  reply: string;
  suggestedAction?: string;
  memoryExtraction?: {
    goals?: string[];
    weaknesses?: string[];
    improvements?: string[];
  };
  artifacts?: any[];
  blocks?: any[];
}

/**
 * Sanitizes agent reply text when artifacts are present,
 * ensuring large structured outputs (tables, syllabi, bullet dumps)
 * are NEVER rendered as raw markdown prose.
 */
function sanitizeAgentReply(reply: string, artifacts?: any[]): string {
  if (!reply) return '';

  // If reply contains raw JSON dumps (e.g. from tool return values), strip out the JSON payload
  if (reply.includes('{"') || reply.includes('```json')) {
    const jsonStart = reply.search(/\{[\s\r\n]*"(?:type|tool|success|jobs|id|title|syllabus|atsScore|packageId)/);
    if (jsonStart > 0) {
      const textBefore = reply.substring(0, jsonStart).trim();
      if (textBefore) {
        return textBefore;
      }
    } else if (jsonStart === 0 && artifacts && artifacts.length > 0) {
      return 'I have found the relevant details for you in the card below:';
    }
  }

  if (!artifacts || artifacts.length === 0) return reply;

  // If the reply contains large markdown structures (tables, full headers, long bullet lists)
  const hasMarkdownBloat =
    reply.includes('|---') ||
    reply.includes('###') ||
    (reply.match(/\n\s*[-*]\s+/g) || []).length >= 3;

  if (hasMarkdownBloat) {
    const paragraphs = reply.split(/\n\s*\n/);
    const firstParagraph = paragraphs[0]?.trim();
    if (
      firstParagraph &&
      !firstParagraph.startsWith('#') &&
      !firstParagraph.startsWith('|') &&
      !firstParagraph.startsWith('-') &&
      !firstParagraph.startsWith('{')
    ) {
      return firstParagraph;
    }
    return 'I have prepared the requested details for you in the card below:';
  }

  return reply;
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
  mode: string,
  onProgress?: (event: AgentProgressEvent) => void
): Promise<AgentResult> {
  const chain = TASK_ROUTING_CHAINS['mentor'] || ['gemini', 'groq', 'openrouter', 'together', 'mistral', 'deepseek'];
  console.log(`[AgentLoop] Starting task loop for 'mentor' task | Chain: ${JSON.stringify(chain)}`);

  // Build specialized mode context instructions governed by Agent Constitution
  const systemPrompt = `${getConstitutionPrompt()}

You are Omni, the central AI-native career intelligence agent of ResumeForge.
You connect candidate identity (Resume) and market opportunities (Jobs), helping the candidate analyze match fit, optimize resumes, discover opportunities, practice coding, prepare for interviews, build learning plans, and advance their career.
You act as an agent interface connecting candidate capabilities and tools, NOT a conversational chatbot.

CRITICAL ARCHITECTURAL MANDATE — NEVER RENDER LARGE AGENT OUTPUT AS RAW TEXT:
Omni is an agent interface. Agent outputs are classified into:
1. SHORT_TEXT: Concise conversational responses only (1-2 sentences).
2. STRUCTURED_ARTIFACT: Rich UI cards for learning plans, resume audits, job matches, interview prep, coding drills, projects, salary analysis, applications.
3. ACTION_RESULT: Structured execution receipts.
4. NEEDS_USER: Explicit prompts for user input.
5. ERROR / HANDOFF: Structured error cards with actionable CTAs.

Large structured results must NEVER be rendered as raw markdown in "reply" when a tool creates an artifact.
- Plain short text is allowed ONLY for brief conversational responses (e.g. "Your resume is ready.", "I found 8 strong jobs for you.", "I need your work-authorization answer before I can continue.", "This role has already closed.").
- When ANY tool executes (study plan, resume audit, resume tailor, job search, job match, application package, coding challenge, mock interview, salary negotiation), your "reply" MUST BE 1 TO 2 CONCISE SENTENCES directing the user to the interactive card rendered below.
- NEVER duplicate or dump markdown tables, full bullet lists, code blocks, or full multi-week syllabi into "reply". The interactive UI automatically renders the structured card.
- If an action fails, is blocked by policy, or has missing permissions/credits, NEVER hallucinate a fake text plan. State the requirement concisely in 1 sentence.

CORE AUTONOMOUS RULES FOR RESUME ACTIONS:
1. When a user asks to review, score, audit, check, or optimize their resume, ALWAYS call the 'audit_resume_ats' tool immediately. Keep reply to 1 sentence.
2. When a user asks to tailor, customize, target, or adapt their resume for a specific job title or job description, ALWAYS call the 'tailor_resume_for_job' tool with targetRole and optional jobDescription. Keep reply to 1 sentence.
3. When a user asks to create, build, or generate a new resume from scratch or for a specific title, ALWAYS call 'trigger_resume_generation'. Keep reply to 1 sentence.

CORE AUTONOMOUS RULES FOR CODING ACTIONS:
1. When a user asks for a coding challenge, problem, algorithm practice, or DSA drill, ALWAYS call 'trigger_coding_challenge' with topic and difficulty (Easy, Medium, Hard).
2. When a user provides code to execute, test, check, or run against test cases, ALWAYS call 'run_code_sandbox' with language and code.
3. Keep your reply concise (1-2 sentences). The interactive UI will automatically render the live Code Sandbox or Coding Challenge card.

CORE AUTONOMOUS RULES FOR INTERVIEW ACTIONS:
1. When a user asks to prepare, practice, simulate, or start a mock interview, ALWAYS call 'trigger_mock_interview' with role and difficulty (Entry, Mid, Senior).
2. When a user responds with an answer to an interview question, ALWAYS call 'evaluate_interview_answer' with role, question, and userAnswer to grade against the STAR rubric.
3. Keep your reply concise (1-2 sentences). The interactive UI will automatically render the STAR Scorecard and Model Answer card.

CORE AUTONOMOUS RULES FOR JOB SEARCH & MARKET ACTIONS:
1. When a user asks to search, find, explore, or check jobs or job openings (e.g. "Find React jobs in Bangalore", "Show remote SDE roles", "Who is hiring for Python"), ALWAYS call 'search_job_market' with the query. Keep reply to 1 sentence.
2. When asked to evaluate candidate fit for a job, call 'get_job_match' or 'explain_job_match' with jobId.
3. When asked to rank best jobs for candidate, call 'rank_candidate_jobs'.
4. FRESHNESS & CLOSURE RULE: NEVER recommend applying or prepare an application for a role that is CLOSED. If a job has closed, immediately inform the user with empathy that the vacancy is no longer accepting applications, specify the closure reason if known, and present 3 similar ACTIVE replacement opportunities using 'find_job_replacements'.

CORE AUTONOMOUS RULES FOR APPLICATION PREPARATION ENGINE (LEVEL 12):
1. When a user asks to prepare an application, get application ready, or apply to a job, ALWAYS call 'prepare_job_application_package' with jobId.
2. Keep your reply to 1-2 sentences. The interactive UI will render the complete Application Package card with readiness score, documents, and missing question checklist.

CORE AUTONOMOUS RULES FOR STUDY & LEARNING ACTIONS:
1. When a user asks to learn a technology, create a roadmap, build a curriculum, or study a topic (e.g. "Create a study roadmap for System Design", "I want to learn Kubernetes in 4 weeks"), ALWAYS call 'trigger_study_plan' with topic and durationWeeks.
2. Keep your reply to 1-2 sentences (e.g. "I've structured a 4-week Kubernetes roadmap for you below. You can track your progress and practice milestones directly from the card."). DO NOT output the syllabus as text in reply!

CORE AUTONOMOUS RULES FOR PORTFOLIO PROJECT ACTIONS:
1. When a user asks for project ideas, full-stack blueprints, or portfolio architecture to build for their resume (e.g. "Give me a production-grade portfolio project with code", "Architect an AI Resume Scanner"), ALWAYS call 'generate_project_blueprint' with the idea.
2. Keep reply to 1-2 sentences. The interactive UI will render the project file viewer.

CORE AUTONOMOUS RULES FOR SALARY & NEGOTIATION ACTIONS:
1. When a user asks to negotiate a job offer, benchmark compensation, or write a counter-offer email, ALWAYS call 'negotiate_salary_offer' with role, currentOffer, and targetSalary.
2. Keep reply to 1-2 sentences. The interactive UI will render the negotiation script card.

CORE AUTONOMOUS RULES FOR CANDIDATE APPLICATION PROFILE:
1. You have direct access to the Candidate Application Profile via 'get_candidate_profile' and 'check_application_readiness'. Use existing verified facts instead of asking the user repetitive questions.
2. STRICT SENSITIVE QUESTION RULE: NEVER guess, infer, or assume sensitive application answers (work authorization, visa sponsorship, citizenship status, disability, race, veteran status) from user name, location, resume, or nationality. If unconfirmed, treat as unknown.
3. VERIFIED ANSWER INTEGRITY: Never silently overwrite verified profile answers. When a user explicitly confirms an answer in conversation, call 'update_candidate_application_answer' with userConfirmed: true.

STRICT RESPONSE RULE:
You MUST output your final response as a JSON object matching this schema:
{
  "reply": "Your brief 1-2 sentence conversational reply pointing to the artifact card below",
  "suggestedAction": "ResumeForge | CodingForge | InterviewForge | JobForge | StudyForge | null",
  "memoryExtraction": {
    "goals": ["extracted new learning goals"],
    "weaknesses": ["extracted technical weaknesses"],
    "improvements": ["suggested action items"]
  }
}
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
          // GoogleGenerativeAI rules:
          // 1. History must start with 'user'
          // 2. Roles must alternate
          // 3. History must end with 'model' so next turn via sendMessage(message) is valid 'user'
          const geminiHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
          for (const h of (history || [])) {
            const role: 'user' | 'model' = h.role === 'assistant' ? 'model' : 'user';
            const text = (h.content || '').trim();
            if (!text) continue;

            if (geminiHistory.length === 0) {
              if (role === 'user') {
                geminiHistory.push({ role, parts: [{ text }] });
              }
              // Skip leading model/assistant messages
            } else {
              const last = geminiHistory[geminiHistory.length - 1];
              if (last.role === role) {
                last.parts[0].text += `\n\n${text}`;
              } else {
                geminiHistory.push({ role, parts: [{ text }] });
              }
            }
          }

          if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === 'user') {
            geminiHistory.pop();
          }

          const chat = model.startChat({
            history: geminiHistory
          });

          const artifacts: any[] = [];

          // 1. Initial turn
          let result = await chat.sendMessage(message);
          let functionCalls = result.response.functionCalls();
          let iterations = 0;

          // 2. Tool Execution Reasoning Loop (cap at 5 turns)
          while (functionCalls && functionCalls.length > 0 && iterations < 5) {
            iterations++;
            console.log(`[AgentLoop] Iteration ${iterations}: Gemini requested ${functionCalls.length} tool call(s)`);

            const responsesParts = await Promise.all(functionCalls.map(async (call: any) => {
              // Emit tool_start event
              onProgress?.({
                type: 'tool_start',
                name: call.name,
                args: call.args || {},
                status: 'running',
                iteration: iterations
              });

              const tool = toolsRegistry[call.name];
              let toolResult;
              const toolStartTime = Date.now();

              // Server-Side Authorization Gate (Level 12.5)
              const authResult = ToolAuthorizer.authorize(call.name, 'omni', userId, call.args);
              if (!authResult.authorized) {
                console.warn(`[AgentLoop] Tool authorization blocked [${call.name}]: ${authResult.errorMessage}`);
                toolResult = {
                  error: `POLICY_BLOCKED: ${authResult.errorMessage}`,
                  reasonCode: authResult.reasonCode,
                };
                artifacts.push({
                  tool: 'error_card',
                  errorType: 'POLICY_BLOCKED',
                  title: 'Action Protected by Policy',
                  message: authResult.errorMessage || 'This action is protected by agent policy.',
                  actionLabel: 'Review Profile',
                  actionUrl: '/account?tab=application-profile',
                });
                AgentTracer.recordEvent({
                  agent: 'omni',
                  tool: call.name,
                  inputReferences: (call.args as any) || {},
                  decision: 'POLICY_BLOCKED',
                  policyOutcome: authResult.reasonCode || 'BLOCKED',
                  latencyMs: 0,
                });
                onProgress?.({
                  type: 'tool_end',
                  name: call.name,
                  result: toolResult,
                  status: 'error',
                  iteration: iterations,
                });
              } else if (!tool) {
                toolResult = { error: `Tool '${call.name}' not registered.` };
                artifacts.push({
                  tool: 'error_card',
                  errorType: 'TOOL_FAILED',
                  title: 'Capability Unavailable',
                  message: `Tool '${call.name}' is not currently available.`,
                });
                onProgress?.({
                  type: 'tool_end',
                  name: call.name,
                  result: toolResult,
                  status: 'error',
                  iteration: iterations
                });
              } else {
                try {
                  toolResult = await tool.execute(call.args, userId);
                  AgentTracer.recordEvent({
                    agent: 'omni',
                    tool: call.name,
                    inputReferences: (call.args as any) || {},
                    decision: 'SUCCESS',
                    policyOutcome: 'AUTHORIZED',
                    latencyMs: Date.now() - toolStartTime,
                  });
                  if (toolResult && (toolResult.tool || toolResult.resumeId || toolResult.packageId || toolResult.matches || toolResult.score !== undefined)) {
                    artifacts.push(toolResult);
                  } else if (toolResult && toolResult.error) {
                    const isCredit = String(toolResult.error).toLowerCase().includes('credit') || String(toolResult.error).toLowerCase().includes('quota') || String(toolResult.error).toLowerCase().includes('limit');
                    artifacts.push({
                      tool: 'error_card',
                      errorType: isCredit ? 'CREDIT_EXHAUSTED' : 'TOOL_FAILED',
                      title: isCredit ? 'AI Credit Limit Reached' : 'Generation Unavailable',
                      message: isCredit ? 'You have reached your allocated AI generation quota for this action. Please top up your credits to continue.' : toolResult.error,
                      actionLabel: isCredit ? 'Top Up Credits' : 'Try Again',
                      actionUrl: isCredit ? '/pricing' : undefined,
                    });
                  }
                  onProgress?.({
                    type: 'tool_end',
                    name: call.name,
                    result: toolResult,
                    status: 'finished',
                    iteration: iterations
                  });
                } catch (err: any) {
                  console.error(`[AgentLoop] Tool execution failed [${call.name}]:`, err.message);
                  toolResult = { error: `Failed to execute: ${err.message}` };
                  const isCredit = String(err.message).toLowerCase().includes('credit') || String(err.message).toLowerCase().includes('quota') || String(err.message).toLowerCase().includes('limit');
                  artifacts.push({
                    tool: 'error_card',
                    errorType: isCredit ? 'CREDIT_EXHAUSTED' : 'TOOL_FAILED',
                    title: isCredit ? 'AI Credit Limit Reached' : 'Generation Unavailable',
                    message: isCredit ? 'You have reached your allocated AI generation quota for this action. Please top up your credits to continue.' : err.message,
                    actionLabel: isCredit ? 'Top Up Credits' : 'Try Again',
                    actionUrl: isCredit ? '/pricing' : undefined,
                  });
                  onProgress?.({
                    type: 'tool_end',
                    name: call.name,
                    result: toolResult,
                    status: 'error',
                    iteration: iterations
                  });
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
          let parsed: any;
          try {
            parsed = JSON.parse(extractJson(finalResponseText));
          } catch {
            parsed = { reply: finalResponseText };
          }
          const cleanReply = sanitizeAgentReply(parsed.reply || finalResponseText, artifacts);
          return {
            reply: cleanReply,
            suggestedAction: parsed.suggestedAction || undefined,
            memoryExtraction: parsed.memoryExtraction || undefined,
            artifacts: artifacts.length > 0 ? artifacts : undefined,
            blocks: Array.isArray(parsed.blocks) ? parsed.blocks : undefined,
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

          const sanitizedHistory = (history || [])
            .map(h => ({
              role: h.role === 'assistant' ? 'assistant' as const : 'user' as const,
              content: (h.content || '').trim() || (h.role === 'assistant' ? 'I processed your request.' : '...')
            }));

          const messages: any[] = [
            { role: 'system', content: systemPrompt },
            ...sanitizedHistory,
            { role: 'user', content: message }
          ];

          let iterations = 0;
          let toolCallsRequested = true;
          let finalReply = '';
          const artifacts: any[] = [];

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
                max_tokens: 1500,
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
                const parsedArgs = typeof call.function.arguments === 'string'
                  ? (() => { try { return JSON.parse(call.function.arguments); } catch { return {}; } })()
                  : call.function.arguments || {};

                // Emit tool_start event
                onProgress?.({
                  type: 'tool_start',
                  name: call.function.name,
                  args: parsedArgs,
                  status: 'running',
                  iteration: iterations
                });

                const tool = toolsRegistry[call.function.name];
                let toolResult;
                const toolStartTime = Date.now();

                // Server-Side Authorization Gate (Level 12.5)
                const authResult = ToolAuthorizer.authorize(call.function.name, 'omni', userId, parsedArgs);
                if (!authResult.authorized) {
                  console.warn(`[AgentLoop] Tool authorization blocked [${call.function.name}]: ${authResult.errorMessage}`);
                  toolResult = {
                    error: `POLICY_BLOCKED: ${authResult.errorMessage}`,
                    reasonCode: authResult.reasonCode,
                  };
                  artifacts.push({
                    tool: 'error_card',
                    errorType: 'POLICY_BLOCKED',
                    title: 'Action Protected by Policy',
                    message: authResult.errorMessage || 'This action is protected by agent policy.',
                    actionLabel: 'Review Profile',
                    actionUrl: '/account?tab=application-profile',
                  });
                  AgentTracer.recordEvent({
                    agent: 'omni',
                    tool: call.function.name,
                    inputReferences: parsedArgs || {},
                    decision: 'POLICY_BLOCKED',
                    policyOutcome: authResult.reasonCode || 'BLOCKED',
                    latencyMs: 0,
                  });
                  onProgress?.({
                    type: 'tool_end',
                    name: call.function.name,
                    result: toolResult,
                    status: 'error',
                    iteration: iterations,
                  });
                } else if (!tool) {
                  toolResult = { error: `Tool '${call.function.name}' not registered.` };
                  artifacts.push({
                    tool: 'error_card',
                    errorType: 'TOOL_FAILED',
                    title: 'Capability Unavailable',
                    message: `Tool '${call.function.name}' is not currently available.`,
                  });
                  onProgress?.({
                    type: 'tool_end',
                    name: call.function.name,
                    result: toolResult,
                    status: 'error',
                    iteration: iterations
                  });
                } else {
                  try {
                    toolResult = await tool.execute(parsedArgs, userId);
                    AgentTracer.recordEvent({
                      agent: 'omni',
                      tool: call.function.name,
                      inputReferences: parsedArgs || {},
                      decision: 'SUCCESS',
                      policyOutcome: 'AUTHORIZED',
                      latencyMs: Date.now() - toolStartTime,
                    });
                    if (toolResult && (toolResult.tool || toolResult.resumeId || toolResult.packageId || toolResult.matches || toolResult.score !== undefined)) {
                      artifacts.push(toolResult);
                    } else if (toolResult && toolResult.error) {
                      const isCredit = String(toolResult.error).toLowerCase().includes('credit') || String(toolResult.error).toLowerCase().includes('quota') || String(toolResult.error).toLowerCase().includes('limit');
                      artifacts.push({
                        tool: 'error_card',
                        errorType: isCredit ? 'CREDIT_EXHAUSTED' : 'TOOL_FAILED',
                        title: isCredit ? 'AI Credit Limit Reached' : 'Generation Unavailable',
                        message: isCredit ? 'You have reached your allocated AI generation quota for this action. Please top up your credits to continue.' : toolResult.error,
                        actionLabel: isCredit ? 'Top Up Credits' : 'Try Again',
                        actionUrl: isCredit ? '/pricing' : undefined,
                      });
                    }
                    onProgress?.({
                      type: 'tool_end',
                      name: call.function.name,
                      result: toolResult,
                      status: 'finished',
                      iteration: iterations
                    });
                  } catch (err: any) {
                    console.error(`[AgentLoop] Tool execution failed [${call.function.name}]:`, err.message);
                    toolResult = { error: `Failed to execute: ${err.message}` };
                    const isCredit = String(err.message).toLowerCase().includes('credit') || String(err.message).toLowerCase().includes('quota') || String(err.message).toLowerCase().includes('limit');
                    artifacts.push({
                      tool: 'error_card',
                      errorType: isCredit ? 'CREDIT_EXHAUSTED' : 'TOOL_FAILED',
                      title: isCredit ? 'AI Credit Limit Reached' : 'Generation Unavailable',
                      message: isCredit ? 'You have reached your allocated AI generation quota for this action. Please top up your credits to continue.' : err.message,
                      actionLabel: isCredit ? 'Top Up Credits' : 'Try Again',
                      actionUrl: isCredit ? '/pricing' : undefined,
                    });
                    onProgress?.({
                      type: 'tool_end',
                      name: call.function.name,
                      result: toolResult,
                      status: 'error',
                      iteration: iterations
                    });
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
          let parsed: any;
          try {
            parsed = JSON.parse(extractJson(finalReply));
          } catch {
            parsed = { reply: finalReply };
          }
          const cleanReply = sanitizeAgentReply(parsed.reply || finalReply, artifacts);
          return {
            reply: cleanReply,
            suggestedAction: parsed.suggestedAction || undefined,
            memoryExtraction: parsed.memoryExtraction || undefined,
            artifacts: artifacts.length > 0 ? artifacts : undefined,
            blocks: Array.isArray(parsed.blocks) ? parsed.blocks : undefined,
          };
        }
      } catch (error: any) {
        lastError = error;
        console.error(`[AgentLoop] Provider ${provider} with key ${key.id} failed:`, error.message);
        const isQuotaError = 
          error.message?.includes('429') || 
          error.message?.toLowerCase().includes('quota') || 
          error.message?.includes('Rate limit') ||
          error.message?.includes('402') ||
          error.message?.toLowerCase().includes('credit') ||
          error.message?.includes('403') ||
          error.message?.toLowerCase().includes('permission_denied') ||
          error.message?.toLowerCase().includes('leaked');
        keyPool.markFailure(key.id, isQuotaError);
      }
    }
  }

  throw lastError || new Error(`AI generation failed for 'mentor' task. All providers in chain exhausted.`);
}

