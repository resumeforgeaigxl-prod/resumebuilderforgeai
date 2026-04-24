export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { logJobApplied } from '@/lib/admin-logger';
import { getSession } from '@/lib/auth/jwt';

/**
 * Track when a user clicks "Apply Now" on a job.
 * POST /api/jobs/track-apply
 * Body: { job_id, job_title, company, apply_url }
 */
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            // Don't block the user — just skip tracking
            return NextResponse.json({ success: true, tracked: false });
        }

        const { job_id, job_title, company, apply_url } = await req.json();

        // Fire-and-forget — uses the centralised logger with audit_log too
        logJobApplied({
            userId: session.userId,
            jobId: job_id || undefined,
            jobTitle: job_title || '',
            company: company || '',
            applyUrl: apply_url || ''
        });

        return NextResponse.json({ success: true, tracked: true });

    } catch (error: unknown) {
        console.error('[Track Apply] Error:', error);
        // Silently fail — never block user from applying
        return NextResponse.json({ success: true, tracked: false });
    }
}


