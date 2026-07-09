export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { ResumeForge } from '@/lib/ai/forges/resume';
import { ResumeData } from '@/types/resume';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { AI_MESSAGES } from '@/lib/ai/safety';
import { checkDailyLimit, logUsage } from '@/lib/usage';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Daily Limit Check
        const limitStatus = await checkDailyLimit(session.userId, 'generate_resume');
        if (!limitStatus.allowed) {
            return NextResponse.json(
                {
                    error: `Daily limit reached (${limitStatus.used}/${limitStatus.limit} credits used). Upgrade to Pro for unlimited optimizations.`,
                    requiresUpgrade: true
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const resumeData: ResumeData = body.resumeData;
        const jobDescription: string = body.jobDescription;

        if (!resumeData || !jobDescription) {
            return NextResponse.json({ error: 'Missing resume data or job description' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: userProfile } = await supabase
            .from('users')
            .select('full_name, email, phone, target_role, skills, professional_summary, linkedin_url, github_url, experience_level, preferred_work_mode')
            .eq('id', session.userId)
            .single();

        // Pre-fill missing personal info
        if (!resumeData.name && userProfile?.full_name) resumeData.name = userProfile.full_name;
        if (!resumeData.email && userProfile?.email) resumeData.email = userProfile.email;
        if (!resumeData.phone && userProfile?.phone) resumeData.phone = userProfile.phone;
        if (!resumeData.linkedin && userProfile?.linkedin_url) resumeData.linkedin = userProfile.linkedin_url;
        if (!resumeData.github && userProfile?.github_url) resumeData.github = userProfile.github_url;

        // Build profile context for AI
        const profileContext = userProfile ? {
            targetRole: userProfile.target_role || '',
            skills: Array.isArray(userProfile.skills) ? userProfile.skills : [],
            professionalSummary: userProfile.professional_summary || '',
            experienceLevel: userProfile.experience_level || '',
            preferredWorkMode: userProfile.preferred_work_mode || ''
        } : undefined;

        // NEW: Using the centralized ResumeForge
        try {
            const result = await ResumeForge.optimize(resumeData, jobDescription, session.userId, profileContext);
            
            // Log credit consumption
            await logUsage(session.userId, 'generate_resume');

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


