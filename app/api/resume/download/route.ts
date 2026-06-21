export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ResumeData } from '@/types/resume';
import { renderResumeToHtml } from '@/lib/resume-server-renderer';
import { getSession } from '@/lib/auth/jwt';
import { checkUserAccess } from '@/lib/access';
import { logPDFDownload } from '@/lib/admin-logger';
import { incrementForgeUsage } from '@/lib/auth/usage';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';

async function injectWatermark(page: Page): Promise<void> {
    await page.evaluate(() => {
        document.querySelectorAll('#resumeforge-watermark').forEach(el => el.remove());
        const wm = document.createElement('div');
        wm.id = 'resumeforge-watermark';
        wm.style.cssText = 'position: fixed; bottom: 12px; left: 0; right: 0; pointer-events: none; z-index: 9999; text-align: center;';
        wm.innerHTML = `<span style="font-size: 8.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #94A3B8; letter-spacing: 0.8px; user-select: none; text-transform: uppercase; font-weight: 500;">Built with <strong>ResumeForgeAI</strong> • resumeforgeai.in</span>`;
        document.body.appendChild(wm);
    });
}

export async function POST(request: Request) {
    let browser: Browser | null = null;
    let session: { userId?: string } | null = null;
    let showWatermark = true;

    try {
        // 1. Get session EARLY to avoid "cookies called outside request scope" errors
        try {
            session = await getSession();
            if (session?.userId) {
                const access = await checkUserAccess(session.userId);
                showWatermark = !access.hasAccess;
            }
        } catch (authErr) {
            console.error('[Download] Auth/Access check failed:', authErr);
        }

        // 2. Parse request body
        let body: { resumeData: ResumeData; template?: string };
        try {
            body = await request.clone().json().catch(async () => {
                const text = await request.text();
                return JSON.parse(text);
            });
        } catch (jsonErr) {
            console.error('[Download] Request body parsing failed:', jsonErr);
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const resumeData: ResumeData = body.resumeData;
        const template: string = body.template || 'harvard';

        if (!resumeData) {
            return NextResponse.json({ error: 'No resume data provided' }, { status: 400 });
        }

        console.log(`[Download] PDF gen start | Template: ${template} | Watermark: ${showWatermark}`);

        const html = renderResumeToHtml(resumeData, template);
        const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
        const c = (chromium as unknown) as { args: string[]; defaultViewport: unknown; executablePath: () => Promise<string>; headless: boolean };
        let launchOptions: unknown;

        if (isLocal) {
            launchOptions = {
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                headless: true,
                timeout: 120000,
            };
        } else {
            launchOptions = {
                args: c.args,
                defaultViewport: c.defaultViewport,
                executablePath: await c.executablePath(),
                headless: c.headless,
                timeout: 120000,
            };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        browser = await puppeteer.launch(launchOptions as any);
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(120000);
        await page.setDefaultTimeout(120000);

        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Optional: wait a tiny bit more for layout stabilization
        await new Promise(r => setTimeout(r, 500));

        if (showWatermark) {
            await injectWatermark(page);
        }

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }, // Template handles its own margins
            preferCSSPageSize: true
        });

        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('PDF generation produced an empty buffer');
        }

        // Fire-and-forget: Admin Log & Usage Increment
        if (session?.userId) {
            logPDFDownload({
                userId: session.userId,
                resumeName: resumeData?.name || 'Untitled',
                template,
                watermarked: showWatermark
            });
            // Also increment free usage count
            incrementForgeUsage('resumeforge').catch(e => console.error('[Download] Usage increment failed:', e));
        }

        console.log('[Download] PDF generation successful, returning response...');

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"',
                'X-Watermark': showWatermark ? 'true' : 'false',
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (e: unknown) {
        const err = e as Error;
        console.error('[Download] CRITICAL Error:', err);
        const errorDetail = {
            error: 'PDF generation failed',
            details: err.message || String(err),
            stack: err.stack
        };

        try {
            const logsDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
            fs.writeFileSync(path.join(logsDir, 'pdf_download_error.json'), JSON.stringify(errorDetail, null, 2));
        } catch { }

        return NextResponse.json(errorDetail, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}

export async function GET(request: Request) {
    let browser: Browser | null = null;
    let session: { userId?: string } | null = null;
    let showWatermark = true;

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const template = searchParams.get('template') || 'harvard';

        if (!id) {
            return NextResponse.json({ error: 'No resume ID provided' }, { status: 400 });
        }

        // Get session
        try {
            session = await getSession();
            if (session?.userId) {
                const access = await checkUserAccess(session.userId);
                showWatermark = !access.hasAccess;
            }
        } catch (authErr) {
            console.error('[Download GET] Auth check failed:', authErr);
        }

        const supabase = createClient();
        // Fetch resume from DB
        const { data: resume, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Verify ownership (unless it's public or checkUserAccess is admin)
        if (session?.userId && resume.user_id !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized to download this resume' }, { status: 403 });
        }

        console.log(`[Download GET] PDF gen start for ${id} | Template: ${template} | Watermark: ${showWatermark}`);

        const html = renderResumeToHtml(resume.resume_json, template);
        const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
        const c = (chromium as unknown) as { args: string[]; defaultViewport: unknown; executablePath: () => Promise<string>; headless: boolean };
        let launchOptions: unknown;

        if (isLocal) {
            launchOptions = {
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                headless: true,
                timeout: 120000,
            };
        } else {
            launchOptions = {
                args: c.args,
                defaultViewport: c.defaultViewport,
                executablePath: await c.executablePath(),
                headless: c.headless,
                timeout: 120000,
            };
        }

        browser = await puppeteer.launch(launchOptions as any);
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(120000);
        await page.setDefaultTimeout(120000);

        await page.setContent(html, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 500));

        if (showWatermark) {
            await injectWatermark(page);
        }

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            preferCSSPageSize: true
        });

        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('PDF generation produced an empty buffer');
        }

        if (session?.userId) {
            logPDFDownload({
                userId: session.userId,
                resumeName: resume.resume_json?.name || 'Untitled',
                template,
                watermarked: showWatermark
            });
            incrementForgeUsage('resumeforge').catch(e => console.error('[Download GET] Usage increment failed:', e));
        }

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"',
                'X-Watermark': showWatermark ? 'true' : 'false',
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (e: unknown) {
        const err = e as Error;
        console.error('[Download GET] CRITICAL Error:', err);
        return NextResponse.json({
            error: 'PDF generation failed',
            details: err.message || String(err)
        }, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}



