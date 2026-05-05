import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
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
3. Provide an optimization strategy for this specific role.

Return the response in JSON format:
{
    "score": 85,
    "missing_signals": ["Distributed Systems", "Redis Caching"],
    "optimization_strategy": [
        "Include quantitative results for backend performance improvements.",
        "Highlight experience with serverless architecture mentioned in the JD."
    ],
    "matching_keywords": ["React", "TypeScript", "Next.js"]
}
`;

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const { allowed } = await rateLimit({ key: `ats-live:${ip}`, limit: 10, windowMs: 60000 });
        if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

        const { resumeData, jdText } = await req.json();

        const prompt = ATS_LIVE_PROMPT
            .replace('{{RESUME}}', JSON.stringify(resumeData))
            .replace('{{JD}}', jdText);

        const aiResponse = await generateAIResponse(prompt, {
            userId: session.userId,
            contextType: 'general',
            jsonMode: true,
            systemPrompt: "You are an ATS Semantic Analyzer."
        });

        return NextResponse.json({ success: true, data: aiResponse });

    } catch (error) {
        console.error('[AtsLive API] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
