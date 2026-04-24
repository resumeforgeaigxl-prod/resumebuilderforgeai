export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { name, content } = await req.json();

        if (!name || !content) {
            return NextResponse.json({ error: 'Data missing' }, { status: 400 });
        }

        const supabase = createClient();

        // Register a "virtual document" in the DB
        const { data: doc, error } = await supabase
            .from('study_documents')
            .insert({
                user_id: session.userId,
                name: `[Knowledge] ${name}`,
                file_type: 'text/knowledge',
                file_path: 'virtual_context', // Marker for virtual content
                content_extracted: content,
                is_virtual: true
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, document: doc });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[StudyForge] Virtual Upload Error:', msg);
        return NextResponse.json({ error: 'Neural link failed' }, { status: 500 });
    }
}


