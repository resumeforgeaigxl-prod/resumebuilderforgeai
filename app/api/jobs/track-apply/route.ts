export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { logJobApplied } from '@/lib/admin-logger';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

/**
 * Track when a user clicks "Apply Manually" on a job or confirms they submitted an application.
 * POST /api/jobs/track-apply
 * Body: { job_id, job_title, company, apply_url, mark_applied?: boolean, status?: string }
 */
export async function POST(req: Request) {
    try {
        const session = await getSession();
        const body = await req.json();
        const { job_id, job_title, company, apply_url, mark_applied, status = 'applied' } = body;

        // Anonymous tracking: log or capture without blocking
        if (!session?.userId) {
            return NextResponse.json({ success: true, tracked: false, anonymous: true });
        }

        // 1. Audit logger
        try {
            logJobApplied({
                userId: session.userId,
                jobId: job_id || undefined,
                jobTitle: job_title || '',
                company: company || '',
                applyUrl: apply_url || '',
            });
        } catch {
            // Non-blocking
        }

        // 2. If user confirmed "Yes, I applied", record in public.job_applications
        if (mark_applied && job_id) {
            try {
                const supabase = await createClient();
                const now = new Date().toISOString();

                // Check for existing tracking record
                const { data: existing } = await (supabase as any)
                    .from('job_applications')
                    .select('id')
                    .eq('user_id', session.userId)
                    .eq('job_id', job_id)
                    .maybeSingle();

                if (existing) {
                    await (supabase as any)
                        .from('job_applications')
                        .update({
                            status,
                            application_method: 'MANUAL',
                            updated_at: now,
                        })
                        .eq('id', existing.id);
                } else {
                    await (supabase as any)
                        .from('job_applications')
                        .insert({
                            user_id: session.userId,
                            job_id,
                            company: company || '',
                            role_title: job_title || '',
                            status,
                            application_method: 'MANUAL',
                            applied_date: now,
                            created_at: now,
                            updated_at: now,
                        });
                }
            } catch (dbErr: any) {
                console.warn('[Track Apply] DB record creation skipped/failed:', dbErr.message);
            }
        }

        return NextResponse.json({ success: true, tracked: true });
    } catch (error: unknown) {
        console.error('[Track Apply] Error:', error);
        // Silently fail — never block user from applying
        return NextResponse.json({ success: true, tracked: false });
    }
}
