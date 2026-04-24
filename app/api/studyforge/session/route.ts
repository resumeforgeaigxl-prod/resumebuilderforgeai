export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';
import { generateContentGemini } from '@/lib/gemini-service';
interface StudyDocument {
    id: string;
    name: string;
    extracted_text?: string;
    text_content?: string;
    text_chunks?: string[];
    file_type: string;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { documentId, type, query } = body;

        const supabase = createAdminClient();
        const userId = session.userId;

        // Verify ownership and fetch pre-processed text
        const { data: docRaw, error: docError } = await supabase
            .from('study_documents')
            .select('id, name, extracted_text, text_content, text_chunks, file_type')
            .eq('id', documentId)
            .eq('user_id', userId)
            .single();

        if (docError || !docRaw) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

        const doc = docRaw as unknown as StudyDocument;

        // Use pre-processed text or chunks
        let extractedText = doc.extracted_text || '';
        const chunks = Array.isArray(doc.text_chunks) ? doc.text_chunks : [];

        // If for some reason text is missing in the new fields, fallback to text_content (legacy)
        if (!extractedText && doc.text_content) {
            extractedText = doc.text_content;
        }


        if (!extractedText || extractedText.length < 10) {
            return NextResponse.json(
                { error: 'Document is still being processed or no text was found. Please try again or upload a different file.' },
                { status: 422 }
            );
        }

        // Strategy: For summary/notes/quiz, use the first ~30k chars (most likely to have key info)
        // For 'Ask' (chat), in a real SaaS we'd use vector search, 
        // but here we will combine chunks up to token limits for a robust baseline.
        const contextText = chunks.length > 0
            ? chunks.slice(0, 15).join('\n\n') // Combine first 15 chunks (~18k chars)
            : extractedText.substring(0, 30000);

        let prompt = '';
        const systemPrompt = "You are StudyForge AI, an expert academic assistant. Use the following document text to help the user.";

        switch (type) {
            case 'Summary':
                prompt = `Summarize the following document concisely in bullet points. Document: ${doc.name}\n\nContent: ${contextText}`;
                break;
            case 'Explain':
                prompt = `Explain the main concepts in the following document as if I were a beginner. Document: ${doc.name}\n\nContent: ${contextText}`;
                break;
            case 'Notes':
                prompt = `Generate detailed study notes for the following document. Use headers and clear structure. Document: ${doc.name}\n\nContent: ${contextText}`;
                break;
            case 'Quiz':
                prompt = `Generate a 5-question multiple choice quiz based on the following document. Include answers at the end. Document: ${doc.name}\n\nContent: ${contextText}`;
                break;
            case 'Ask':
                prompt = `Answer the following user question based on the document. \nQuestion: ${query}\n\nDocument: ${doc.name}\nContent: ${contextText}`;
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



