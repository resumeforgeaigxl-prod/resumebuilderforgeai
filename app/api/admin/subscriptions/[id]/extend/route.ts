export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { addDays } from 'date-fns';

export const runtime = 'nodejs';
export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const daysToAdd = body.days || 30;

        // Fetch current subscription
        const { data: sub } = await supabase.from('subscriptions').select('expires_at, user_id').eq('id', params.id).single();
        if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const baseDate = sub.expires_at ? new Date(sub.expires_at) : new Date();
        const newExpiry = addDays(baseDate, daysToAdd).toISOString();

        await supabase.from('admin_logs').insert({
            admin_id: session.userId,
            action: 'extend_subscription',
            target_id: params.id,
            metadata: { daysAdded: daysToAdd, newExpiry, userId: sub.user_id }
        });

        // Update subscriptions table
        const { error } = await supabase
            .from('subscriptions')
            .update({ expires_at: newExpiry, status: 'active' })
            .eq('id', params.id);

        if (error) throw error;

        // Sync to users table for redundant access checks
        if (sub.user_id) {
            await supabase.from('users').update({
                access_expires_at: newExpiry,
                plan_end: newExpiry,
                plan: 'pro' // ensure they have pro flag
            }).eq('id', sub.user_id);
        }

        return NextResponse.json({ success: true, message: `Extended by ${daysToAdd} days` });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
