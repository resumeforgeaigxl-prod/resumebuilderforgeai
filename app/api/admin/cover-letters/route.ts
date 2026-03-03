import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const [totalRes, recentRes] = await Promise.all([
            supabase.from('cover_letters').select('id', { count: 'exact', head: true }),
            supabase
                .from('cover_letters')
                .select('id, user_id, role_title, company_name, word_count, created_at')
                .order('created_at', { ascending: false })
                .limit(50)
        ]);

        return NextResponse.json({
            success: true,
            total: totalRes.count ?? 0,
            coverLetters: recentRes.data || []
        });

    } catch (error: unknown) {
        console.error('[Admin Cover Letters]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
