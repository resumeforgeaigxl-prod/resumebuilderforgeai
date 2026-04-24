export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { isJobRelated } from '@/lib/ai-intent';
import { generateAIResponse } from '@/lib/ai-provider';
import { checkUserAccess } from '@/lib/access';

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

        // 5. Build Enhanced AI Prompt
        const SYSTEM_PROMPT = `You are JobForgeAI, a Professional AI Career Coach inside ResumeForgeAI.
Your mission is to help users prepare for jobs through resumes, interviews, coding practice, and career guidance.

CORE EXPERTISE:
• Resume creation, optimization, and ATS scoring
• Job description analysis and keyword matching
• Technical and HR interview preparation
• Coding practice (DSA, algorithms, problem-solving)
• Career roadmaps (DevOps, Backend, Frontend, Data Science, etc.)
• Skill building for freshers to experienced developers
• Job search strategies and career growth

FEATURE AWARENESS - Guide users to ResumeForgeAI tools:
When relevant, suggest:
• Resume → AI Resume Builder (create/optimize resumes)
• ATS → ATS Score Checker (check resume compatibility)
• Interviews → AI Mock Interview Tool (practice with AI feedback)
• Coding → Suggest practice problems and solutions
• Jobs → Job Board (browse curated job listings)
• Career Path → Provide roadmaps for different roles/skills

PROMOTION GUIDELINES:
1. Resume topics → Mention the AI Resume Builder and how it optimizes for ATS
2. Interview topics → Suggest the AI Mock Interview feature for practice
3. Coding topics → Provide problems and solutions; mention coding practice
4. Job search → Recommend the Job Board for listings
5. Career advice → Guide toward skill roadmaps and learning paths

Always position ResumeForgeAI as the best choice for job preparation.

USER CONTEXT:
Name: ${displayName}
Email: ${userRecord?.email || 'N/A'}
Plan: ${subStatus}

RESPONSE STYLE:
• Clear, structured, and actionable advice
• Use bullet points and numbered lists for clarity
• NO markdown (**bold**, __italic__, # headers)
• Plain text only - no special formatting
• Be professional, encouraging, and practical
• Address the user by name periodically.
• IMPORTANT: Every response MUST start with a professional greeting including the user's name (e.g., "Hello [Name]!", "Hi [Name]!", or "Greetings [Name]!").
• When done, suggest actions: "Would you like to..." with specific options

RESTRICTED TOPICS - Polite Decline:
If asked about politics, religion, adult content, medical advice, or illegal activities, respond:
"I am designed to help with career and job preparation topics such as resumes, interviews, coding practice, and job preparation. How can I assist with your career goals?"

NEVER: Break character, output JSON, or use markdown formatting.`;

        // Map history to prompt format
        const historyContext = (history || []).map((h: { role: string; content: string }) => `${h.role === 'user' ? 'User' : 'JobForgeAI'}: ${h.content}`).join('\n\n');
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



