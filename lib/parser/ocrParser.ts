/**
 * OCR fallback parser using Tesseract.js.
 * Used ONLY when PDF text extraction returns < 100 characters
 * (i.e. scanned / image-based PDFs).
 *
 * - Never called for DOCX files.
 * - Server-side only (Node.js runtime).
 * - Safe: errors are caught and empty string returned.
 */

export async function runOCR(buffer: Buffer): Promise<string> {
    try {
        // Dynamic import avoids any SSR/edge issues
        const Tesseract = await import('tesseract.js');
        const { data } = await Tesseract.default.recognize(buffer, 'eng', {
            logger: () => { /* suppress progress logs */ },
        });
        return data.text ?? '';
    } catch (error) {
        console.error('[OCR] Tesseract recognition failed:', error);
        return '';
    }
}
