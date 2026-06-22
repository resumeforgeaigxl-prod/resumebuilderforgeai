export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { runResumeAnalysisAgent, type ResumeAgentProgressEvent } from '@/lib/ai-core/resume-agent';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { aiCache } from '@/lib/cache/redis';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userId = session.userId;

    const { resumeId, resumeData } = await req.json();

    if (!resumeId || !resumeData) {
      return new Response(JSON.stringify({ success: false, message: "Missing resume data" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = createClient();
    const encoder = new TextEncoder();
    let isCancelled = false;

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          if (isCancelled) return;
          try {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          } catch (err) {
            console.warn('[Resume Analysis] SSE enqueue warning (client likely disconnected):', err);
          }
        };

        try {
          // 1. Check Cache first
          const cacheKey = aiCache.generateKey({ resumeData, promptType: 'resume_intelligence' });
          let aiResponse = await aiCache.get<any>(cacheKey);

          if (aiResponse) {
            console.log('[Resume Analysis] Cache hit. Simulating progressive agent steps...');
            // Simulating progressive steps for cache hits so the user gets the visual experience
            sendEvent('progress', { type: 'tool_start', name: 'verify_resume_structure', status: 'running', step: 1 });
            await new Promise(r => setTimeout(r, 400));
            sendEvent('progress', { type: 'tool_end', name: 'verify_resume_structure', status: 'finished', step: 1 });

            sendEvent('progress', { type: 'tool_start', name: 'assess_keywords_density', status: 'running', step: 2 });
            await new Promise(r => setTimeout(r, 400));
            sendEvent('progress', { type: 'tool_end', name: 'assess_keywords_density', status: 'finished', step: 2 });

            sendEvent('progress', { type: 'tool_start', name: 'generate_ats_optimization_strategy', status: 'running', step: 3 });
            await new Promise(r => setTimeout(r, 300));
            sendEvent('progress', { type: 'tool_end', name: 'generate_ats_optimization_strategy', status: 'finished', step: 3 });
          } else {
            console.log('[Resume Analysis] Cache miss. Running real-time agentic analysis loop...');
            // Run progressive analysis with LLM integration
            aiResponse = await runResumeAnalysisAgent(resumeData, userId, (event: ResumeAgentProgressEvent) => {
              sendEvent('progress', event);
            });

            // Save to Cache (24h TTL)
            if (aiResponse) {
              await aiCache.set(cacheKey, aiResponse, 86400);
            }
          }

          if (!aiResponse || typeof aiResponse.ats_score !== 'number') {
            throw new Error("Invalid response format received from AI provider.");
          }

          // 2. Store in database
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: dbData, error: dbError } = await (supabase as any)
            .from('resume_analysis')
            .insert({
              resume_id: resumeId,
              user_id: userId,
              ats_score: aiResponse.ats_score,
              strengths: aiResponse.strengths,
              missing_skills: aiResponse.missing_skills,
              improvements: aiResponse.improvements
            })
            .select()
            .single();

          if (dbError) throw dbError;

          // 3. Log usage
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('ai_usage_logs')
            .insert({
              user_id: userId,
              feature: 'resume_intelligence',
              model_used: 'gemini-2.0-flash',
              tokens_used: Math.floor(JSON.stringify(aiResponse).length / 4)
            });

          // Send final completed result event
          sendEvent('result', {
            success: true,
            analysis: dbData
          });

        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          console.error('[Resume Analysis SSE Stream] Error:', msg);
          sendEvent('error', { error: msg });
        } finally {
          if (!isCancelled) {
            try {
              controller.close();
            } catch (err) {
              console.warn('[Resume Analysis] SSE close warning:', err);
            }
          }
        }
      },
      cancel() {
        isCancelled = true;
        console.log(`[Resume Analysis] SSE stream cancelled by client for user: ${userId}`);
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
    console.error('[Resume Analysis SSE Setup] Error:', msg);
    return new Response(JSON.stringify({ success: false, message: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
