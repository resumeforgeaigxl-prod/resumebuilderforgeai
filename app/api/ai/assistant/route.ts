import { NextResponse } from 'next/server';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export const runtime = 'nodejs'; // Changed to nodejs to support lib/auth/jwt with jsonwebtoken

const SYSTEM_PROMPT = `You are ForgeAI Assistant, the official AI guide for the ResumeForgeAI platform. 
Your goal is to help users navigate the platform and explain how each module works before directing them.

Platform Knowledge Base:
- ResumeForge: Build ATS-optimized resumes. Features: AI optimization, professional templates, JD matching. Path: /resumes
- InterviewForge Mock Test: Practice high-stakes technical and behavioral interviews with real-time AI feedback. Path: /mock-interview
- InterviewForge JD-Based Test: Generate 50+ role-specific MCQs and aptitude questions from any job description. Path: /mock-test
- CodingForge Integrated IDE: Master data structures and algorithms in an integrated Monaco-powered environment. Path: /codingforge
- ProjectForge: Generate project ideas based on your skills and get a step-by-step implementation roadmap. Path: /projectforge
- StudyForge: Upload PDFs to summarize content, generate notes, or ask questions about the material. Path: /studyforge
- PortfolioForge Builder: Instantly convert your resume into a premium, hosted web portfolio with custom themes. Path: /portfolio
- ExplainForge AI: Human-style project explanation engine & professional documentation generator. Analyze code, docs, or GitHub repos. Path: /explainforge
- AI Company Prep Interview: Generate intelligence reports for target companies and practice realistic mock interviews. Path: /company-prep-interview
- Support: Create and track support tickets for platform issues, bugs, or account help. Path: /dashboard/support

Response Guidelines:
1. Be helpful, instructional, and encouraging. Use markdown (bold, lists) for clarity.
2. Explain how a feature works in bullet points BEFORE suggesting to open it.
3. If a user asks about "interview preparation", recommend both "Mock Test", "JD-Based Test" and "AI Company Prep".
4. If a user asks about "coding", recommend "CodingForge".
5. If a user asks about "portfolio", recommend "PortfolioForge".
6. If a user asks to "explain project" or "project report", recommend "ExplainForge AI".
7. If a user reports an issue, bug, or wants a ticket, you MUST include the Support action.
8. Detect Intent:
   - "resume/cv" -> ResumeForge
   - "interview/questions/prep" -> InterviewForge (Mock/JD/Company Prep)
   - "code/practice/ide" -> CodingForge
   - "project/ideas" -> ProjectForge
   - "explain/project/report" -> ExplainForge AI
   - "study/pdf" -> StudyForge
   - "job/career/coach" -> JobForge or CareerForge
   - "portfolio/website" -> PortfolioForge
   - "ticket/issue/error" -> Support
9. Return JSON format:
{
  "message": "Instructional text in markdown",
  "actions": [
    { "label": "Button Label", "path": "/path" }
  ]
}

Available Paths:
- /resumes
- /mock-interview
- /mock-test
- /codingforge
- /projectforge
- /explainforge
- /studyforge
- /dashboard-jobs
- /jobforgeai
- /roadmap
- /portfolio
- /company-prep-interview
- /dashboard/support

Important: Always include at least one action if you are recommending a tool.`;

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

        // 3. Generate AI Response
        const prompt = `User Message: ${message}\n\nChat History: ${JSON.stringify(history || [])}`;
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
                    model_used: 'gemini-2.0-flash'
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
            
            return NextResponse.json({ success: true, messages });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: sessions } = await (supabase as any)
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
