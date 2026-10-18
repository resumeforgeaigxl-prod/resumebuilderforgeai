export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { generateConversationTitle } from '@/lib/ai/conversation-title';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const userId = session.userId;

    // 1. Fetch conversations ordered by updated_at descending
    const { data: convs, error: convErr } = await supabase
      .from('conversations')
      .select('id, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (convErr) {
      console.error('[Omni Conversations] Fetch error:', convErr.message);
      return NextResponse.json({ conversations: [] });
    }

    if (!convs || convs.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const convIds = convs.map((c: any) => c.id);

    // 2. Fetch messages for these conversations to determine titles and previews
    const { data: messages } = await supabase
      .from('ai_messages')
      .select('id, conversation_id, role, content, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true });

    const messagesByConv: Record<string, any[]> = {};
    for (const msg of messages || []) {
      if (!messagesByConv[msg.conversation_id]) {
        messagesByConv[msg.conversation_id] = [];
      }
      messagesByConv[msg.conversation_id].push(msg);
    }

    // 3. Construct conversation list
    const result = convs.map((c: any) => {
      const cMsgs = messagesByConv[c.id] || [];
      const firstUserMsg = cMsgs.find(m => m.role === 'user');
      const lastMsg = cMsgs[cMsgs.length - 1];

      let title = 'New Conversation';
      if (firstUserMsg && firstUserMsg.content) {
        title = generateConversationTitle(firstUserMsg.content);
      }

      let preview = '';
      if (lastMsg && lastMsg.content) {
        if (lastMsg.role === 'assistant' && lastMsg.content.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(lastMsg.content);
            preview = parsed.reply || (parsed.blocks ? 'Rich Response' : '');
          } catch {
            preview = lastMsg.content;
          }
        } else {
          preview = lastMsg.content;
        }
      }

      return {
        id: c.id,
        title,
        created_at: c.created_at,
        updated_at: c.updated_at,
        messageCount: cMsgs.length,
        preview: preview.slice(0, 100),
      };
    });

    return NextResponse.json({ conversations: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Omni Conversations] Internal error:', msg);
    return NextResponse.json({ conversations: [] });
  }
}
