import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';
import { generateContentGemini } from '@/lib/gemini-service';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { documentId, type, query } = body;

        const supabase = createAdminClient();
        const userId = session.userId;

        // Verify ownership
        const { data: doc, error: docError } = await supabase
            .from('study_documents')
            .select('id, text_content, name, file_path, file_type')
            .eq('id', documentId)
            .eq('user_id', userId)
            .single();

        if (docError || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

        let extractedText = (doc.text_content || '').trim();

        // Backfill text extraction if legacy document row has empty text_content.
        if (!extractedText && doc.file_path) {
            try {
                const { data: fileBlob, error: fileError } = await supabase.storage
                    .from('study-documents')
                    .download(doc.file_path);

                if (!fileError && fileBlob) {
                    const buffer = Buffer.from(await fileBlob.arrayBuffer());

                    if (doc.file_type === 'application/pdf' || doc.file_path.toLowerCase().endsWith('.pdf')) {
                        const parser = new PDFParse({ data: buffer });
                        try {
                            const parsed = await parser.getText();
                            extractedText = (parsed.text || '').trim();
                        } finally {
                            await parser.destroy();
                        }
                    } else if (doc.file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || doc.file_path.toLowerCase().endsWith('.docx')) {
                        const result = await mammoth.extractRawText({ buffer });
                        extractedText = (result.value || '').trim();
                    } else {
                        extractedText = buffer.toString('utf-8').trim();
                    }
                }
            } catch (reExtractError) {
                console.error('[StudyForge] Re-extract text failed:', reExtractError);
            }

            if (extractedText) {
                await supabase
                    .from('study_documents')
                    .update({ text_content: extractedText })
                    .eq('id', doc.id)
                    .eq('user_id', userId);
            }
        }

        if (!extractedText) {
            return NextResponse.json(
                { error: 'Could not extract readable text from this file. Please upload a text-based PDF/DOCX/TXT.' },
                { status: 422 }
            );
        }

        let prompt = '';
        const systemPrompt = "You are StudyForge AI, an expert academic assistant. Use the following document text to help the user.";

        switch (type) {
            case 'Summary':
                prompt = `Summarize the following document concisely in bullet points. Document: ${doc.name}\n\nContent: ${extractedText.substring(0, 30000)}`;
                break;
            case 'Explain':
                prompt = `Explain the main concepts in the following document as if I were a beginner. Document: ${doc.name}\n\nContent: ${extractedText.substring(0, 30000)}`;
                break;
            case 'Notes':
                prompt = `Generate detailed study notes for the following document. Use headers and clear structure. Document: ${doc.name}\n\nContent: ${extractedText.substring(0, 30000)}`;
                break;
            case 'Quiz':
                prompt = `Generate a 5-question multiple choice quiz based on the following document. Include answers at the end. Document: ${doc.name}\n\nContent: ${extractedText.substring(0, 30000)}`;
                break;
            case 'Ask':
                prompt = `Answer the following user question based on the document. \nQuestion: ${query}\n\nDocument: ${doc.name}\nContent: ${extractedText.substring(0, 30000)}`;
                break;
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        const responseText = await generateContentGemini(prompt, systemPrompt);

        // Save session
        const { error: sError } = await supabase
            .from('study_ai_sessions')
            .insert({
                document_id: documentId,
                user_id: userId,
                query: query || type,
                response: responseText,
                session_type: type
            })
            .select()
            .single();

        if (sError) throw sError;

        return NextResponse.json({ success: true, response: responseText });
    } catch (error: unknown) {
        console.error('AI Session Error:', error);
        return NextResponse.json(
            { error: 'AI assistant is temporarily unavailable. Please try again in a few minutes.' },
            { status: 503 }
        );
    }
}
