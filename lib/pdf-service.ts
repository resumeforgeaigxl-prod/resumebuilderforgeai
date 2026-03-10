/**
 * Shared Python PDF Extraction Service Integration
 */

const PYTHON_SERVICE_URL = process.env.PYTHON_PDF_SERVICE_URL || 'http://localhost:8000';

export async function extractTextFromPdf(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
        console.log(`[PDF Service] Sending ${fileName} to Python for extraction...`);

        // Create a FormData-like representation for Node Fetch if using internal fetch
        // In Next.js server actions / routes, we can use FormData or just a simple POST with binary if API supports it
        // FastAPI expects File(...) which is a multipart form

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/pdf' });
        formData.append('file', blob, fileName);

        const response = await fetch(`${PYTHON_SERVICE_URL}/extract`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Python Service Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data.text || '';

    } catch (err) {
        console.error('[PDF Service] Fatal Error:', err);
        throw err;
    }
}
