export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { ResumeData } from '@/types/resume';
import { generateHarvardHtml } from '@/templates/harvard';
import { generateStanfordHtml } from '@/templates/stanford';
import { generateModernHtml } from '@/templates/modern';
import { generateCompactHtml } from '@/templates/compact';
import { generateExecutiveHtml } from '@/templates/executive';
import { generateMinimalDividerHtml } from '@/templates/minimal-divider';
import { generateAcademicHtml } from '@/templates/academic';
import { generateAtsLightHtml } from '@/templates/ats-light';
import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const runtime = 'nodejs';

function selectTemplate(resumeData: ResumeData, template: string): string {
    switch (template) {
        case 'harvard': return generateHarvardHtml(resumeData);
        case 'stanford': return generateStanfordHtml(resumeData);
        case 'modern': return generateModernHtml(resumeData);
        case 'compact': return generateCompactHtml(resumeData);
        case 'executive': return generateExecutiveHtml(resumeData);
        case 'minimal-divider': return generateMinimalDividerHtml(resumeData);
        case 'academic': return generateAcademicHtml(resumeData);
        case 'ats-light': return generateAtsLightHtml(resumeData);
        default: return generateHarvardHtml(resumeData);
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    let browser: Browser | null = null;
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = params;

        // Fetch resume: First try standard resumes, then optimized resumes
        let resumeData: ResumeData | null = null;
        let template = 'harvard';

        const { data: standardResume } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', id)
            .single();

        if (standardResume) {
            resumeData = standardResume.resume_json as unknown as ResumeData;
            template = standardResume.template_selected || 'harvard';
        } else {
            const { data: optimizedResume } = await supabase
                .from('optimized_resumes')
                .select('optimized_resume, original_resume_id')
                .eq('id', id)
                .single();

            if (optimizedResume) {
                resumeData = optimizedResume.optimized_resume as unknown as ResumeData;

                // Fetch original to get the template if needed, default to harvard
                if (optimizedResume.original_resume_id) {
                    const { data: orig } = await supabase.from('resumes')
                        .select('template_selected')
                        .eq('id', optimizedResume.original_resume_id)
                        .single();
                    if (orig) template = orig.template_selected || 'harvard';
                }
            }
        }

        if (!resumeData) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        const html = selectTemplate(resumeData, template);

        // PDF Generation
        const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = chromium as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let launchOptions: any;

        if (isLocal) {
            launchOptions = {
                args: [],
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                headless: true,
            };
        } else {
            launchOptions = {
                args: c.args,
                defaultViewport: c.defaultViewport,
                executablePath: await c.executablePath(),
                headless: c.headless,
            };
        }

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="resume-${id.slice(0, 8)}.pdf"`,
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (e: unknown) {
        console.error('[Admin Download] Error:', e);
        return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}
