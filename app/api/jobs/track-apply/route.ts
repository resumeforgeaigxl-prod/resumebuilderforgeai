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

        // 2. If user confirmed "Yes, I applied", record via Canonical ApplicationTrackerService (Level 15)
        if (mark_applied && job_id) {
            try {
                const { ApplicationTrackerService } = await import('@/lib/application-tracker');
                const now = new Date().toISOString();

                const app = await ApplicationTrackerService.createOrGetApplication({
                    userId: session.userId,
                    jobId: job_id,
                    companyName: company || 'Company',
                    roleTitle: job_title || 'Position',
                    submissionMethod: 'MANUAL',
                    jobSnapshot: {
                        jobId: job_id,
                        title: job_title || 'Position',
                        companyName: company || 'Company',
                        applyUrl: apply_url,
                        capturedAt: now,
                    },
                });

                await ApplicationTrackerService.updateUserReportedStatus({
                    userId: session.userId,
                    applicationId: app.id,
                    nextStatus: 'APPLIED',
                    notes: 'Candidate marked applied manually from public job posting.',
                    attestationText: `Applied directly on employer portal: ${apply_url || 'external job link'}`,
                });
            } catch (dbErr: any) {
                console.warn('[Track Apply] Canonical tracker record skipped/failed:', dbErr.message);
            }
        }

        return NextResponse.json({ success: true, tracked: true });
    } catch (error: unknown) {
        console.error('[Track Apply] Error:', error);
        // Silently fail — never block user from applying
        return NextResponse.json({ success: true, tracked: false });
    }
}
