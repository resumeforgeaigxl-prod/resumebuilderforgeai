import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { addDays } from 'date-fns';

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
        const { data: sub } = await supabase.from('subscriptions').select('expires_at').eq('id', params.id).single();
        if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const baseDate = sub.expires_at ? new Date(sub.expires_at) : new Date();
        const newExpiry = addDays(baseDate, daysToAdd).toISOString();

        await supabase.from('admin_logs').insert({
            admin_id: session.userId,
            action: 'extend_subscription',
            target_id: params.id,
            metadata: { daysAdded: daysToAdd, newExpiry }
        });

        const { error } = await supabase
            .from('subscriptions')
            .update({ expires_at: newExpiry, status: 'active' })
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: `Extended by ${daysToAdd} days` });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
