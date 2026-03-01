import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { checkUserAccess } from '@/lib/access';
import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const runtime = 'nodejs';

// Trigger re-build with resolved ESLint


export async function POST(
    _request: Request,
    { params }: { params: { testId: string } }
) {
    let browser: Browser | null = null;
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Server-side access check — no frontend trust
        const access = await checkUserAccess(session.userId);
        if (!access.hasAccess) {
            return NextResponse.json(
                { error: 'Download is available for paid users only. Please upgrade or use a coupon.' },
                { status: 403 }
            );
        }

        const { testId } = params;
        const supabase = createClient();

        console.log(`[MockTest Download] Starting PDF generation for testId: ${testId}`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: test } = await (supabase as any)
            .from('mock_tests')
            .select('*')
            .eq('id', testId)
            .eq('user_id', session.userId)
            .single() as { data: Record<string, unknown> | null };

        if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: questions } = await (supabase as any)
            .from('mock_questions')
            .select('*')
            .eq('test_id', testId)
            .order('question_number', { ascending: true }) as { data: Record<string, unknown>[] | null };

        // ... HTML construction ... (shortened for replacement, but keep logic)
        const categoryColors: Record<string, string> = { technical: '#3b82f6', aptitude: '#8b5cf6', verbal: '#10b981', logical: '#f59e0b', interview: '#ef4444' };
        const categoryLabels: Record<string, string> = { technical: '🔧 Technical', aptitude: '📊 Aptitude', verbal: '📖 Verbal', logical: '🧩 Logical Reasoning', interview: '🎤 Interview Questions' };
        const categories = ['technical', 'aptitude', 'verbal', 'logical', 'interview'];

        const questionsHtml = categories.map(cat => {
            const catQs = (questions ?? []).filter((q: Record<string, unknown>) => q.category === cat);
            if (!catQs.length) return '';
            const color = categoryColors[cat] || '#6b7280';
            const label = categoryLabels[cat] || cat;
            const qHtml = catQs.map((q: Record<string, unknown>) => {
                const opts = Array.isArray(q.options) ? (q.options as string[]) : [];
                const isInterview = cat === 'interview';
                return `
                <div style="margin-bottom:24px; padding:16px; border:1px solid #e5e7eb; border-radius:8px; break-inside:avoid;">
                    <p style="font-weight:600; color:#111; margin:0 0 10px 0; font-size:13px;">
                        <span style="color:${color}; margin-right:6px;">Q${q.question_number}.</span>${q.question}
                    </p>
                    ${!isInterview && opts.length ? `
                    <div style="margin-left:16px; margin-bottom:10px;">
                        ${opts.map((opt: string) => `
                        <p style="margin:4px 0; font-size:12px; color:#374151;">
                            <span style="color:${opt.startsWith(q.correct_answer as string) ? '#16a34a' : '#374151'}; font-weight:${opt.startsWith(q.correct_answer as string) ? '700' : '400'};">
                                ${opt.startsWith(q.correct_answer as string) ? '✓ ' : ''}${opt}
                            </span>
                        </p>`).join('')}
                    </div>
                    <p style="font-size:11px; color:#6b7280; margin:6px 0 0 0; font-style:italic;"><strong>Explanation:</strong> ${q.explanation || 'N/A'}</p>
                    ` : `
                    <p style="font-size:12px; color:#374151; margin:6px 0; font-style:italic;"><strong>Model Answer:</strong> ${q.explanation || 'See preparation guide.'}</p>
                    `}
                    <p style="font-size:10px; color:#9ca3af; margin:4px 0 0 0;">Difficulty: ${q.difficulty}</p>
                </div>`;
            }).join('');
            return `<div style="margin-bottom:32px;"><h2 style="font-size:16px; font-weight:700; color:${color}; border-bottom:2px solid ${color}; padding-bottom:6px; margin-bottom:16px;">${label}</h2>${qHtml}</div>`;
        }).join('');

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;color:#111;padding:32px;font-size:13px;}h1{font-size:20px;color:#1d4ed8;margin-bottom:4px;}.meta{color:#6b7280;font-size:12px;margin-bottom:24px;}@page{margin:20mm 15mm;}</style></head><body><h1>Mock Test — ${test.job_title || 'Interview Preparation'}</h1><p class="meta">Generated by ResumeForge AI &nbsp;|&nbsp; ${new Date().toLocaleDateString()} &nbsp;|&nbsp; ${(questions ?? []).length} Questions</p>${questionsHtml}</body></html>`;

        const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;

        const launchOptions = isLocal ? {
            args: [],
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: true,
        } : {
            args: chromium.args,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            defaultViewport: (chromium as any).defaultViewport,
            executablePath: await chromium.executablePath(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            headless: (chromium as any).headless,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        browser = await puppeteer.launch(launchOptions as any);

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

        console.log(`[MockTest Download] Done. Buffer size=${pdfBuffer.length} bytes`);

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="mock-test.pdf"`,
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (e: unknown) {
        console.error('[MockTest Download] CRITICAL PDF Error:', e);
        return NextResponse.json(
            { error: 'PDF generation failed', details: e instanceof Error ? e.message : String(e) },
            { status: 500 }
        );
    } finally {
        if (browser) {
            console.log('[MockTest Download] Closing browser instance');
            await browser.close();
        }
    }
}
