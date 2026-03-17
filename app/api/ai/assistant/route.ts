import { NextResponse } from 'next/server';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export const runtime = 'nodejs'; // Changed to nodejs to support lib/auth/jwt with jsonwebtoken

const SYSTEM_PROMPT = `You are the ResumeForgeAI Assistant, a direct and helpful platform guide.
Your goal is to provide minimal, intent-based assistance.

STRICT BEHAVIOR RULES:
1. DIRECT ANSWER: Answer the user's question directly and concisely first.
2. MINIMAL SUGGESTION: Suggest ONLY ONE relevant tool (Forge) that helps with their specific intent.
3. NO LISTING: Never list all platform modules. Max 2 relevant buttons/actions allowed.
4. NO MARKETING: Avoid phrases like "Our platform offers" or "We have multiple features". Be helpful, not promotional.
5. CLARIFICATION: If the user's intent is unclear, ask a brief clarification question (e.g., "Would you like help with coding or jobs?") instead of guessing or listing tools.

INTENT MAPPING:
- Jobs/Search -> JobForge (/dashboard-jobs)
- Resume/CV/Optimize -> ResumeForge (/resumes)
- Coding/DSA/Practice -> CodingForge (/codingforge)
- Interview Mock/Prep -> InterviewForge (/mock-interview)
- MCQ/Test/Aptitude -> Mock Test (/mock-test)
- Learning/Concepts -> KnowledgeForge (/knowledgeforge)
- Projects/Roadmap -> ProjectForge (/projectforge)
- Company Research -> Company Prep (/company-prep-interview)
- Portfolio/Website -> PortfolioForge (/portfolio)

RESPONSE FORMAT (JSON):
{
  "message": "Direct answer. Concise suggestion.",
  "actions": [
    { "label": "Specific Action Label", "path": "/correct-path" }
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
        
        const responseData = await generateJsonGemini(prompt, SYSTEM_PROMPT);

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
