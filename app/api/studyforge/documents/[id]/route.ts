import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    void request;
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createAdminClient();
        const userId = session.userId;
        const id = params.id;

        const { data: document, error: docError } = await supabase
            .from('study_documents')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (docError) throw docError;

        const { data: sessions, error: sessionError } = await supabase
            .from('study_ai_sessions')
            .select('*')
            .eq('document_id', id)
            .order('created_at', { ascending: false });

        if (sessionError) throw sessionError;

        return NextResponse.json({ document, sessions: sessions || [] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch document';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    void request;
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createAdminClient();
        const userId = session.userId;
        const id = params.id;

        const { error } = await supabase
            .from('study_documents')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to delete document';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
