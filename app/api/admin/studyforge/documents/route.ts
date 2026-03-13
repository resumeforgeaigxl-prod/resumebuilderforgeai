import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();

        // Fetch all documents joined with user info
        const { data, error } = await supabase
            .from('study_documents')
            .select(`
                id,
                name,
                file_type,
                file_path,
                created_at,
                user_id,
                users (
                    email,
                    full_name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ documents: data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Fetch failed';
        console.error('[Admin StudyForge Docs Fetch Error]', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
