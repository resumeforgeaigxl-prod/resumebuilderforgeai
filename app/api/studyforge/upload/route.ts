import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

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
        const allowedTypes = new Set([
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ]);
        const maxBytes = 4 * 1024 * 1024;

        if (!allowedTypes.has(file.type) && !lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx') && !lowerName.endsWith('.txt')) {
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
                contentType: file.type,
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
            if (file.type === 'application/pdf') {
                console.log('[StudyForge] Extracting text from PDF...');
                const parser = new PDFParse({ data: buffer });
                try {
                    const data = await parser.getText();
                    textContent = data.text;
                } finally {
                    await parser.destroy();
                }
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lowerName.endsWith('.docx')) {
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
                file_type: file.type,
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
