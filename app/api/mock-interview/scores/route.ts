export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'; // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();
        const { data, error } = await supabase
            .from('interview_scores')
            .select('*')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('[Scores API] Error:', error);
            return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
        }

        return NextResponse.json({ success: true, scores: data });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


