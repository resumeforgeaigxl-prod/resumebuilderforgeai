import { NextRequest, NextResponse } from 'next/server';
import { generateVoice, uploadVoiceToSupabase } from '@/lib/ai/elevenlabs-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { text, module } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Get user from session (assuming middleware or auth check)
    // For now, we'll try to get it from the request or assume it's passed if internal
    // Ideally, we'd use a server-side session here.
    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.split(' ')[1] || ''
    );

    const audioBuffer = await generateVoice(text, module || 'General', user?.id);
    const filename = `voice-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    
    const publicUrl = await uploadVoiceToSupabase(audioBuffer, `voice-assets/${filename}`);

    return NextResponse.json({ url: publicUrl });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Voice generation error:', msg);
    return NextResponse.json({ error: msg || 'Internal Server Error' }, { status: 500 });
  }
}
