export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { generateConversationTitle } from '@/lib/ai/conversation-title';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const supabase = createClient();
    const userId = session.userId;

    // 1. Fetch conversation ensuring it belongs to the authenticated user
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('id, created_at, updated_at')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convErr || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // 2. Fetch all messages in chronological order
    const { data: messages, error: msgErr } = await supabase
      .from('ai_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgErr) {
      console.error('[Omni Conversation GET] Message fetch error:', msgErr.message);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // 3. Format messages and unpack rich block payloads
    let firstUserPrompt = '';
    const formattedMessages = (messages || []).map((m: any) => {
      if (m.role === 'user') {
        if (!firstUserPrompt && m.content) {
          firstUserPrompt = m.content;
        }
        return {
          id: m.id,
          role: 'user' as const,
          content: m.content || '',
          created_at: m.created_at,
        };
      }

      // Assistant message: check for serialized rich blocks
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
                analysis: parsed.analysis,
                artifacts: parsed.artifacts,
                blocks: parsed.blocks,
                created_at: m.created_at,
              };
            }
          } catch {
            // Not valid JSON, keep as plain text
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
        role: m.role,
        content: m.content || '',
        created_at: m.created_at,
      };
    });

    const title = firstUserPrompt ? generateConversationTitle(firstUserPrompt) : 'New Conversation';

    return NextResponse.json({
      conversation: {
        id: conv.id,
        title,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      },
      messages: formattedMessages,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Omni Conversation GET] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const supabase = createClient();
    const userId = session.userId;

    // Verify ownership
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 });
    }

    // Delete messages
    await supabase
      .from('ai_messages')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    // Delete conversation
    const { error: delErr } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (delErr) {
      console.error('[Omni Conversation DELETE] Error:', delErr.message);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: conversationId });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Omni Conversation DELETE] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
