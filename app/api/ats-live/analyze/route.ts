import { NextResponse } from 'next/server';
import { generateContentStreamGemini } from '@/lib/gemini-service';
import { getSession } from '@/lib/auth/jwt';
import { rateLimit } from '@/lib/rate-limit';

const ATS_LIVE_PROMPT = `
You are a Silicon Valley Recruiter and ATS Logic Specialist.
Perform a DEEP semantic analysis between the candidate's resume and the provided Job Description (JD).

Resume:
{{RESUME}}

Job Description:
{{JD}}

Instructions:
1. Calculate a semantic match score (0-100).
2. Identify specific "Missing Signals" (keywords or experiences present in JD but absent in Resume).
3. Identify "Matched Keywords" (keywords present in both).
4. Provide an optimization strategy for this specific role.

Output STRICTLY in the following format (including the brackets):
[SCORE] {score}
[MATCHED] {comma separated list of matched keywords}
[MISSING] {comma separated list of missing keywords or experiences}
[STRATEGY]
{bullet points of optimization strategy}
`;

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const { allowed } = await rateLimit({ key: `ats-live:${ip}`, limit: 10, windowMs: 60000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const { resumeData, jdText } = await req.json();

        const prompt = ATS_LIVE_PROMPT
            .replace('{{RESUME}}', JSON.stringify(resumeData || {}))
            .replace('{{JD}}', jdText || '');

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const generator = generateContentStreamGemini(prompt, "You are an ATS Semantic Analyzer.");
                    for await (const chunk of generator) {
                        controller.enqueue(encoder.encode(chunk));
                    }
                } catch (error) {
                    console.error('[AtsLive Stream API Error]:', error);
                    controller.enqueue(encoder.encode(`\n[ERROR] Stream processing failed.`));
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            }
        });

    } catch (error) {
        console.error('[AtsLive API] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

