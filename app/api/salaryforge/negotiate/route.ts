import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { getSession } from '@/lib/auth/jwt';
import { rateLimit } from '@/lib/rate-limit';

const NEGOTIATION_PROMPT = `
You are an expert Salary Negotiator and Career Coach. 
A candidate has received a job offer for the role of {{ROLE}}.
Current Offer: {{OFFER}}
Target Salary: {{TARGET}}

Generate a professional, high-impact negotiation script that the candidate can use via email or in-person.
The script should:
1. Express gratitude and excitement for the role.
2. Clearly state the request for a higher base salary or additional benefits.
3. Provide 3-4 data-driven justifications based on the candidate's impact (e.g., market rate, specialized skills).
4. Maintain a collaborative and positive tone.

Return the response in JSON format:
{
    "script": "The full script text...",
    "key_points": ["Point 1", "Point 2", "Point 3"],
    "market_insight": "A brief insight about the salary for this role..."
}
`;

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const { allowed } = await rateLimit({ key: `salary:${ip}`, limit: 5, windowMs: 60000 });
        if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

        const { role, currentOffer, targetSalary } = await req.json();

        const prompt = NEGOTIATION_PROMPT
            .replace('{{ROLE}}', role)
            .replace('{{OFFER}}', currentOffer)
            .replace('{{TARGET}}', targetSalary);

        const aiResponse = await generateAIResponse(prompt, {
            userId: session.userId,
            contextType: 'general',
            jsonMode: true,
            systemPrompt: "You are an expert Salary Negotiator."
        });

        return NextResponse.json({ success: true, data: aiResponse });

    } catch (error) {
        console.error('[SalaryForge API] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
