import { NextRequest, NextResponse } from 'next/server';
import { generateVoice, uploadVoiceToSupabase } from '@/lib/ai/elevenlabs-service';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, sceneIndex, projectId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Generate path for the audio file
    const timestamp = new Date().getTime();
    const filename = `voiceovers/${projectId || 'temp'}/scene_${sceneIndex}_${timestamp}.mp3`;

    // 1. Generate Voice via ElevenLabs
    const audioBuffer = await generateVoice(text, 'DemoStudio', session.userId);

    // 2. Upload to Supabase Storage
    const publicUrl = await uploadVoiceToSupabase(audioBuffer, filename);

    return NextResponse.json({ 
      success: true, 
      audioUrl: publicUrl,
      filename: filename
    });
  } catch (error: any) {
    console.error('Voiceover generation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
