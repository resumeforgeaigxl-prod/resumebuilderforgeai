import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        
        // Check if admin
        const { data: user } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: users, error } = await supabase
            .from('waitlist_users')
            .select('*')
            .order('position', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ users });

    } catch (error) {
        console.error('[Admin Waitlist API] GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
    }
}
