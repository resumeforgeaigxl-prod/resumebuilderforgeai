export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const userId = session.userId;

    // 1. Fetch most recent active conversation for the user
    const { data: convs, error: convErr } = await supabase
      .from('conversations')
      .select('id, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (convErr || !convs || convs.length === 0) {
      return NextResponse.json({ conversationId: null, history: [] });
    }

    const activeConv = convs[0];

    // 2. Fetch messages for this conversation
    const { data: messages, error: msgErr } = await supabase
      .from('ai_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', activeConv.id)
      .order('created_at', { ascending: true });

    if (msgErr) {
      console.warn('[MentorForge] History retrieve warning:', msgErr.message);
      return NextResponse.json({ conversationId: activeConv.id, history: [] });
    }

    // 3. Format messages and unpack rich block payloads
    const formatted = (messages || []).map((m: any) => {
      if (m.role === 'assistant') {
        if (typeof m.content === 'string' && m.content.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(m.content);
            if (parsed && typeof parsed === 'object') {
              return {
                id: m.id,
                role: 'assistant' as const,
                content: parsed.reply || '',
                suggestedAction: parsed.suggestedAction,
                artifacts: parsed.artifacts,
                blocks: parsed.blocks,
                analysis: parsed.analysis,
                created_at: m.created_at,
              };
            }
          } catch {
            // plain text
          }
        }
        return {
          id: m.id,
          role: 'assistant' as const,
          content: m.content || '',
          created_at: m.created_at,
        };
      }

      return {
        id: m.id,
        role: 'user' as const,
        content: m.content || '',
        created_at: m.created_at,
      };
    });

    return NextResponse.json({
      conversationId: activeConv.id,
      history: formatted,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[MentorForge] History fallback:', msg);
    return NextResponse.json({ conversationId: null, history: [] });
  }
}
