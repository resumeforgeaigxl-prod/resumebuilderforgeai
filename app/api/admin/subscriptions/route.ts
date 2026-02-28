import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select(`
                id, plan, status, expires_at, created_at, coupon_code,
                user_id,
                users ( email )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = subscriptions.map((s: any) => ({
            id: s.id,
            plan: s.plan,
            status: s.status,
            expires_at: s.expires_at,
            created_at: s.created_at,
            coupon_code: s.coupon_code,
            user_email: (Array.isArray(s.users) ? s.users[0]?.email : s.users?.email) || 'Unknown'
        }));

        return NextResponse.json({ success: true, subscriptions: formatted });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
