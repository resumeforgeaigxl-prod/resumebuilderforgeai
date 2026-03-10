import { createWorker } from 'tesseract.js';

// Define extraction results
export interface PdfExtractionResult {
    text: string;
    chunks: string[];
    pdfType: 'text' | 'scanned';
    success: boolean;
}

const MIN_TEXT_LENGTH = 100;
const CHUNK_SIZE = 1200;
const MAX_OCR_PAGES = 5;

/**
 * Clean extracted text
 */
function cleanText(text: string): string {
    return (text || '')
        .replace(/\u0000/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/^\s+|\s+$/gm, '')
        .trim();
}

/**
 * Split text into chunks
 */
function chunkText(text: string, size: number): string[] {
    const chunks: string[] = [];
    if (!text) return [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size).trim());
    }
    return chunks.filter(c => c.length > 0);
}

/**
 * Universal text extraction via pdfjs-dist
 */
async function extractTextWithPdfJs(buffer: Buffer): Promise<string> {
    try {
        console.log('[StudyForge] Initializing PDF extraction...');
        const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

        const loadingTask = getDocument({
            data: new Uint8Array(buffer),
            useSystemFonts: true,
            isEvalSupported: false,
        } as any);

        const pdf = await loadingTask.promise;
        let fullText = '';

        console.log(`[StudyForge] Parsing ${pdf.numPages} pages...`);
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: any) => item.str || '')
                .join(' ');
            fullText += pageText + '\n\n';
        }

        return cleanText(fullText);
    } catch (error) {
        console.error('[StudyForge] Unified extraction error:', error);
        return '';
    }
}

/**
 * OCR Fallback logic
 */
async function extractOcrText(buffer: Buffer): Promise<string> {
    try {
        console.log('[StudyForge] Initializing OCR fallback...');
        // @ts-ignore - version 5 imports
        const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const canvasModule = await import('@napi-rs/canvas');

        const loadingTask = getDocument({
            data: new Uint8Array(buffer),
            isEvalSupported: false,
        } as any);

        const pdf = await loadingTask.promise;
        const numPages = Math.min(pdf.numPages, MAX_OCR_PAGES);
        let combinedText = '';

        const worker = await createWorker('eng');

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });

            const canvas = (canvasModule as any).createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');

            // Render parameters for v5 often require canvas context properly typed or casted
            await (page as any).render({
                canvasContext: context as any,
                viewport: viewport,
                canvas: canvas, // some versions of v5 need this
            }).promise;

            const imageBuffer = canvas.toBuffer('image/png');
            const { data: { text } } = await worker.recognize(imageBuffer);
            combinedText += text + '\n\n';
        }

        await worker.terminate();
        return cleanText(combinedText);
    } catch (error) {
        console.error('[StudyForge] OCR fatal failure:', error);
        return '';
    }
}

/**
 * Master Pipeline
 */
export async function processPdfPipeline(buffer: Buffer): Promise<PdfExtractionResult> {
    try {
        // Step 1: Attempt standard extraction first
        let text = await extractTextWithPdfJs(buffer);
        let pdfType: 'text' | 'scanned' = 'text';

        // Step 2: If failure or low content, run OCR
        if (text.length < MIN_TEXT_LENGTH) {
            console.log(`[StudyForge] Text quality low (${text.length} chars). Invoking OCR.`);
            pdfType = 'scanned';
            const ocrText = await extractOcrText(buffer);

            if (ocrText.length > text.length) {
                text = ocrText;
            }
        }

        // Logic check
        if (text.length < 5) {
            console.warn('[StudyForge] All extraction methods returned empty result.');
            return {
                text: '',
                chunks: [],
                pdfType,
                success: false
            };
        }

        const finalText = cleanText(text);
        const chunks = chunkText(finalText, CHUNK_SIZE);

        return {
            text: finalText,
            chunks,
            pdfType,
            success: true
        };
    } catch (err) {
        console.error('[StudyForge] Universal pipeline crash:', err);
        // Throwing here triggers the route catch block with a 500 error
        throw err;
    }
}
