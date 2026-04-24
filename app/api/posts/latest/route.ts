export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'en';

        console.log(`[Posts Latest] Fetching for locale: ${locale.split('-')[0]}`);
        const supabase = createAdminClient();
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('title, slug, seo_description, cover_image, published_at')
            .eq('status', 'published')
            .eq('locale', locale.split('-')[0])
            .order('published_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('[Posts Latest] DB Error:', error);
            throw error;
        }

        console.log(`[Posts Latest] Found ${posts?.length || 0} posts.`);
        return NextResponse.json({ success: true, posts });
    } catch (e: unknown) {
        console.error('[Posts Latest GET] Error:', e);
        return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
    }
}

