import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, logAdminAction } from '@/lib/admin-guard';
import { getSession } from '@/lib/auth/jwt';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();

    const guard = await requireAdmin(supabase);
    if (guard) return guard;

    const session = await getSession();
    const { id: userId } = params;

    // Get current state
    const { data: target } = await supabase
        .from('users')
        .select('is_blocked, email')
        .eq('id', userId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as { data: any };

    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const newBlockedState = !target.is_blocked;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('users')
        .update({ is_blocked: newBlockedState })
        .eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAdminAction(supabase, session!.userId, newBlockedState ? 'block_user' : 'unblock_user', userId, { email: target.email });

    return NextResponse.json({ success: true, is_blocked: newBlockedState });
}
