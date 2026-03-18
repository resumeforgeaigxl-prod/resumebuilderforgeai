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
9. CRITICAL: Return the response as a JSON object with the key "optimizedBullet".
10. BULLET CONTENT: Output ONLY the plain improved sentence within the JSON. Do NOT start with -, --, *, •, or any bullet symbol inside the string. The frontend handles bullet rendering.`;

        const jdContext = jobDescription ? `\nTarget Job Description:\n${jobDescription}` : '';
        const faangRules = faangMode
            ? `\nFAANG MODE ACTIVATED:\n- Enforce the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".\n- Maximize leadership signals (e.g. Spearheaded, Architected).\n- Emphasize scale and system design complexity. (STILL: DO NOT FABRICATE NUMBERS)`
            : '';

        const prompt = `${faangRules}${jdContext}\n\nOriginal Bullet: "${bulletText}"\n\nReturn the improved version in a JSON object.`;

        const aiResult = await generateAIResponse(prompt, undefined, systemPrompt, 0.2, 300);
        const aiOutput = aiResult.text;
        const endTime = Date.now();

        // Parse JSON response safely
        let optimizedBullet = "";
        try {
            const cleaned = aiOutput.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
            const parsed = JSON.parse(cleaned);
            optimizedBullet = parsed.optimizedBullet || parsed.bullet || aiOutput;
        } catch (e) {
            console.warn("[AI Enhance Bullet] JSON Parse failed, falling back to raw output", e);
            optimizedBullet = aiOutput;
        }

        // Strip ALL leading bullet symbols in any combination (-, --, •-, • -, *, etc.)
        optimizedBullet = optimizedBullet.replace(/^([-•*–—]+\s*)+/, '').replace(/^"|"$/g, '').trim();

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
