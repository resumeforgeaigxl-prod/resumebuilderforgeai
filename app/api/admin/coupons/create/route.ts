import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();

        await supabase.from('admin_logs').insert({
            admin_id: session.userId,
            action: 'create_coupon',
            metadata: { code: body.code, type: body.type, val: body.value, max_uses: body.max_uses, expires: body.expires_at }
        });

        const { error } = await supabase.from('coupons').insert({
            code: body.code.toUpperCase(),
            type: body.type, // 'percentage', 'fixed', 'free_months'
            value: body.value,
            max_uses: body.max_uses || null,
            expires_at: body.expires_at || null,
            is_active: true
        });

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Coupon created' });
    } catch (error: unknown) { const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
