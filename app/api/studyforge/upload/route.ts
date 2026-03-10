import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';
import mammoth from 'mammoth';
import { extractPdfTextWithFallback } from '@/lib/studyforge/pdf-extraction';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file || !(file instanceof File)) {
            console.error('[StudyForge] No valid file in request');
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
        const allowedTypes = new Set([
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ]);
        const maxBytes = 4 * 1024 * 1024;

        if (!allowedTypes.has(resolvedFileType) && !lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx') && !lowerName.endsWith('.txt')) {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' },
                { status: 400 }
            );
        }

        if (file.size > maxBytes) {
            return NextResponse.json(
                { error: 'File too large. Please upload a file up to 4 MB.' },
                { status: 413 }
            );
        }

        console.log(`[StudyForge] Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

        const supabase = createAdminClient();
        const userId = session.userId;

        // 1. Upload to Supabase Storage
        const fileName = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        console.log(`[StudyForge] Uploading to bucket: study-documents as ${fileName}`);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('study-documents')
            .upload(fileName, buffer, {
                contentType: resolvedFileType || 'application/octet-stream',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('[StudyForge] Storage upload failed:', uploadError);
            throw uploadError;
        }

        console.log('[StudyForge] Storage upload successful:', uploadData.path);

        // 2. Extract Text
        let textContent = '';
        try {
            if (resolvedFileType === 'application/pdf' || lowerName.endsWith('.pdf')) {
                console.log('[StudyForge] Running PDF text extraction (step 1: pdf-parse)...');
                const pdfResult = await extractPdfTextWithFallback(buffer, {
                    enableOcrFallback: false,
                });
                textContent = pdfResult.text;
                console.log(`[StudyForge] PDF extraction method: ${pdfResult.method} | chars: ${textContent.length}`);
            } else if (resolvedFileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lowerName.endsWith('.docx')) {
                console.log('[StudyForge] Extracting text from DOCX...');
                const result = await mammoth.extractRawText({ buffer });
                textContent = result.value;
            } else {
                console.log('[StudyForge] Extracting text from plain text/other...');
                textContent = buffer.toString('utf-8');
            }
            console.log(`[StudyForge] Extraction successful. Text length: ${textContent.length}`);
        } catch (extError) {
            console.warn('[StudyForge] Text extraction failed, continuing with empty text:', extError);
        }

        // 3. Store in Database
        console.log('[StudyForge] Saving to database...');
        const { data: docData, error: dbError } = await supabase
            .from('study_documents')
            .insert({
                user_id: userId,
                name: file.name,
                file_path: uploadData.path,
                file_type: resolvedFileType,
                text_content: textContent
            })
            .select()
            .single();

        if (dbError) {
            console.error('[StudyForge] Database insert failed:', dbError);
            throw dbError;
        }

        console.log('[StudyForge] Document successfully created:', docData.id);
        return NextResponse.json({ success: true, document: docData });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        console.error('[StudyForge] Global Upload Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
