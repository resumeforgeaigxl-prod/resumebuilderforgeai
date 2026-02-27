import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { requireAdmin, logAdminAction } from '@/lib/admin-guard';

export const runtime = 'nodejs';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const guard = await requireAdmin(supabase);
    if (guard) return guard;

    const session = await getSession();
    const { id: userId } = params;

    const body = await request.json();
    const { field, value } = body as { field: 'is_free_override' | 'free_unlimited'; value: boolean };

    if (!['is_free_override', 'free_unlimited'].includes(field)) {
        return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('users')
        .update({ [field]: value })
        .eq('id', userId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction(supabase, session!.userId, `set_${field}`, userId, { value });
    return NextResponse.json({ success: true, field, value });
}
