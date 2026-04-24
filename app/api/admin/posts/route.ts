export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

// Admin verification helper
async function isAdmin(userId: string) {
    const supabase = createAdminClient();
    const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
    return user?.role === 'admin';
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !(await isAdmin(session.userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, slug, author, content, seo_description, cover_image, status, locale } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('blog_posts')
            .insert({
                title,
                slug,
                author: author || 'Admin',
                content,
                seo_description,
                cover_image,
                status: status || 'draft',
                locale: locale || 'en',
                published_at: status === 'published' ? new Date().toISOString() : null
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (e: unknown) {
        console.error('[Admin Posts POST] Error:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || !(await isAdmin(session.userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, title, slug, author, content, seo_description, cover_image, status, locale } = body;

        if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

        const supabase = createAdminClient();
        const updateData: Record<string, string | null | undefined> = {
            title,
            slug,
            author,
            content,
            seo_description,
            cover_image,
            status,
            locale,
            updated_at: new Date().toISOString()
        };

        if (status === 'published') {
            updateData.published_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('blog_posts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (e: unknown) {
        console.error('[Admin Posts PUT] Error:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session || !(await isAdmin(session.userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        console.error('[Admin Posts DELETE] Error:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
    }
}


