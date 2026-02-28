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
        const { data: portfolios, error } = await supabase
            .from('portfolios')
            .select(`
                id, username, is_public, theme, created_at,
                user_id,
                users ( email )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = portfolios.map((r: any) => ({
            id: r.id,
            username: r.username,
            theme: r.theme,
            is_public: r.is_public,
            created_at: r.created_at,
            user_email: (Array.isArray(r.users) ? r.users[0]?.email : r.users?.email) || 'Unknown'
        }));

        return NextResponse.json({ success: true, portfolios: formatted });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
