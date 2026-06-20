export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { runAgenticLoop } from '@/lib/ai-core/agent-loop';
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
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.userId;

    const { message, history, mode = 'General' } = await req.json();

    console.log(`[MentorForge] Running Agent Loop | Mode: ${mode} | User: ${userId}`);

    // Clean history to prevent token bloat
    const cleanedHistory = (history || []).slice(-10).map((h: { role: string; content?: string }) => ({
      role: h.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: h.content || ""
    }));

    // Execute agent reasoning loop (native function calling)
    const result = await runAgenticLoop(message, cleanedHistory, userId, mode);

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

    return NextResponse.json({ 
      reply: result.reply, 
      suggestedAction: result.suggestedAction,
      analysis: userContext.analysis
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('MentorForge Agent Loop Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}



