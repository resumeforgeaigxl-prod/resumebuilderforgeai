import { NextResponse } from 'next/server';
import { ingestJobs } from '@/lib/jobs/ingestion-service';
import { fetchJobForgeCollector } from '@/lib/jobs/sources/jobforgecollector';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limitParam = parseInt(searchParams.get('limit') || '20');

        // Manual triggers from admin might not have bearer token but will have session
        // For CLI or Cron, we expect the secret
        
        const jobs = await fetchJobForgeCollector(limitParam);
        const result = await ingestJobs(jobs);

        return NextResponse.json({
            success: true,
            source: 'jobforgecollector',
            stats: result
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[JobCollectorAPI] Error:', error);
        return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
    }
}
