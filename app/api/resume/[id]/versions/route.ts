import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Config: Max versions to keep per resume
const MAX_VERSIONS = 10;

// GET: List all versions for a resume
export async function GET(_request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();

        // 1. Verify Ownership
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ownership } = await (supabase as any)
            .from('resumes')
            .select('id')
            .eq('id', params.id)
            .eq('user_id', session.userId)
            .single();

        if (!ownership) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // 2. Fetch Versions (No full data footprint, just metadata)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: versions } = await (supabase as any)
            .from('resume_versions')
            .select('id, version_number, created_at')
            .eq('resume_id', params.id)
            .order('version_number', { ascending: false });

        return NextResponse.json({ success: true, versions: versions || [] });

    } catch (e) {
        console.error('[Get Versions]', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// POST: Auto-save a new version snapshot
export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: resumeData } = await request.json();
        if (!resumeData) return NextResponse.json({ error: 'No data provided' }, { status: 400 });

        const supabase = createClient();

        // 1. Verify Ownership
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ownership } = await (supabase as any)
            .from('resumes')
            .select('id')
            .eq('id', params.id)
            .eq('user_id', session.userId)
            .single();

        if (!ownership) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // 2. Determine Next Version Number
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: maxVers } = await (supabase as any)
            .from('resume_versions')
            .select('version_number')
            .eq('resume_id', params.id)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();

        const vNum = maxVers ? maxVers.version_number + 1 : 1;

        // 3. Insert Version
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('resume_versions')
            .insert({
                resume_id: params.id,
                version_number: vNum,
                data: resumeData
            });

        if (error) throw error;

        // 4. Cleanup old versions if > MAX_VERSIONS
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: oldVersions } = await (supabase as any)
            .from('resume_versions')
            .select('id')
            .eq('resume_id', params.id)
            .order('version_number', { ascending: false })
            .range(MAX_VERSIONS, 1000); // anything beyond top N

        if (oldVersions && oldVersions.length > 0) {
            const idsToDelete = oldVersions.map((v: any) => v.id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('resume_versions').delete().in('id', idsToDelete);
        }

        return NextResponse.json({ success: true, versionSaved: vNum });

    } catch (e) {
        console.error('[Save Version]', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
