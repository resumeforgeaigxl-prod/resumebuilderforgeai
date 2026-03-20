import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export const runtime = 'nodejs'; // Changed to nodejs to support lib/auth/jwt with jsonwebtoken

const SYSTEM_PROMPT = `You are the ResumeForgeAI Career Copilot, an intelligent and helpful assistant designed to guide users through their career journey.

CORE OBJECTIVE:
Identify the user's intent and provide context-aware, human-like responses. Instead of just listing tools, act as a mentor. Always guide users to the most relevant module (Forge).

INTENT CATEGORIES & MAPPING:
- "mentor", "learn", "understand", "study", "concepts" -> MentorForge (/mentorforge)
- "interview", "questions", "mock", "prep", "behavioral" -> InterviewForge (/mock-interview)
- "resume", "cv", "optimize", "ATS", "build resume" -> ResumeForge (/resumes)
- "code", "error", "debug", "DSA", "coding", "syntax" -> CodingForgeAI (/codingforge)
- "job", "apply", "search", "vacancies", "openings" -> JobForge (/jobs)

SPECIFIC MODULE BEHAVIOR (MENTORFORGE):
If the user mentions "learning", "mastering a topic", or wants an explanation:
1. Briefly explain that MentorForge helps them learn topics step-by-step with personalized AI guidance.
2. ALWAYS ask the follow-up question: "What would you like to learn today?"

STRICT GUIDELINES:
1. NO MISROUTING: Do not guess. If a user asks for "Mentor Forge", do NOT suggest "Interview Forge".
2. CONTEXTUAL REPLY: Generate a helpful, conversational response based on the user's query first.
3. FOLLOW-UP: Every response should encourage the user's next career step.
4. CLARIFICATION FALLBACK: If the user's intent is unclear or too broad, politely ask a brief clarification question instead of guessing or providing an unrelated tool.
5. NO MARKETING FLUFF: Be direct, technical, and useful.

RESPONSE FORMAT (JSON):
{
  "message": "A conversational, human-like reply. If intent is MentorForge, include the explanation and mandatory follow-up question.",
  "actions": [
    { "label": "Clear CTA (e.g. 'Explore MentorForge')", "path": "/path-without-locale" }
  ]
}`;

export async function POST(req: Request) {
    try {
        const session = await getSession();
        const userId = session?.userId;
        const body = await req.json();
        const { message, history, sessionId: providedSessionId } = body;

        const supabase = createClient();
        let chatId = providedSessionId;

        // 1. Manage Chat Session
        if (userId) {
            if (!chatId) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: newSession, error: sessionErr } = await (supabase as any)
                    .from('chat_sessions')
                    .insert({ user_id: userId })
                    .select()
                    .single();
                if (!sessionErr) chatId = newSession.id;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any)
                    .from('chat_sessions')
                    .update({ last_active: new Date().toISOString() })
                    .eq('id', chatId);
            }

            // 2. Store User Message
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('chat_messages')
                .insert({
                    session_id: chatId,
                    user_id: userId,
                    role: 'user',
                    message: message
                });
        }

        // 3. Fetch Light Context
        const userContext: Record<string, number> = { resumes: 0, roadmaps: 0, submissions: 0 };
        if (userId) {
            const [rCount, rmCount, sCount] = await Promise.all([
                supabase.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('career_roadmaps').select('id', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('coding_submissions').select('id', { count: 'exact', head: true }).eq('user_id', userId)
            ]);
            userContext.resumes = rCount.count || 0;
            userContext.roadmaps = rmCount.count || 0;
            userContext.submissions = sCount.count || 0;
        }

        // 4. Generate AI Response
        const prompt = `
        User Context: ${JSON.stringify(userContext)}
        User Message: ${message}
        Chat History: ${JSON.stringify(history?.slice(-5) || [])}`;
        
        const responseData = await generateAIResponse(prompt, {
            userId: userId!,
            contextType: 'jobs',
            jsonMode: true,
            systemPrompt: SYSTEM_PROMPT
        });
        
        if (!responseData) throw new Error("AI Assistant failed");

        // 4. Store Assistant Message & Usage
        if (userId && chatId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('chat_messages')
                .insert({
                    session_id: chatId,
                    user_id: userId,
                    role: 'assistant',
                    message: responseData.message,
                    model_used: 'gemini-2.0-flash',
                    metadata: { actions: responseData.actions }
                });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('ai_usage_logs')
                .insert({
                    user_id: userId,
                    feature: 'assistant',
                    model: 'gemini-2.0-flash',
                    tokens: responseData.message.length / 4, // estimate
                });
        }

        return NextResponse.json({
            success: true,
            data: responseData,
            sessionId: chatId
        });
    } catch (error) {
        console.error('[Assistant API] Error:', error);
        return NextResponse.json({
            success: false,
            message: "I'm having trouble connecting right now. Please try again later.",
            data: {
                message: "I'm having trouble connecting right now. Please try again later.",
                actions: []
            }
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ success: false }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        const supabase = createClient();

        if (sessionId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: messages } = await (supabase as any)
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });
            
            return NextResponse.json({ 
                success: true, 
                messages: (messages || []).map((m: { role: string; message: string; metadata?: { actions?: { label: string; path: string }[] }; created_at: string }) => ({
                    role: m.role,
                    message: m.message,
                    actions: m.metadata?.actions,
                    created_at: m.created_at
                }))
            });
        } else {
            const { data: sessions } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('user_id', session.userId)
                .order('last_active', { ascending: false });
            
            return NextResponse.json({ success: true, sessions });
        }
    } catch (error) {
        console.error('[Assistant API] GET Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
