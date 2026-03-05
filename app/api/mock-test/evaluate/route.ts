import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSession } from '@/lib/auth/jwt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { question, answer, jobTitle } = await req.json();

        if (!question || !answer) {
            return NextResponse.json({ error: 'Missing question or answer' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
            
            Only return the JSON. No markdown.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error('Failed to parse AI response');

        const evaluation = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ success: true, evaluation });

    } catch (error) {
        console.error('[API] Evaluation Error:', error);
        return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
    }
}
