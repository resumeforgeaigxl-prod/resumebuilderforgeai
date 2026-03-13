import { NextResponse } from 'next/server';
import { ingestJobs } from '@/lib/jobs/ingestion-service';
import { fetchJSearch } from '@/lib/jobs/sources/jsearch';
import { fetchAdzuna } from '@/lib/jobs/sources/adzuna';
import { fetchApify } from '@/lib/jobs/sources/apify';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const isSecretMatch = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
        
        // Allow in development or if secret matches
        if (process.env.NODE_ENV === 'production' && !isSecretMatch) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const summary: Record<string, unknown> = {};

        // 1. JSearch
        const jJobs = await fetchJSearch();
        summary.jsearch = await ingestJobs(jJobs);

        // 2. Adzuna
        const aJobs = await fetchAdzuna();
        summary.adzuna = await ingestJobs(aJobs);

        // 3. Apify
        const apJobs = await fetchApify();
        summary.apify = await ingestJobs(apJobs);

        return NextResponse.json({
            success: true,
            message: 'Daily sync completed',
            summary
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[JobSyncAPI] Error:', error);
        return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
    }
}
