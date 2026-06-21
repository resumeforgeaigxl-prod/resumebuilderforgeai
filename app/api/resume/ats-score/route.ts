export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { calculateATSScore } from '@/lib/ats-score';
import { rateLimit } from '@/lib/rate-limit';
import { getSession } from '@/lib/auth/jwt';
import { logATSScore } from '@/lib/admin-logger';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        // Rate limit: 10 requests per minute per IP
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const { allowed, remaining } = await rateLimit({ key: `ats:${ip}`, limit: 10, windowMs: 60_000 });

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a moment.' },
                {
                    status: 429,
                    headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '60' },
                }
            );
        }

        const { resumeData, jobDescription } = await request.json();
        if (!resumeData) return NextResponse.json({ error: 'Resume data required' }, { status: 400 });

        // Retrieve the session and query role-specific skills from database
        const session = await getSession();
        let roleSkills: string[] | undefined = undefined;

        if (session?.userId) {
            try {
                const supabase = createClient();
                const { data: user } = await supabase
                    .from('users')
                    .select('target_role')
                    .eq('id', session.userId)
                    .single();

                if (user?.target_role) {
                    const { data: mapping } = await supabase
                        .from('role_skills_map')
                        .select('all_skills')
                        .eq('role_name', user.target_role)
                        .single();

                    if (mapping?.all_skills) {
                        roleSkills = mapping.all_skills;
                    }
                }
            } catch (dbErr) {
                console.warn('[ATS API] Failed to fetch user target role skills, falling back:', dbErr);
            }
        }

        const result = calculateATSScore(resumeData, jobDescription, roleSkills);

        // Fire-and-forget admin logging
        getSession().then(session => {
            if (session?.userId && result) {
                logATSScore({
                    userId: session.userId,
                    resumeId: (resumeData?.id as string) || null,
                    score: result.score ?? 0,
                    keywordMatch: result.details?.keywords ?? 0,
                    skillMatch: result.details?.skills ?? 0,
                    experienceMatch: result.details?.metrics ?? 0,
                    completeness: result.details?.completeness ?? 0,
                    jobDescription: jobDescription
                });
            }
        }).catch(() => { });

        return NextResponse.json({ success: true, scoreResult: result }, {
            headers: { 'X-RateLimit-Remaining': String(remaining) },
        });

    } catch (error) {
        console.error('[ATS]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


