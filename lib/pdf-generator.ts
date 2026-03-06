import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function generatePdfFromHtml(html: string): Promise<Buffer> {
    let browser: Browser | null = null;
    try {
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
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        return Buffer.from(pdfBuffer);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
