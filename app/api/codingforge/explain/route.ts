import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { getSession } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { code, language, context, mode = 'explain' } = body;

        const truncatedCode = code?.slice(0, 5000) || ''; 
        const truncatedContext = context?.slice(0, 1000) || '';

        let prompt = '';
        if (mode === 'summarize' && !truncatedCode) {
            prompt = `Summarize the following coding problem clearly for a candidate: ${truncatedContext}`;
        } else {
            prompt = `Explain this ${language || 'code'} in a LeetCode-style structure.\n${truncatedCode ? `Code:\n${truncatedCode}` : ''}\n${truncatedContext ? `Context: ${truncatedContext}` : ''}`;
        }

        const systemPrompt = `You are a senior technical interviewer. ${mode === 'summarize' ? 'Provide a concise summary.' : 'Explain in detail with headings: ## Problem Understanding, ## Intuition & Approach, ## Code Walkthrough, ## Complexity Analysis, ## Edge Cases.'}`;

        const explanation = await generateAIResponse(prompt, {
            userId: session.userId,
            contextType: 'coding',
            systemPrompt,
            jsonMode: false
        });

        return NextResponse.json({ explanation });

    } catch (e) {
        console.error('AI Explain API Error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
