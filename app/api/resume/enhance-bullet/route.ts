import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { generateAIResponse } from '@/lib/ai-provider';
import { checkDailyLimit, logUsage } from '@/lib/usage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { bulletText, faangMode = false } = body;

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
        const faangRules = faangMode
            ? `\nFAANG MODE ACTIVATED:\n- Enforce the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".\n- Maximize leadership signals (e.g. Spearheaded, Architected).\n- Emphasize scale, system design complexity, and cross-functional impact.`
            : '';

        const prompt = `You are a top-tier tech recruiter and resume writer.
Rewrite the following resume bullet point to make it highly impactful.
Start with a strong action verb, quantify the result with realistic metrics if missing, and clarify the core technical contribution.

${faangRules}

Original Bullet: "${bulletText}"

Provide ONLY the single improved bullet point text. Do not add quotes, introductory text, or markdown.`;

        let optimizedBullet = await generateAIResponse(prompt);
        optimizedBullet = optimizedBullet.replace(/^[-*•]\s*/, '').replace(/^"|"$/g, '').trim();

        // Log successful usage
        await logUsage(session.userId, 'ai_enhance');

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
