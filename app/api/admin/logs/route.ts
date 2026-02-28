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
        const { data: logs, error } = await supabase
            .from('admin_logs')
            .select(`
                id, action, target_id, metadata, created_at,
                admin_id,
                users ( email )
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = logs.map((l: any) => ({
            id: l.id,
            action: l.action,
            target_id: l.target_id,
            metadata: l.metadata,
            created_at: l.created_at,
            admin_email: (Array.isArray(l.users) ? l.users[0]?.email : l.users?.email) || 'Unknown Admin'
        }));

        return NextResponse.json({ success: true, logs: formatted });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
