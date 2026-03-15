import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();

        // 1. Get user's latest roadmap
        const { data: roadmap } = await supabase
            .from('roadmaps')
            .select('target_role')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        const roadmapName = (roadmap?.target_role || '').trim();

        // 2. Fetch technical videos matching roadmap (normalized and case-insensitive)
        const { data: technicalVideos } = await supabase
            .from('learnforge_videos')
            .select('*')
            .eq('video_type', 'technical')
            .ilike('career_path', `%${roadmapName}%`);

        // 3. Fetch professional videos
        const { data: professionalVideos } = await supabase
            .from('learnforge_videos')
            .select('*')
            .eq('video_type', 'professional')
            .order('created_at', { ascending: false });

        return NextResponse.json({
            success: true,
            roadmapName,
            technicalVideos: technicalVideos || [],
            professionalVideos: professionalVideos || []
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
