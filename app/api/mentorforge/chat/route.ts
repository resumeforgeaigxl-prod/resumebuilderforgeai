export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { runAgenticLoop, type AgentProgressEvent } from '@/lib/ai-core/agent-loop';
import { createClient } from '@/lib/supabase/server';
import { buildUserContext, type UserContext } from '@/lib/ai/mentor-context';
import { getSession } from '@/lib/auth/jwt';
import { trackAIUsage, logAIChat, updateMentorMemory } from '@/lib/ai/governance-service';
import {
  resolveContextualJobIntent,
  formatShortlistForPrompt,
  extractConversationShortlist,
  sanitizeSuggestedAction,
} from '@/lib/ai-core/contextual-job-resolver';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userId = session.userId;
    const supabase = createClient();

    const body = await req.json();
    const { message, history, mode = 'General', conversationId: incomingConversationId } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    console.log(`[MentorForge] Running Agent Loop (SSE) | Mode: ${mode} | User: ${userId}`);

    // 1. Resolve or Create Conversation
    let conversationId = incomingConversationId;
    if (conversationId) {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingConv) {
        conversationId = null;
      }
    }

    if (!conversationId) {
      const { data: newConv, error: newConvErr } = await supabase
        .from('conversations')
        .insert({ user_id: userId, updated_at: new Date().toISOString() })
        .select('id')
        .single();

      if (newConvErr || !newConv) {
        console.error('[MentorForge] Failed to create conversation record:', newConvErr);
        return new Response(JSON.stringify({ error: 'Failed to create conversation' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
      conversationId = newConv.id;
    }

    // 2. Pre-persist the user message immediately so history survives disconnection
    try {
      await supabase.from('ai_messages').insert({
        conversation_id: conversationId,
        user_id: userId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      });
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (saveUserErr) {
      console.warn('[MentorForge] Warning: pre-saving user message failed:', saveUserErr);
    }

    // Reconstruct full history with structured artifacts (from client history or DB)
    let fullHistoryForContext = Array.isArray(history) ? [...history] : [];
    if (conversationId && (!fullHistoryForContext.length || !fullHistoryForContext.some((m: any) => m.artifacts?.length))) {
      const { data: dbMsgs } = await supabase
        .from('ai_messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (dbMsgs && dbMsgs.length > 0) {
        const parsedDbMsgs = dbMsgs.reverse().map((m: any) => {
          if (m.role === 'assistant' && typeof m.content === 'string' && m.content.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(m.content);
              return {
                role: 'assistant' as const,
                content: parsed.reply || '',
                artifacts: parsed.artifacts,
                blocks: parsed.blocks,
              };
            } catch {
              return { role: 'assistant' as const, content: m.content };
            }
          }
          return { role: m.role as 'user' | 'assistant', content: m.content };
        });
        fullHistoryForContext = parsedDbMsgs;
      }
    }

    // Resolve contextual job intent (ordinals, best match, relative apply, bulk apply)
    const { intent, shortlist, systemDirective } = resolveContextualJobIntent(message, fullHistoryForContext);
    const effectiveMessage = systemDirective ? `${message}\n\n${systemDirective}` : message;

    // Clean history to prevent token bloat while preserving active job shortlist references for the LLM
    const cleanedHistory = fullHistoryForContext.slice(-10).map((h: any) => {
      let content = h.content || '';
      if (h.role === 'assistant') {
        const subShortlist = extractConversationShortlist([h]);
        if (subShortlist.length > 0) {
          content += formatShortlistForPrompt(subShortlist);
        }
      }
      return {
        role: h.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content,
      };
    });

    // Create SSE stream
    const encoder = new TextEncoder();
    let isCancelled = false;
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          if (isCancelled) return;
          try {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          } catch (err) {
            console.warn('[MentorForge] Stream enqueue error (client likely disconnected):', err);
          }
        };

        // Notify client of active conversationId immediately
        sendEvent('conversation', { conversationId });

        // Send initial thinking event
        sendEvent('progress', { type: 'thinking', name: 'agent_reasoning', status: 'running' });

        try {
          // Execute agent reasoning loop with real-time progress callback
          const result = await runAgenticLoop(
            effectiveMessage,
            cleanedHistory,
            userId,
            mode,
            (event: AgentProgressEvent) => {
              sendEvent('progress', event);
            }
          );

          // Retrieve updated context to return user readiness stats
          const userContext = await buildUserContext(userId).catch(() => ({} as UserContext));
          const cleanSuggestedAction = sanitizeSuggestedAction(result.suggestedAction);

          // Send final result event immediately to client
          sendEvent('result', {
            conversationId,
            reply: result.reply,
            suggestedAction: cleanSuggestedAction,
            analysis: userContext.analysis,
            artifacts: result.artifacts,
            blocks: (result as any).blocks,
          });

          // Chat persistence & telemetry
          try {
            await trackAIUsage(userId, 'MentorForge', { input: 1500, output: 800 }, 'gemini-2.0-flash');
            await logAIChat(userId, 'MentorForge', message, result.reply, 2000);

            // Serialize assistant payload with blocks and artifacts for full UI restoration
            const assistantContent = JSON.stringify({
              reply: result.reply || '',
              blocks: (result as any).blocks || [],
              artifacts: result.artifacts || [],
              suggestedAction: cleanSuggestedAction,
              analysis: userContext.analysis,
            });

            await supabase.from('ai_messages').insert({
              conversation_id: conversationId,
              user_id: userId,
              role: 'assistant',
              content: assistantContent,
              created_at: new Date().toISOString(),
            });

            await supabase
              .from('conversations')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', conversationId);

            if (result.memoryExtraction) {
              await updateMentorMemory(userId, result.memoryExtraction);
            }
          } catch (persistErr) {
            console.warn('[MentorForge] Assistant message persistence warning:', persistErr);
          }

        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          console.error('MentorForge Agent Loop Error:', msg);
          sendEvent('error', { error: msg, conversationId });
        } finally {
          if (!isCancelled) {
            try {
              controller.close();
            } catch (err) {
              console.warn('[MentorForge] Stream close error:', err);
            }
          }
        }
      },
      cancel() {
        isCancelled = true;
        console.log(`[MentorForge] Client closed connection for user: ${userId}`);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      }
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('MentorForge SSE Setup Error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
