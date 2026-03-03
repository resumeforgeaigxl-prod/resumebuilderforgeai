import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Fetch job listings with optional section filtering.
 * ?section=mnc | remote | latest | fresher (default: latest)
 *
 * Users always read from the database — never hit external APIs.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const section = searchParams.get('section') || 'latest';

        const supabase = createClient();

        let query = supabase
            .from('jobs')
            .select('*')
            .order('posted_at', { ascending: false })
            .limit(30);

        switch (section) {
            case 'mnc':
                query = query.eq('is_mnc', true);
                break;
            case 'remote':
                query = query.ilike('location', '%remote%');
                break;
            case 'fresher':
                // Fresher/intern jobs: use level column first, fallback via title keyword
                query = query.eq('level', 'fresher');
                break;
            // 'latest' — no additional filter, all jobs ordered by date
        }

        const { data, error } = await query;

        if (error) {
            console.error('[API] Jobs List Error:', error);
            return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
        }

        return NextResponse.json({ success: true, jobs: data || [] });

    } catch (error: unknown) {
        console.error('[API] Jobs List Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
