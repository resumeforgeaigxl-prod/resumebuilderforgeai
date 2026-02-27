import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkUserAccess } from '@/lib/access';
import PortfolioRenderer from '@/components/portfolio/PortfolioRenderer';
import { Portfolio } from '@/types/portfolio';

export const revalidate = 3600; // Cache for 1 hour

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props) {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('portfolios')
        .select('data, username')
        .eq('username', params.username)
        .eq('is_public', true)
        .single() as { data: { data: { name: string; headline: string }; username: string } | null };

    if (!data) return { title: 'Portfolio Not Found' };
    return {
        title: `${data.data.name} — Portfolio`,
        description: data.data.headline,
        robots: { index: true, follow: true },
    };
}

export default async function PublicPortfolioPage({ params }: Props) {
    const { username } = params;

    // Security: validate username shape before DB query
    if (!/^[a-z0-9-]{3,30}$/.test(username)) notFound();

    const supabase = createClient();

    // Only fetch public portfolios
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: portfolio } = await (supabase as any)
        .from('portfolios')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .single() as { data: Portfolio | null };

    if (!portfolio) notFound();

    // Server-side watermark check based on owner's access
    const access = await checkUserAccess(portfolio.user_id);
    const watermark = !access.hasAccess;

    return <PortfolioRenderer data={portfolio.data} theme={portfolio.theme} watermark={watermark} />;
}
