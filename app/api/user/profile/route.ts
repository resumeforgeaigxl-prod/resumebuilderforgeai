export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

/**
 * GET /api/user/profile — Returns the current user's name and email
 * Used by the support page to pre-fill form fields.
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();
        let user: any = null;
        const firstTry = await supabase
            .from('users')
            .select('email, full_name, role, phone_number, linkedin_url, github_url, professional_summary, education, skills, experience_level, referral_source, portfolio_url, target_role, preferred_work_mode, plan_type')
            .eq('id', session.userId)
            .single();

        if (firstTry.error) {
            console.warn('[user/profile] New columns missing, falling back to legacy columns...', firstTry.error.message);
            const fallbackQuery = await supabase
                .from('users')
                .select('email, full_name, role, phone_number, linkedin_url, github_url, referral_source, plan_type')
                .eq('id', session.userId)
                .single();

            if (fallbackQuery.error) {
                return NextResponse.json({ error: fallbackQuery.error.message }, { status: 500 });
            }
            user = fallbackQuery.data;
        } else {
            user = firstTry.data;
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: session.userId,
                role: user.role,
                email: user.email ?? null,
                full_name: user.full_name ?? null,
                phone_number: user.phone_number ?? null,
                linkedin_url: user.linkedin_url ?? null,
                github_url: user.github_url ?? null,
                professional_summary: user.professional_summary ?? null,
                education: user.education ?? null,
                skills: user.skills ?? null,
                experience_level: user.experience_level ?? null,
                referral_source: user.referral_source ?? null,
                portfolio_url: user.portfolio_url ?? null,
                target_role: user.target_role ?? null,
                preferred_work_mode: user.preferred_work_mode ?? null,
                plan_type: user.plan_type ?? 'FREE',
            }
        });
    } catch (err) {
        console.error('[user/profile] Error:', err);
        return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
    }
}

