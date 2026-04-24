export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { ingestJobs } from '@/lib/jobs/ingestion-service';
import { fetchJSearch } from '@/lib/jobs/sources/jsearch';
import { fetchAdzuna } from '@/lib/jobs/sources/adzuna';
import { fetchApify } from '@/lib/jobs/sources/apify';
import { fetchJobForgeCollector } from '@/lib/jobs/sources/jobforgecollector';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sourceParam = searchParams.get('source'); // jsearch | adzuna | apify | jobforgecollector | all

        // Auth check (Vercel Cron or manual admin trigger)
        const authHeader = req.headers.get('authorization');
        const isSecretMatch = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
        
        // Protect in production — allow Vercel Cron or manual triggers if secret matches
        if (process.env.NODE_ENV === 'production' && !isSecretMatch && !sourceParam) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const summary: Record<string, unknown> = {};

        if (!sourceParam || sourceParam === 'all' || sourceParam === 'jsearch') {
            const jobs = await fetchJSearch();
            const result = await ingestJobs(jobs);
            summary.jsearch = result;
        }

        if (!sourceParam || sourceParam === 'all' || sourceParam === 'adzuna') {
            const jobs = await fetchAdzuna();
            const result = await ingestJobs(jobs);
            summary.adzuna = result;
        }

        if (sourceParam === 'apify' || sourceParam === 'all') {
             const url = searchParams.get('url') || undefined;
             const jobs = await fetchApify(url);
             const result = await ingestJobs(jobs);
             summary.apify = result;
        }

        if (sourceParam === 'jobforgecollector') {
            const jobs = await fetchJobForgeCollector();
            const result = await ingestJobs(jobs);
            summary.jobforgecollector = result;
        }

        return NextResponse.json({
            success: true,
            summary
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[JobFetchAPI] Handler Error:', error);
        return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
    }
}

