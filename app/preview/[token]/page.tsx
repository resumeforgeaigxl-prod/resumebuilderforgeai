import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortfolioRenderer from '@/components/portfolio/PortfolioRenderer';
import { Portfolio } from '@/types/portfolio';

// Never cache preview pages
export const dynamic = 'force-dynamic';

interface Props { params: { token: string } }

export async function generateMetadata() {
    return {
        robots: { index: false, follow: false },
        title: 'Portfolio Preview — ResumeForge AI',
    };
}

export default async function PreviewPortfolioPage({ params }: Props) {
    const { token } = params;

    if (!token || token.length < 10) notFound();

    const supabase = createClient();

    // Fetch by preview_token — ignores is_public
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: portfolio } = await (supabase as any)
        .from('portfolios')
        .select('*')
        .eq('preview_token', token)
        .single() as { data: Portfolio | null };

    if (!portfolio) notFound();

    // Preview always shows watermark
    return (
        <div>
            <div className="sticky top-0 z-50 w-full bg-amber-500/95 backdrop-blur-sm text-black text-center text-xs font-bold py-2 px-4 flex items-center justify-center gap-3">
                <span>👁️ Preview Mode — This portfolio is not yet public</span>
                <a href="/portfolio" className="underline hover:opacity-70 transition-opacity">Edit &amp; Publish →</a>
            </div>
            <PortfolioRenderer data={portfolio.data} theme={portfolio.theme} watermark={true} />
        </div>
    );
}
