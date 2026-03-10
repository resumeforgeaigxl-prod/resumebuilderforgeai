import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';
import mammoth from 'mammoth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file uploaded or invalid file format' }, { status: 400 });
        }

        const lowerName = file.name.toLowerCase();
        const inferredType =
            lowerName.endsWith('.pdf')
                ? 'application/pdf'
                : lowerName.endsWith('.docx')
                    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    : lowerName.endsWith('.txt')
                        ? 'text/plain'
                        : '';
        const resolvedFileType = file.type || inferredType;
        const maxBytes = 4 * 1024 * 1024;

        if (file.size > maxBytes) {
            return NextResponse.json({ error: 'File too large (Max 4 MB).' }, { status: 413 });
        }

        const supabase = createAdminClient();
        const userId = session.userId;

        // 1. Upload to Supabase Storage
        const fileName = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('study-documents')
            .upload(fileName, buffer, {
                contentType: resolvedFileType || 'application/octet-stream',
                upsert: false
            });

        if (uploadError || !uploadData) {
            console.error('[StudyForge] Storage upload failed:', uploadError);
            return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
        }

        // 2. Extract Text Pipeline
        let textContent = '';
        let textChunks: string[] = [];
        let pdfType: string = 'text';

        try {
            if (resolvedFileType === 'application/pdf' || lowerName.endsWith('.pdf')) {
                // Use the new Python PDF Extraction Service
                const { extractTextFromPdf } = await import('@/lib/pdf-service');
                textContent = await extractTextFromPdf(buffer, file.name);

                // Simple chunking for StudyForge (approx 1200 chars as before)
                textChunks = [];
                for (let i = 0; i < textContent.length; i += 1200) {
                    textChunks.push(textContent.slice(i, i + 1200));
                }
                pdfType = 'fitz-extracted'; // Special marker for Python service success
            } else if (resolvedFileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lowerName.endsWith('.docx')) {
                const result = await mammoth.extractRawText({ buffer });
                textContent = result.value;
                textContent = textContent.replace(/\r\n/g, '\n').trim();
                textChunks = [textContent.slice(0, 1200)]; // Simple chunking fallback
            } else {
                textContent = buffer.toString('utf-8');
                textChunks = [textContent.slice(0, 1200)];
            }
        } catch (extError) {
            console.error('[StudyForge] Extraction logic error:', extError);
            return NextResponse.json({ error: 'Processing error during text extraction' }, { status: 500 });
        }

        // 3. Store in Database
        const { data: docData, error: dbError } = await supabase
            .from('study_documents')
            .insert({
                user_id: userId,
                name: file.name,
                file_path: uploadData.path,
                file_url: uploadData.path,
                file_type: resolvedFileType,
                text_content: textContent,
                extracted_text: textContent,
                text_chunks: textChunks,
                pdf_type: pdfType
            })
            .select()
            .single();

        if (dbError || !docData) {
            console.error('[StudyForge] Database error:', dbError);
            return NextResponse.json({ error: 'Failed to record document in database' }, { status: 500 });
        }

        return NextResponse.json({ success: true, document: docData });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[StudyForge] Upload route error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
