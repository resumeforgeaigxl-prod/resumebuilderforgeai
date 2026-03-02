import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { generateAIResponse, logAIUsage } from '@/lib/ai-provider';
import { checkDailyLimit, logUsage } from '@/lib/usage';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { bulletText, faangMode = false, jobDescription } = body;

        if (!bulletText || typeof bulletText !== 'string' || bulletText.trim().length === 0) {
            return NextResponse.json({ error: 'Bullet text is required' }, { status: 400 });
        }

        // Limit Check
        const limitStatus = await checkDailyLimit(session.userId, 'ai_enhance');
        if (!limitStatus.allowed) {
            return NextResponse.json(
                {
                    error: `Daily limit reached (${limitStatus.used}/${limitStatus.limit}). Upgrade to Pro for unlimited AI enhancements.`,
                    requiresUpgrade: true
                },
                { status: 429 }
            );
        }

        // Generate AI enhancement
        const startTime = Date.now();

        const systemPrompt = `You are a technical resume optimizer. 
Your goal is to improve resume bullet points for clarity, technical depth, and JD alignment.

RULES:
1. Preserve original meaning.
2. Improve clarity and technical specificity.
3. Add relevant technical keywords and tools.
4. Expand slightly if the bullet is too short (e.g. < 5 words).
5. DO NOT add fake percentages (e.g., "Increased performance by 30%").
6. DO NOT fabricate performance metrics or achievements.
7. Keep it detailed but realistic for the candidate's level.
8. If a Job Description is provided, inject relevant keywords naturally.
9. ONLY return the improved bullet point text. No quotes, no preamble.`;

        const jdContext = jobDescription ? `\nTarget Job Description:\n${jobDescription}` : '';
        const faangRules = faangMode
            ? `\nFAANG MODE ACTIVATED:\n- Enforce the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".\n- Maximize leadership signals (e.g. Spearheaded, Architected).\n- Emphasize scale and system design complexity. (STILL: DO NOT FABRICATE NUMBERS)`
            : '';

        const prompt = `${faangRules}${jdContext}\n\nOriginal Bullet: "${bulletText}"\n\nImproved Bullet:`;

        const aiResult = await generateAIResponse(prompt, undefined, systemPrompt, 0.2, 300);
        let optimizedBullet = aiResult.text;
        const endTime = Date.now();

        optimizedBullet = optimizedBullet.replace(/^[-*•]\s*/, '').replace(/^"|"$/g, '').trim();

        // Log successful usage
        const supabase = createClient();
        await Promise.all([
            logUsage(session.userId, 'ai_enhance'),
            logAIUsage(supabase, session.userId, null, aiResult, endTime - startTime)
        ]);

        return NextResponse.json({
            success: true,
            optimizedBullet,
            remainingLimit: limitStatus.limit - (limitStatus.used + 1)
        });

    } catch (e) {
        console.error('[AI Enhance Bullet]', e);
        return NextResponse.json({ error: 'Internal failure optimizing bullet' }, { status: 500 });
    }
}
