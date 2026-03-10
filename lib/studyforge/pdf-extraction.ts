const MIN_USEFUL_TEXT_LENGTH = 120;
const DEFAULT_MAX_OCR_PAGES = 12;
const DEFAULT_OCR_SCALE = 2;

export type PdfExtractionMethod =
    | 'pdf-parse'
    | 'pdf-parse-partial'
    | 'ocr'
    | 'pdf-parse+ocr'
    | 'failed';

export interface PdfExtractionResult {
    text: string;
    method: PdfExtractionMethod;
    ocrUsed: boolean;
}

export interface PdfExtractionOptions {
    enableOcrFallback?: boolean;
    minUsefulTextLength?: number;
    maxOcrPages?: number;
    ocrScale?: number;
    ocrLanguage?: string;
}

function normalizeText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\u0000/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

async function extractTextWithPdfParse(buffer: Buffer): Promise<string> {
    try {
        const mod = await import('pdf-parse');

        if ('PDFParse' in mod) {
            const { PDFParse } = mod as unknown as {
                PDFParse: new (options: { data: Uint8Array }) => {
                    getText: () => Promise<{ text: string }>;
                    destroy: () => Promise<void>;
                };
            };

            const parser = new PDFParse({ data: new Uint8Array(buffer) });
            try {
                const result = await parser.getText();
                return normalizeText(result.text || '');
            } finally {
                await parser.destroy();
            }
        }

        const legacyParser = (mod as unknown as {
            default?: (input: Buffer) => Promise<{ text: string }>;
        }).default;
        if (typeof legacyParser === 'function') {
            const result = await legacyParser(buffer);
            return normalizeText(result?.text || '');
        }
    } catch (error) {
        console.error('[StudyForge] pdf-parse extraction failed:', error);
    }

    return '';
}

async function renderPdfPagesToImages(
    buffer: Buffer,
    maxPages: number,
    scale: number
): Promise<Buffer[]> {
    const canvasModule = await import('@napi-rs/canvas');
    const globals = globalThis as Record<string, unknown>;
    if (!globals.DOMMatrix) globals.DOMMatrix = (canvasModule as Record<string, unknown>).DOMMatrix;
    if (!globals.ImageData) globals.ImageData = (canvasModule as Record<string, unknown>).ImageData;
    if (!globals.Path2D) globals.Path2D = (canvasModule as Record<string, unknown>).Path2D;

    const pdfJs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = (pdfJs as unknown as {
        getDocument: (options: Record<string, unknown>) => { promise: Promise<unknown> };
    }).getDocument({
        data: new Uint8Array(buffer),
        disableWorker: true,
        isEvalSupported: false,
        useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise as {
        numPages: number;
        getPage: (pageNumber: number) => Promise<{
            getViewport: (options: { scale: number }) => { width: number; height: number };
            render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
            cleanup?: () => void;
        }>;
        cleanup?: () => void;
        destroy?: () => Promise<void>;
    };

    const pagesToProcess = Math.min(pdfDocument.numPages, maxPages);
    const images: Buffer[] = [];

    for (let pageNumber = 1; pageNumber <= pagesToProcess; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const width = Math.max(1, Math.ceil(viewport.width));
        const height = Math.max(1, Math.ceil(viewport.height));

        const canvas = canvasModule.createCanvas(width, height);
        const context = canvas.getContext('2d');

        await page.render({
            canvasContext: context as unknown as CanvasRenderingContext2D,
            viewport,
        }).promise;

        images.push(canvas.toBuffer('image/png'));
        page.cleanup?.();
    }

    pdfDocument.cleanup?.();
    if (typeof pdfDocument.destroy === 'function') {
        await pdfDocument.destroy();
    }

    return images;
}

async function runOcrOnImages(images: Buffer[], language: string): Promise<string> {
    if (!images.length) return '';

    const Tesseract = await import('tesseract.js');
    const worker = await Tesseract.createWorker(language, 1, {
        logger: () => {
            // Suppress verbose OCR logs in server output.
        },
    });

    try {
        const chunks: string[] = [];

        for (const imageBuffer of images) {
            const result = await worker.recognize(imageBuffer);
            const text = normalizeText(result?.data?.text || '');
            if (text) chunks.push(text);
        }

        return normalizeText(chunks.join('\n\n'));
    } finally {
        try {
            await worker.terminate();
        } catch (terminateError) {
            console.error('[StudyForge] OCR worker termination failed:', terminateError);
        }
    }
}

export async function extractPdfTextWithFallback(
    buffer: Buffer,
    options: PdfExtractionOptions = {}
): Promise<PdfExtractionResult> {
    const enableOcrFallback = options.enableOcrFallback ?? true;
    const minUsefulTextLength = options.minUsefulTextLength ?? MIN_USEFUL_TEXT_LENGTH;
    const maxOcrPages = options.maxOcrPages ?? DEFAULT_MAX_OCR_PAGES;
    const ocrScale = options.ocrScale ?? DEFAULT_OCR_SCALE;
    const ocrLanguage = options.ocrLanguage ?? 'eng';

    const parsedText = await extractTextWithPdfParse(buffer);
    if (parsedText.length >= minUsefulTextLength) {
        return {
            text: parsedText,
            method: 'pdf-parse',
            ocrUsed: false,
        };
    }

    if (!enableOcrFallback) {
        return {
            text: parsedText,
            method: parsedText ? 'pdf-parse-partial' : 'failed',
            ocrUsed: false,
        };
    }

    try {
        const pageImages = await renderPdfPagesToImages(buffer, maxOcrPages, ocrScale);
        const ocrText = await runOcrOnImages(pageImages, ocrLanguage);

        if (ocrText) {
            const combinedText = parsedText ? normalizeText(`${parsedText}\n\n${ocrText}`) : ocrText;
            return {
                text: combinedText,
                method: parsedText ? 'pdf-parse+ocr' : 'ocr',
                ocrUsed: true,
            };
        }
    } catch (ocrError) {
        console.error('[StudyForge] OCR fallback failed:', ocrError);
    }

    return {
        text: parsedText,
        method: parsedText ? 'pdf-parse-partial' : 'failed',
        ocrUsed: true,
    };
}
