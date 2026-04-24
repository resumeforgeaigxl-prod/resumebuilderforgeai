export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

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

        await supabase.from('admin_logs').insert({
            admin_id: session.userId,
            action: 'toggle_portfolio_visibility',
            target_id: params.id,
            metadata: { is_public: body.is_public }
        });

        const { error } = await supabase
            .from('portfolios')
            .update({ is_public: body.is_public })
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: unknown) { const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
