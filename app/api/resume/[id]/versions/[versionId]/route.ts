export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET: Fetch a specific version's full data payload
export async function GET(_request: Request, { params }: { params: { id: string; versionId: string } }) {
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

        if (!ownership) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

        // 2. Fetch specific Version
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: version } = await (supabase as any)
            .from('resume_versions')
            .select('data, version_number')
            .eq('id', params.versionId)
            .eq('resume_id', params.id)
            .single();

        if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

        return NextResponse.json({ success: true, version });

    } catch (e) {
        console.error('[Get Specific Version]', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
