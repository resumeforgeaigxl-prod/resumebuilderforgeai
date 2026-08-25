export const dynamic = 'force-dynamic';
export const maxDuration = 60;
import { NextResponse } from 'next/server';
import { ingestJobs } from '@/lib/jobs/ingestion-service';
import { fetchJobForgeCollector } from '@/lib/jobs/sources/jobforgecollector';
import { getSession } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limitParam = parseInt(searchParams.get('limit') || '20');

        // Check authentication: allow if valid CRON_SECRET or if caller has admin session
        const session = await getSession();
        const isAdmin = session && session.role === 'admin';
        const authHeader = req.headers.get('authorization');
        const isSecretMatch = Boolean(process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`);

        if (process.env.NODE_ENV === 'production' && !isSecretMatch && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
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

