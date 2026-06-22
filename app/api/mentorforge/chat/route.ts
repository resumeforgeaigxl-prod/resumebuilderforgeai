export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { runAgenticLoop, type AgentProgressEvent } from '@/lib/ai-core/agent-loop';
import { createClient } from '@supabase/supabase-js';
import { buildUserContext, type UserContext } from '@/lib/ai/mentor-context';
import { getSession } from '@/lib/auth/jwt';
import { trackAIUsage, logAIChat, updateMentorMemory } from '@/lib/ai/governance-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userId = session.userId;

    const { message, history, mode = 'General' } = await req.json();

    console.log(`[MentorForge] Running Agent Loop (SSE) | Mode: ${mode} | User: ${userId}`);

    // Clean history to prevent token bloat
    const cleanedHistory = (history || []).slice(-10).map((h: { role: string; content?: string }) => ({
      role: h.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: h.content || ""
    }));

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

        // Send initial thinking event
        sendEvent('progress', { type: 'thinking', name: 'agent_reasoning', status: 'running' });

        try {
          // Execute agent reasoning loop with real-time progress callback
          const result = await runAgenticLoop(
            message,
            cleanedHistory,
            userId,
            mode,
            (event: AgentProgressEvent) => {
              sendEvent('progress', event);
            }
          );

          // Track AI usage telemetry
          await trackAIUsage(userId, 'MentorForge', { input: 1500, output: 800 }, 'gemini-2.0-flash');
          await logAIChat(userId, 'MentorForge', message, result.reply, 2000);

          // Log chat interaction into DB for message history
          await supabase.from('mentor_chats').insert([
            { user_id: userId, role: 'user', content: message },
            { user_id: userId, role: 'assistant', content: result.reply, metadata: { suggestedAction: result.suggestedAction } }
          ]);

          // Update long-term memory if the agent extracted insights
          if (result.memoryExtraction) {
            await updateMentorMemory(userId, result.memoryExtraction);
          }

          // Retrieve updated context to return user readiness stats
          const userContext = await buildUserContext(userId).catch(() => ({} as UserContext));

          // Send final result event
          sendEvent('result', {
            reply: result.reply,
            suggestedAction: result.suggestedAction,
            analysis: userContext.analysis
          });

        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          console.error('MentorForge Agent Loop Error:', msg);
          sendEvent('error', { error: msg });
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
