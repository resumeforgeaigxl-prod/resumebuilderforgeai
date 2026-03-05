import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { isJobRelated } from '@/lib/ai-intent';
import { generateAIResponse } from '@/lib/ai-provider';
import { checkUserAccess } from '@/lib/access';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const userId = session.userId;
        const body = await request.json();
        const { message, conversationId } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        if (!conversationId) {
            return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
        }

        // 1. Check if user is blocked (>= 3 violations)
        const { count: violationCount } = await supabase
            .from('ai_violations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if ((violationCount ?? 0) >= 3) {
            return NextResponse.json({
                blocked: true,
                message: "AI access temporarily restricted due to repeated violations."
            }, { status: 403 });
        }

        // 2. Intent Filtering
        const startTime = Date.now();
        const intent = await isJobRelated(message);
        if (!intent.isJobRelated) {
            // Log violation
            await Promise.all([
                supabase.from('ai_violations').insert({
                    user_id: userId,
                    conversation_id: conversationId,
                    message: message,
                    violation_type: intent.violationType || 'unrelated'
                }),
                // Legacy
                supabase.from('ai_chats').insert({
                    user_id: userId,
                    role: 'system',
                    message: `Violation: ${intent.violationType || 'unrelated'} | MSG: ${message}`
                })
            ]);

            // Check if this was the 3rd strike
            const newCount = (violationCount ?? 0) + 1;
            if (newCount >= 3) {
                return NextResponse.json({
                    blocked: true,
                    message: "AI access temporarily restricted due to repeated violations."
                }, { status: 403 });
            }

            return NextResponse.json({
                text: "I am JobForgeAI. I assist only with career and job preparation topics.",
                refusal: true
            });
        }

        // 3. User Name & Settings & Subscription
        const [userResponse, accessResult] = await Promise.all([
            supabase.from('users').select('display_name, email').eq('id', userId).single(),
            checkUserAccess(userId)
        ]);

        const userRecord = userResponse.data;
        const displayName = userRecord?.display_name || userRecord?.email?.split('@')[0] || 'User';
        const subStatus = accessResult.hasAccess ? `Pro (${accessResult.reason})` : 'Free';

        // 4. Load Conversation Memory (Last 15 messages)
        const { data: history } = await supabase
            .from('ai_messages')
            .select('role, content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(15);

        // 5. Build Strict AI Prompt
        const SYSTEM_PROMPT = `You are JobForgeAI, a Senior Career Coach and Job Market Strategist. 
Your goal is to provide elite-level career guidance and proactively help users land their dream jobs using ResumeForgeAI's ecosystem.

Expertise areas:
- Resume optimization (ATS-first approach)
- Regional job board strategy (MNCs, Startups, Freshers)
- Interactive Mock Interview preparation
- Portfolio branding and JD keyword matching

Promotion Rules (Proactively suggest these features ONLY when relevant):
1. If the user is looking for jobs: 
   "Check out our specialized Job Board at /jobs. We have curated listings for MNCs and Freshers with real-time ATS match scores."
2. If the user mentions interview anxiety or preparation: 
   "Try our AI Mock Interview feature. It generates 50 role-specific questions from your target JD and gives you a detailed feedback report."
3. If the user asks about resume quality: 
   "Our ATS Analyzer can score your resume against any job description. You'll find it in your dashboard."

User Profile:
Name: ${displayName}
Email: ${userRecord?.email || 'N/A'}
Subscription: ${subStatus}

Tone & Guidelines:
- Address the user as ${displayName} frequently.
- Be encouraging, data-driven, and highly professional.
- NO markdown symbols. Do not use **bold**, __italic__, or # headers.
- Use plain text paragraphs and clean numbered lists.
- Refuse any request unrelated to careers by saying: "JobForgeAI is strictly focused on elite career preparation and job market success."

You must never break character or provide JSON output.`;

        // Map history to prompt format
        const historyContext = (history || []).map((h: { role: string; content: string }) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n\n');
        const fullPrompt = `${historyContext ? `Previous Conversation:\n${historyContext}\n\n` : ''}User: ${message}`;

        // 6. Generate Response
        const aiResult = await generateAIResponse(
            fullPrompt,
            'openai/gpt-4o-mini',
            SYSTEM_PROMPT
        );

        let assistantText = aiResult.text;
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // 7. Post-processing Sanitization (Clean Text Only)
        assistantText = assistantText
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/__(.*?)__/g, '$1')
            .replace(/#{1,6}\s?/g, '')
            .replace(/`/g, '')
            .replace(/\*/g, '')
            .trim();

        // 8. Persistent Memory Storage & Logging
        await Promise.all([
            // Save messages to memory
            supabase.from('ai_messages').insert([
                { conversation_id: conversationId, user_id: userId, role: 'user', content: message },
                { conversation_id: conversationId, user_id: userId, role: 'assistant', content: assistantText }
            ]),
            // Audit Log (New production usage logs)
            supabase.from('ai_usage_logs').insert({
                user_id: userId,
                conversation_id: conversationId,
                model_used: aiResult.model,
                tokens_used: aiResult.usage.total_tokens,
                response_time_ms: responseTime
            }),
            // Update conversation timestamp
            supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId),
            // Legacy logging (Don't break admin monitoring)
            supabase.from('ai_chats').insert([
                { user_id: userId, role: 'user', message: message },
                { user_id: userId, role: 'assistant', message: assistantText }
            ])
        ]);

        return NextResponse.json({ text: assistantText });

    } catch (error: unknown) {
        console.error('[AI Chat Route Error]', error);
        const message = error instanceof Error ? error.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
