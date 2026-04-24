export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { question, answer, jobTitle } = await req.json();

        if (!question || !answer) {
            return NextResponse.json({ error: 'Missing question or answer' }, { status: 400 });
        }

        const prompt = `
            You are an expert interviewer for the role: ${jobTitle || 'Software Engineer'}.
            
            Question asked: ${question}
            Candidate Answer: ${answer}
            
            Evaluate the answer based on:
            1. Technical accuracy (if applicable)
            2. Communication clarity
            3. Completeness (did they answer all parts of the question?)
            4. Potential for improvement
            
            Return a JSON object with:
            {
                "score": 1-10,
                "strengths": ["string"],
                "weaknesses": ["string"],
                "suggestion": "Detailed improvement advice",
                "model_answer": "A perfect response example"
            }
        `;

        const evaluation = await generateAIResponse(prompt, {
            userId: session.userId,
            contextType: 'general',
            jsonMode: true,
            systemPrompt: "You are an expert technical interviewer."
        });

        if (!evaluation) throw new Error('Failed to generate evaluation');

        return NextResponse.json({ success: true, evaluation });

    } catch (error) {
        console.error('[API] Evaluation Error:', error);
        const msg = error instanceof Error ? error.message : 'Evaluation failed';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}


