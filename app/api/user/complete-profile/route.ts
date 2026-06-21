export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession, createSession } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { 
            fullName, 
            college, 
            skills, 
            experience, 
            phone, 
            referralSource,
            linkedinUrl,
            githubUrl,
            education,
            professionalSummary,
            portfolioUrl,
            targetRole,
            preferredWorkMode
        } = body;

        const supabase = createClient();

        // Update the user profile
        const { error: updateError } = await supabase
            .from('users')
            .update({
                full_name: fullName,
                phone_number: phone,
                college: college, 
                skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()).filter(Boolean),
                experience_level: experience,
                referral_source: referralSource,
                linkedin_url: linkedinUrl || null,
                github_url: githubUrl || null,
                education: education || {},
                professional_summary: professionalSummary || null,
                portfolio_url: portfolioUrl || null,
                target_role: targetRole || null,
                preferred_work_mode: preferredWorkMode || null,
                profile_completed: true,
                terms_accepted: true,
                terms_accepted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', session.userId);

        if (updateError) {
            console.warn('[CompleteProfile] New columns missing, falling back to legacy update...', updateError.message);
            const fallbackUpdate = await supabase
                .from('users')
                .update({
                    full_name: fullName,
                    phone_number: phone,
                    college: college, 
                    skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()).filter(Boolean),
                    experience_level: experience,
                    referral_source: referralSource,
                    linkedin_url: linkedinUrl || null,
                    github_url: githubUrl || null,
                    profile_completed: true,
                    terms_accepted: true,
                    terms_accepted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.userId);

            if (fallbackUpdate.error) {
                console.error('[CompleteProfile] Fallback update failed:', fallbackUpdate.error);
                return NextResponse.json({ success: false, message: 'Failed to update profile data: ' + fallbackUpdate.error.message }, { status: 500 });
            }
        }

        // 2. Refresh the JWT Session and Cookie
        await createSession({
            ...session,
            profileCompleted: true,
            termsAccepted: true
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Profile completed successfully!' 
        });

    } catch (err: unknown) {
        console.error('CompleteProfile error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong.';
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}



