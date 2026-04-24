export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { createClient } from '@supabase/supabase-js';
import { buildUserContext, type UserContext } from '@/lib/ai/mentor-context';
import { getSession } from '@/lib/auth/jwt';
import { trackAIUsage, logAIChat, updateMentorMemory, getMentorMemory } from '@/lib/ai/governance-service';

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
    // Specialized personas can be used to further tune the AI voice in the future.

    const [userContext] = await Promise.all([
      buildUserContext(userId).catch(() => ({} as UserContext)),
      getMentorMemory(userId).catch(() => ({}))
    ]);

    // ── 2. INTENT DETECTION & SPECIALIZED ARCHITECTURES ──────────────────────
    const detectIntent = (text: string) => {
      const lower = text.toLowerCase();
      if (lower.match(/\b(learn|understand|what is|explain|how does|why use|concept|theory|tell me about|curriculum|roadmap)\b/)) return 'EXPLANATION';
      if (lower.match(/\b(build|code|implement|create|setup|write|develop|how to code|give me code|snippet|example code)\b/)) return 'CODE';
      if (lower.match(/\b(error|fix|bug|problem|issue|not working|failed|broken|debug|crash|exception|help with)\b/)) return 'DEBUG';
      return 'GENERAL';
    };

    let intent = detectIntent(message);
    
    // Fallback: If intent is General but mode is specific, align them
    if (intent === 'GENERAL') {
      if (mode === 'Learning') intent = 'EXPLANATION';
      else if (mode === 'Coding') intent = 'CODE';
      else if (mode === 'Interview') intent = 'EXPLANATION';
      else if (mode === 'Career') intent = 'EXPLANATION';
    }

    const responseArchitectures: Record<string, string> = {
      'EXPLANATION': `
      ## What is it?
      [Simple, beginner-friendly explanation of the concept]
      
      ## Why it matters
      [Importance, use cases, and real-world value]
      
      ## How it works
      [Step-by-step breakdown of the logic, process, or architecture]
      
      ## Example
      [A clear real-world scenario, analogy, or use case]
      
      ## Code (optional)
      [ONLY if relevant: a minimal, well-commented code snippet at the VERY END]
      
      ## Next steps
      [Learning path, related concepts, or recommended practice tasks]`,
      'CODE': `
      ## Concept Overview
      [MANDATORY: Briefly explain the logic and architectural choice. NO CODE BLOCKS HERE.]
      
      ## Implementation Steps
      [MANDATORY: Logical sequence of steps to follow BEFORE showing code]
      
      ## Implementation
      [The clean, optimized code with detailed comments]
      
      ## Pro-Tips & Best Practices
      [Optimization tips, security advice, or architectural patterns]`,
      'DEBUG': `
      ## The Issue
      [Identify exactly what the error or problem means in plain English]
      
      ## Root Cause
      [Explain WHY this usually happens and why it is happening in this context]
      
      ## The Solution
      [Clear, step-by-step manual steps to resolve the issue]
      
      ## Corrected Code
      [The fixed code snippet with comments on what changed]
      
      ## Prevention
      [Practical advice on how to avoid this bug in the future]`
    };

    const selectedArchitecture = responseArchitectures[intent] || `
      # [Title]
      
      ## Overview
      [Concise explanation]
      
      ## Detailed Breakdown
      [Clear steps or implementation details]
      
      ## Practical Application
      [Real-world example or code]
      
      ## Mentor Advice
      [Professional advice/Pro-tips]`;

    console.log(`[MentorForge] Intent: ${intent} | Mode: ${mode} | User: ${userId}`);

    // Clean history to prevent "format anchoring" with safety guards
    const cleanedHistory = (history || []).slice(-4).map((h: { role: string; content?: string }) => ({
      role: h.role,
      content: h.role === 'assistant' 
        ? (h.content || "").replace(/```[\s\S]*?```/g, '[Code block removed for brevity]').substring(0, 300) 
        : (h.content || "").substring(0, 500)
    }));

    const instructions = `You are MentorForge AI, an elite technical educator.
    RESPONSE_FORMAT: JSON ONLY.
    MENTORSHIP_RULE: Never lead with code. Always explain concept first using ## headers.`;

    const userPrompt = `TASK: Answer the user message using the [${intent}] mentorship pattern.
    
    REQUIRED_HEADERS:
    ${selectedArchitecture}
    
    RULES:
    - You MUST start your "reply" content with a ## header.
    - CONCEPTUAL_OVERVIEW MUST be the first thing said.
    - ALL CODE implementation MUST come after the explanation.
    
    USER_QUERY: "${message}"
    HISTORY: ${JSON.stringify(cleanedHistory)}
    
    OUTPUT_JSON: { "reply": "...", "suggestedAction": "...", "memoryExtraction": {...} }`;

    const result = await generateAIResponse(userPrompt, {
        userId,
        contextType: 'general',
        jsonMode: true,
        systemPrompt: instructions,
    });

    // ── 3. POST-PROCESSING STRUCTURAL SAFEGUARD ───────────────────────────
    // If the AI stubbornyl leads with code, we shift it to the end
    let processedReply = result.reply || "";
    
    // Check for leading code block or raw language identifier
    const leadingCodeMatch = processedReply.trim().match(/^(`{3}|javascript|python|typescript|bash|html|css|sql)/i);
    if (leadingCodeMatch && (intent === 'EXPLANATION' || intent === 'CODE')) {
       console.log(`[MentorForge] Post-processing: Shifting leading code block for intent ${intent}`);
       
       // Try to find the first header
       const firstHeaderIndex = processedReply.indexOf('##');
       if (firstHeaderIndex > -1) {
           const codePart = processedReply.substring(0, firstHeaderIndex).trim();
           const restPart = processedReply.substring(firstHeaderIndex).trim();
           processedReply = `${restPart}\n\n### Implementation Details\n${codePart}`;
       } else {
           // No headers found? Prepend a mandatory header
           const header = intent === 'EXPLANATION' ? '## Concept Overview' : '## Implementation Overview';
           processedReply = `${header}\n[Mentor Note: Here is an explanation of the implementation below.]\n\n${processedReply}`;
       }
    }

    // Final tracking & record
    await trackAIUsage(userId, 'MentorForge', { input: 1500, output: 800 }, 'gemini-2.0-flash');
    await logAIChat(userId, 'MentorForge', message, processedReply, 2000);

    await supabase.from('mentor_chats').insert([
        { user_id: userId, role: 'user', content: message },
        { user_id: userId, role: 'assistant', content: processedReply, metadata: { suggestedAction: result.suggestedAction } }
    ]);

    // Update long-term memory
    if (result.memoryExtraction) {
      await updateMentorMemory(userId, result.memoryExtraction);
    }

    return NextResponse.json({ 
      reply: processedReply, 
      suggestedAction: result.suggestedAction,
      analysis: userContext.analysis
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('MentorForge Chat Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


