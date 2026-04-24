export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify if user is recruiter or admin
        const admin = createAdminClient();
        const { data: user } = await admin.from('users').select('role').eq('id', session.userId).single();
        if (user?.role !== 'admin' && user?.role !== 'recruiter') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { query, filters } = body;

        // Basic search logic: find resumes matching query in title or content
        // In a real app, uses pg_trgm or full-text search
        let dbQuery = admin
            .from('resumes')
            .select('id, title, updated_at, content, users(full_name, email, profile_image)')
            .order('updated_at', { ascending: false });

        if (query) {
            dbQuery = dbQuery.ilike('title', `%${query}%`);
        }

        if (filters) {
            if (filters.experience && filters.experience.length > 0) {
                // Approximate filtering using text representation of content
                const expTerm = filters.experience[0].split(' ')[0]; // E.g., "Entry", "Junior", "Mid-Level", "Senior"
                dbQuery = dbQuery.ilike('content::text', `%${expTerm}%`);
            }
            if (filters.jobType && filters.jobType.length > 0) {
                const typeTerm = filters.jobType[0]; // E.g., "Full-time", "Remote"
                dbQuery = dbQuery.ilike('content::text', `%${typeTerm}%`);
            }
        }

        const { data, error } = await dbQuery.limit(20);

        if (error) {
            console.error('[Recruiter Search] Error:', error);
            return NextResponse.json({ error: 'Search failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, candidates: data });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


