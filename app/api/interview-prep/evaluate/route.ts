export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-provider';
import { getSession } from '@/lib/auth/jwt';

/**
 * POST /api/interview-prep/evaluate
 * Evaluates a user's answer to an interview question using AI.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { question, answer } = body;

        if (!question || !answer) {
            return NextResponse.json({ error: 'Missing question or answer' }, { status: 400 });
        }

        const systemPrompt = `You are a strict, senior technical interviewer.
        Evaluate the user's answer for:
        1. Technical Accuracy & Completeness
        2. Structure & Clarity
        3. Professionalism

        Return a JSON object:
        {
          "score": 0-10,
          "qualitative": "Short, punchy feedback for improvement",
          "model_answer": "How a person with 10+ years experience would answer this briefly and effectively"
        }`;

        const prompt = `QUESTION: ${question}
        USER ANSWER: ${answer}`;

        const aiRes = await generateAIResponse(prompt, undefined, systemPrompt, 0.2, 800);
        let feedback;
        try {
            const cleaned = aiRes.text.trim().replace(/^```json|```$/gi, '').trim();
            feedback = JSON.parse(cleaned);
        } catch {
            console.error('[Evaluate] AI output raw:', aiRes.text);
            feedback = {
                score: 7,
                qualitative: "AI evaluation parsing failed, but your answer was received.",
                model_answer: "Not available."
            };
        }

        return NextResponse.json({ success: true, feedback });
    } catch {
        return NextResponse.json({ error: 'Failed to evaluate answer' }, { status: 500 });
    }
}


