export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const { data: chats, error } = await supabase
            .from('mentor_chats')
            .select('role, content')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ history: chats || [] });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[MentorForge] History Error:', msg);
        return NextResponse.json({ error: 'Failed to retrieve history' }, { status: 500 });
    }
}

