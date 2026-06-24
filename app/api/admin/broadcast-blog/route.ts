export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendResendBlogBroadcast } from '@/lib/email/resend-broadcast';

export async function POST(request: Request) {
    try {
        // 1. Session and Role Authorization Check
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const emails: string[] = body.emails;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'Missing email subscriber list' }, { status: 400 });
        }

        // Slice to target the first 50 emails maximum for the batch
        const targetEmails = emails.slice(0, 50);

        // 2. Fetch the most recently published blog post
        const supabase = createAdminClient();
        const { data: posts, error: dbError } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(1);

        if (dbError) {
            console.error('[Broadcast API Database Error]', dbError);
            return NextResponse.json({ error: 'Failed to query blog posts' }, { status: 500 });
        }

        if (!posts || posts.length === 0) {
            return NextResponse.json({ error: 'No published blog posts found to broadcast' }, { status: 404 });
        }

        const latestPost = posts[0];

        // 3. Dispatch the broadcast batch via the isolated Resend wrapper
        console.log(`[Broadcast API] Triggering Resend broadcast for "${latestPost.title}" to ${targetEmails.length} users`);
        await sendResendBlogBroadcast({
            emails: targetEmails,
            post: latestPost
        });

        return NextResponse.json({
            success: true,
            count: targetEmails.length,
            postTitle: latestPost.title
        });

    } catch (e: unknown) {
        console.error("[Broadcast API Error]", e);
        return NextResponse.json({
            error: e instanceof Error ? e.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
