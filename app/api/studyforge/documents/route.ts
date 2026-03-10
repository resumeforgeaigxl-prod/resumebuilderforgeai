import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createAdminClient();
        const userId = session.userId;

        const { data, error } = await supabase
            .from('study_documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ documents: data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch documents';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
