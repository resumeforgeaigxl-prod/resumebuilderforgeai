export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const userId = session.userId;

        // Try to get the most recent conversation
        const { data: conversations, error: fetchError } = await supabase
            .from('conversations')
            .select('id')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (fetchError) {
            console.error('Failed to fetch conversation:', fetchError);
        }

        const conversation = conversations?.[0];

        if (conversation) {
            // Load messages for this conversation
            const { data: messages } = await supabase
                .from('ai_messages')
                .select('role, content, created_at')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: true });

            return NextResponse.json({
                conversationId: conversation.id,
                messages: messages || []
            });
        }

        // If no conversation exists, create one
        const { data: newConvo, error: createError } = await supabase
            .from('conversations')
            .insert({ user_id: userId })
            .select()
            .single();

        if (createError) throw createError;

        return NextResponse.json({
            conversationId: newConvo.id,
            messages: []
        });

    } catch (error: unknown) {
        console.error('[AI Conversation GET Error]', error);
        const message = error instanceof Error ? error.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


