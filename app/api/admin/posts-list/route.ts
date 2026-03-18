import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createAdminClient();
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, posts });
    } catch (e: unknown) {
        console.error('[Admin Posts List] Error:', e);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
