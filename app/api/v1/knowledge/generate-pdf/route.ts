import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, createApiError } from '@/lib/api/v1-utils';
import { generatePdfFromHtml } from '@/lib/pdf-generator';

/**
 * @api {post} /v1/knowledge/generate-pdf Create a PDF from content
 * @apiDescription Converts HTML or text content into a PDF document.
 */
export async function POST(req: NextRequest) {
    const auth = await validateApiKey(req);
    if (!auth.isValid) {
        return createApiError(auth.error!, auth.status!);
    }

    try {
        const body = await req.json();
        const { html, title } = body;

        if (!html) {
            return createApiError('HTML content is required.', 400);
        }

        // Simple wrapper for content if not already a full document
        const fullHtml = html.includes('<html>') ? html : `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
                    h1 { color: #2563eb; }
                </style>
            </head>
            <body>
                ${title ? `<h1>${title}</h1>` : ''}
                ${html}
            </body>
            </html>
        `;

        const pdfBuffer = await generatePdfFromHtml(fullHtml);
        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${title || 'document'}.pdf"`,
            }
        });
    } catch (error: unknown) {
        console.error('[API v1] Generate PDF Error:', error);
        const err = error as Error;
        return createApiError(err.message || 'Internal server error', 500);
    }
}
