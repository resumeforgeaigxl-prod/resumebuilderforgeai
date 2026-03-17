import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const API_KEYS = [
  process.env.ELEVENLABS_API_KEY_1,
  process.env.ELEVENLABS_API_KEY_2,
  process.env.ELEVENLABS_API_KEY_3,
  process.env.ELEVENLABS_API_KEY_4,
  process.env.ELEVENLABS_API_KEY_5,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

export async function generateVoice(text: string, moduleName: string = 'General', userId?: string) {
  if (API_KEYS.length === 0) {
    throw new Error('No ElevenLabs API keys configured');
  }

  let attempts = 0;
  const maxAttempts = API_KEYS.length;

  while (attempts < maxAttempts) {
    const apiKey = API_KEYS[currentKeyIndex];
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      
      // Select next key for next time (round-robin)
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;

      // Log usage
      if (userId) {
        try {
          await supabase.from('ai_voice_usage').insert({
            user_id: userId,
            module: moduleName,
            characters_used: text.length,
            api_key_used: `KEY_${currentKeyIndex + 1}`, // Masked for safety in logs
          });
        } catch (logErr) {
          console.warn('Failed to log voice usage to database:', logErr);
        }
      }

      return Buffer.from(audioBuffer);
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed with key ${currentKeyIndex + 1}:`, error);
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      attempts++;
    }
  }

  throw new Error('All ElevenLabs API keys failed');
}

export async function uploadVoiceToSupabase(buffer: Buffer, filename: string) {
  const { error } = await supabase.storage
    .from('voice-assets')
    .upload(filename, buffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('voice-assets')
    .getPublicUrl(filename);

  return publicUrl;
}
