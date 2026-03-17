import { NextRequest, NextResponse } from 'next/server';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@supabase/supabase-js';
import { buildUserContext } from '@/lib/ai/mentor-context';
import { getSession } from '@/lib/auth/jwt';
import { trackAIUsage, logAIChat, isUnderQuota, updateMentorMemory, getMentorMemory } from '@/lib/ai/governance-service';

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

    // ── 1. UNRESTRICTED INTELLIGENCE ─────────────────────────────────────────
    // Build specialized mode context
    const modePersonas: Record<string, string> = {
      'General': 'a versatile AI polymath capable of explaining any topic from quantum physics to cooking.',
      'Career': 'a world-class executive coach and career strategist specialized in high-growth tech roles.',
      'Coding': 'a senior principal engineer at a top-tier tech firm, expert in DSA, System Design, and Clean Code.',
      'Interview': 'a senior hiring manager who has conducted thousands of interviews at Google, Meta, and Amazon.',
      'Learning': 'a master educator who simplifies complex technical concepts into intuitive building blocks.'
    };

    const [userContext, memory] = await Promise.all([
      buildUserContext(userId).catch(() => ({})),
      getMentorMemory(userId).catch(() => ({}))
    ]);

    const systemPrompt = `You are MentorForge AI, ${modePersonas[mode] || modePersonas.General} 
    You are part of the ResumeForgeAI ecosystem, but you have GLOBAL intelligence.
    
    CORE DIRECTIVES:
    1. NEVER admit to being limited or lacking access to other forges. Use your training data to answer ANY question confidently.
    2. Provide deep, professional, and technical answers (senior engineer level).
    3. Use ResumeForgeAI data ONLY as a helpful enhancement, never as a boundary.
    4. If the user asks to learn something, provide a structured curriculum, commands, and practice tasks.
    5. DATA ACCESS: If any Forge context says "permission_denied", do NOT lie. Tell the user: "I don't have access to your [Forge Name] data yet. Would you like to grant me access so I can provide a personalized analysis?"
    6. Once the user says "Yes" or grants permission, use the suggestedAction field to trigger the navigation or permission grant.
    
    RESPONSE ARCHITECTURE (STRICT):
    - Tone: Confident, Mentorship-driven, Professional.
    - Structure must follow this pattern:
      # [Title]
      
      ## Explanation
      [Concise explanation]
      
      ## Step-by-Step implementation
      [Clear steps]
      
      ## Practical Example
      [Real-world example or code]
      
      ## Pro-Tips
      [Advanced advice]

    IMPORTANT: In your JSON response, ensure the "reply" string uses literal \\n characters for line breaks so it passes as valid JSON.

    Memory Context: ${JSON.stringify(memory)}
    User Profile Analysis: ${JSON.stringify(userContext.analysis || {})}
    
    Current Mode: ${mode}
    History: ${JSON.stringify(history?.slice(-8))}
    User Message: "${message}"

    RETURN ONLY A VALID JSON OBJECT. NO MARKDOWN FENCES. NO PREAMBLE.
    JSON SCHEMA:
    {
      "reply": "Full Markdown string (use \\n for newlines)",
      "suggestedAction": "Navigation target or null",
      "memoryExtraction": { "goals": [], "weaknesses": [], "strengths": [] }
    }`;

    const result = await generateJsonGemini(
      systemPrompt, 
      "You are a technical mentor AI that exclusively communicates using valid JSON. You always escape newlines inside the 'reply' field correctly."
    );

    // Track usage & log
    await trackAIUsage(userId, 'MentorForge', { input: 1200, output: 600 }, 'gemini-2.0-flash');
    await logAIChat(userId, 'MentorForge', message, result.reply, 1800);

    // PERSISTENCE: Save to mentor_chats
    const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    await supabaseClient.from('mentor_chats').insert([
        { user_id: userId, role: 'user', content: message },
        { user_id: userId, role: 'assistant', content: result.reply, metadata: { suggestedAction: result.suggestedAction } }
    ]);

    // Update long-term memory
    if (result.memoryExtraction) {
      await updateMentorMemory(userId, result.memoryExtraction);
    }

    return NextResponse.json({ 
      reply: result.reply, 
      suggestedAction: result.suggestedAction,
      analysis: userContext.analysis
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('MentorForge Chat Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
