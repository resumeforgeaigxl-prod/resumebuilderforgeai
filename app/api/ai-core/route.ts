import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { ContextType } from '@/lib/ai-core/context-builder';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { message, contextType, jsonMode, systemPrompt, options } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Validate context type
        const validTypes: ContextType[] = ['coding', 'interview', 'project', 'jobs', 'general'];
        const selectedType = validTypes.includes(contextType) ? contextType : 'general';

        const result = await generateAIResponse(message, {
            userId: session.userId,
            contextType: selectedType,
            jsonMode: jsonMode || false,
            systemPrompt,
            ...options
        });

        return NextResponse.json({ success: true, result });
    } catch (err: unknown) {
        console.error('[AI Core API] Error:', err);
        const msg = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
