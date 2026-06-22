export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
    const supabase = createClient();

    const guard = await requireAdmin(supabase);
    if (guard) return guard;

    const admin = createAdminClient();

    // Fetch all profiles with user metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profiles, error } = await (admin as any)
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Attach resume count per user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resumeCounts } = await (admin as any)
        .from('resumes')
        .select('user_id');

    const countMap: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (resumeCounts ?? []).forEach((r: any) => {
        countMap[r.user_id] = (countMap[r.user_id] ?? 0) + 1;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = (profiles ?? []).map((p: any) => ({
        ...p,
        resume_count: countMap[p.id] ?? 0,
    }));

    return NextResponse.json({ success: true, users: enriched });
}

