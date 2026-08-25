export const dynamic = 'force-dynamic';
export const maxDuration = 60;
import { NextResponse } from 'next/server';
import { ingestJobs } from '@/lib/jobs/ingestion-service';
import { fetchJobForgeCollector } from '@/lib/jobs/sources/jobforgecollector';
import { getSession } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const isSecretMatch = Boolean(process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`);
        
        // Also allow authenticated admin users
        const session = await getSession();
        const isAdmin = session && session.role === 'admin';

        if (process.env.NODE_ENV === 'production' && !isSecretMatch && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const summary: Record<string, unknown> = {};
        console.log('[JobSyncAPI] Starting global unified sync (via JobForgeCollector)...');

        // fetchJobForgeCollector integrates searches + external APIs
        const jobs = await fetchJobForgeCollector(80);
        summary['unified_collector'] = await ingestJobs(jobs);

        return NextResponse.json({
            success: true,
            message: 'Global sync completed',
            summary
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[JobSyncAPI] Error:', error);
        return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
    }
}

