export const dynamic = 'force-dynamic';
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
            .select('name, file_path, file_type')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (docError || !document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        if (!document.file_path) {
            return NextResponse.json({ error: 'Document file path is missing' }, { status: 400 });
        }

        const { data: fileBlob, error: fileError } = await supabase.storage
            .from('study-documents')
            .download(document.file_path);

        if (fileError || !fileBlob) {
            console.error('[StudyForge] File download failed:', fileError);
            return NextResponse.json({ error: 'Unable to load file from storage' }, { status: 404 });
        }

        const fileArrayBuffer = await fileBlob.arrayBuffer();
        const safeFileName = (document.name || 'study-document')
            .replace(/"/g, '')
            .replace(/[^\w.\- ]+/g, '_');

        return new NextResponse(fileArrayBuffer, {
            headers: {
                'Content-Type': document.file_type || fileBlob.type || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${safeFileName}"`,
                'Cache-Control': 'private, no-store, max-age=0',
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch file';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
