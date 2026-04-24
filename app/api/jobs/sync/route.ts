export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { ingestJobs } from '@/lib/jobs/ingestion-service';
import { fetchJobForgeCollector } from '@/lib/jobs/sources/jobforgecollector';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const isSecretMatch = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
        
        // Allow in development or if secret matches
        if (process.env.NODE_ENV === 'production' && !isSecretMatch) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const summary: Record<string, unknown> = {};
        console.log('[JobSyncAPI] Starting global unified sync (via JobForgeCollector)...');

        // fetchJobForgeCollector now integrates searches + all external APIs (JSearch, Adzuna, etc.)
        const jobs = await fetchJobForgeCollector(200);
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

