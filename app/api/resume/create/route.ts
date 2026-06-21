export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getSession } from '@/lib/auth/jwt'
import { sendResumeCreatedEmail } from '@/lib/brevo'
import { checkForgeAccess } from '@/lib/auth/usage'

const DEFAULT_RESUME_JSON: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    summary: string;
    skills: { languages: string[]; frameworks: string[]; tools: string[]; other: string[] };
    experience: { id: string; company: string; role: string; duration: string; points: string[] }[];
    projects: { id: string; name: string; tech: string[]; description: string[] }[];
    education: { id: string; institution: string; degree: string; year: string; score: string }[];
    certifications: { id: string; title: string; issuer: string; year: string }[];
} = {
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: { languages: [], frameworks: [], tools: [], other: [] },
    experience: [],
    projects: [],
    education: [],
    certifications: []
}

/**
 * Builds a pre-populated resume_json from the user's profile data.
 * Falls back to DEFAULT_RESUME_JSON for any missing fields.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildResumeFromProfile(profile: any): typeof DEFAULT_RESUME_JSON {
    if (!profile) return { ...DEFAULT_RESUME_JSON };

    // Map profile skills array into categorized ResumeSkills structure
    const profileSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const skills = {
        languages: [] as string[],
        frameworks: [] as string[],
        tools: [] as string[],
        other: profileSkills.length > 0 ? [...profileSkills] : []
    };

    // Build education entries from profile education fields
    const education: { id: string; institution: string; degree: string; year: string; score: string }[] = [];
    
    if (profile.education_10th_school) {
        education.push({
            id: `edu-10th-${Date.now()}`,
            institution: profile.education_10th_school || '',
            degree: '10th / SSC',
            year: profile.education_10th_year || '',
            score: profile.education_10th_percentage || ''
        });
    }
    if (profile.education_12th_school) {
        education.push({
            id: `edu-12th-${Date.now()}`,
            institution: profile.education_12th_school || '',
            degree: '12th / HSC',
            year: profile.education_12th_year || '',
            score: profile.education_12th_percentage || ''
        });
    }
    if (profile.education_diploma_college) {
        education.push({
            id: `edu-diploma-${Date.now()}`,
            institution: profile.education_diploma_college || '',
            degree: `Diploma in ${profile.education_diploma_branch || 'Engineering'}`,
            year: profile.education_diploma_year || '',
            score: profile.education_diploma_percentage || ''
        });
    }
    if (profile.education_btech_college) {
        education.push({
            id: `edu-btech-${Date.now()}`,
            institution: profile.education_btech_college || '',
            degree: `B.Tech in ${profile.education_btech_branch || 'Computer Science'}`,
            year: profile.education_btech_year || '',
            score: profile.education_btech_cgpa || ''
        });
    }
    if (profile.education_masters_college) {
        education.push({
            id: `edu-masters-${Date.now()}`,
            institution: profile.education_masters_college || '',
            degree: `${profile.education_masters_degree || 'M.Tech'} in ${profile.education_masters_branch || ''}`.trim(),
            year: profile.education_masters_year || '',
            score: profile.education_masters_cgpa || ''
        });
    }

    return {
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        linkedin: profile.linkedin_url || '',
        github: profile.github_url || '',
        summary: profile.professional_summary || '',
        skills,
        experience: [],
        projects: [],
        education: education.length > 0 ? education : [],
        certifications: []
    };
}

export async function POST() {
    // 1. Get current session from JWT (Primary identity)
    const session = await getSession();
    const userId = session?.userId;

    console.log('[API] Resume Create - Auth check:', {
        jwtSession: session?.userId,
        finalUserId: userId
    });

    // 2. Ensure user_id exists before inserting resume
    if (!userId) {
        console.warn('[API] Resume Create - No userId found');
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2.5 Check usage limits
    const access = await checkForgeAccess('resumecount');
    if (!access.hasAccess) {
        return NextResponse.json({ 
            success: false, 
            error: access.reason === 'limit_reached' 
                ? 'Limit reached: Free users can create up to 2 resumes. Upgrade to unlock unlimited!' 
                : 'Access denied' 
        }, { status: 403 });
    }

    try {
        const supabase = createClient();
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 3. Backend Protection: Avoid duplicate resumes within 2 seconds
        const { data: recentResumes } = await supabaseAdmin
            .from('resumes')
            .select('id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (recentResumes && recentResumes.length > 0) {
            const lastCreated = new Date(recentResumes[0].created_at).getTime();
            const now = new Date().getTime();
            if (now - lastCreated < 2000) {
                console.warn('[API] Resume Create - Rate limited (duplicate request)');
                return NextResponse.json({
                    success: false,
                    error: 'Please wait a moment before creating another resume.'
                }, { status: 429 });
            }
        }

        // 3.5 Fetch user profile to auto-populate resume
        let resumeJson = { ...DEFAULT_RESUME_JSON };
        let resumeTitle = 'Untitled Resume';
        try {
            const { data: userProfile } = await supabaseAdmin
                .from('users')
                .select('full_name, email, phone, linkedin_url, github_url, skills, target_role, professional_summary, education_10th_school, education_10th_year, education_10th_percentage, education_12th_school, education_12th_year, education_12th_percentage, education_diploma_college, education_diploma_branch, education_diploma_year, education_diploma_percentage, education_btech_college, education_btech_branch, education_btech_year, education_btech_cgpa, education_masters_college, education_masters_degree, education_masters_branch, education_masters_year, education_masters_cgpa')
                .eq('id', userId)
                .single();

            if (userProfile) {
                resumeJson = buildResumeFromProfile(userProfile);
                if (userProfile.target_role) {
                    resumeTitle = `${userProfile.target_role} Resume`;
                }
                console.log('[API] Resume Create - Auto-populated from profile for:', userProfile.full_name);
            }
        } catch (profileErr) {
            console.warn('[API] Resume Create - Could not fetch profile, using defaults:', profileErr);
        }

        // 4. Await insert with .select().single()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('resumes')
            .insert({
                user_id: userId,
                title: resumeTitle,
                resume_json: resumeJson,
                template_selected: 'modern',
                email_sent: false
            })
            .select('id')
            .single();

        // 5. Handle insert errors explicitly
        if (error) {
            console.error("[API] Resume insert error:", error);
            return NextResponse.json({
                success: false,
                error: 'Database insertion failed',
                details: error.message
            }, { status: 500 });
        }

        if (!data?.id) {
            console.error("[API] Resume create - No ID returned");
            return NextResponse.json({
                success: false,
                error: 'Failed to generate resume ID'
            }, { status: 500 });
        }

        // 6. Send resume-created email (only if email_sent is false)
        try {
            const { data: userRow } = await supabaseAdmin
                .from('users')
                .select('email, full_name')
                .eq('id', userId)
                .single();

            // Re-fetch resume to check email_sent (to be triple safe)
            const { data: resumeCheck } = await supabaseAdmin
                .from('resumes')
                .select('email_sent')
                .eq('id', data.id)
                .single();

            if (userRow?.email && resumeCheck && !resumeCheck.email_sent) {
                await sendResumeCreatedEmail(
                    userRow.email,
                    userRow.full_name || undefined,
                    'Untitled Resume',
                    data.id
                );

                // Update email_sent to true
                await supabaseAdmin
                    .from('resumes')
                    .update({ email_sent: true })
                    .eq('id', data.id);

                console.log('[API] Resume Create - Email sent and flag updated for:', data.id);
            }
        } catch (emailErr) {
            console.error('[Resume Create] Failed to trigger email:', emailErr);
        }

        return NextResponse.json({ success: true, id: data.id });
    } catch (err: unknown) {
        console.error("[API] Resume creation failed:", err);
        const msg = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}


