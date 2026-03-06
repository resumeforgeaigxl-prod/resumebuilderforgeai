import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { jobId, originalResumeId, optimizedResume, matchScore, analysis } = body;

        if (!jobId || !optimizedResume) {
            return NextResponse.json({ error: 'Job ID and Optimized Resume data are required' }, { status: 400 });
        }

        const supabase = createClient();

        const { data, error } = await supabase
            .from('optimized_resumes')
            .insert({
                user_id: session.userId,
                job_id: jobId,
                original_resume_id: originalResumeId || null,
                optimized_resume: optimizedResume,
                match_score: matchScore || 0,
                analysis: analysis || {}
            })
            .select()
            .single();

        if (error) {
            console.error('[Save Optimized] Insert Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id });

    } catch (e) {
        console.error('[Save Optimized] Catch:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
