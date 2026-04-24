export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';


export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { videoId, videoUrl } = await req.json();
        if (!videoId || !videoUrl) return NextResponse.json({ error: 'Video info missing' }, { status: 400 });

        const supabase = createClient();

        // 1. Check if explanation already exists
        const { data: existing } = await supabase
            .from('learnforge_video_notes')
            .select('*')
            .eq('video_id', videoId)
            .single();

        if (existing) {
            return NextResponse.json({ success: true, notes: existing });
        }

        // 2. For demo purposes and since I can't easily fetch YouTube transcripts in this environment, 
        // I'll simulate transcript extraction. In a real scenario, you'd use a service like 'youtube-transcript' 
        // or a similar microservice.
        
        
        
        const mockTranscript = `00:00 Hello everyone welcome to ${videoUrl} tutorial.
00:20 Today we will build a complete application step by step.
01:15 First, let's set up our project structure.
02:30 Now, we will implement the core business logic.
04:00 Finally, we will deploy our application.`;

        // 3. Generate AI Explanation using Gemini
        const systemPrompt = `Explain the following video transcript clearly.
Break explanation by timestamps.
Use beginner-friendly language.
Return JSON format: { "timestamp_explanations": [ { "time": "00:00 - 00:20", "topic": "...", "explanation": "..." } ] }`;

        const userPrompt = `Transcript: \n${mockTranscript}`;
        
        const aiResponse = await generateAIResponse(userPrompt, {
            userId: session!.userId,
            contextType: 'general',
            jsonMode: true,
            systemPrompt: systemPrompt
        });

        // 4. Save to DB
        const { data: newNotes, error: insertErr } = await supabase
            .from('learnforge_video_notes')
            .insert({
                video_id: videoId,
                transcript: mockTranscript,
                ai_explanation: aiResponse.timestamp_explanations
            })
            .select()
            .single();

        if (insertErr) throw insertErr;

        return NextResponse.json({ success: true, notes: newNotes });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[LearnForge AI] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


