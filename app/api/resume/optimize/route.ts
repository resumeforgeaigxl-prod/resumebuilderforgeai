export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { ResumeForge } from '@/lib/ai/forges/resume';
import { ResumeData } from '@/types/resume';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { AI_MESSAGES } from '@/lib/ai/safety';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const resumeData: ResumeData = body.resumeData;
        const jobDescription: string = body.jobDescription;

        if (!resumeData || !jobDescription) {
            return NextResponse.json({ error: 'Missing resume data or job description' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: userProfile } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', session.userId)
            .single();

        // Pre-fill missing personal info
        if (!resumeData.name && userProfile?.full_name) resumeData.name = userProfile.full_name;
        if (!resumeData.email && userProfile?.email) resumeData.email = userProfile.email;

        // NEW: Using the centralized ResumeForge
        try {
            const result = await ResumeForge.optimize(resumeData, jobDescription, session.userId);
            
            return NextResponse.json({
                success: true,
                optimizedData: result.optimized_resume || resumeData,
                analysis: result.analysis || { match_score: 0 }
            });
        } catch (aiErr) {
            console.warn("[Optimize AI Error]", aiErr);
            return NextResponse.json({ 
                success: false, 
                error: AI_MESSAGES.BUSY,
                optimizedData: resumeData // Safety: return original data
            });
        }

    } catch (e: unknown) {
        console.error("Error optimizing resume:", e);
        return NextResponse.json({
            success: false,
            error: e instanceof Error ? e.message : 'Internal Server Error'
        }, { status: 500 });
    }
}


