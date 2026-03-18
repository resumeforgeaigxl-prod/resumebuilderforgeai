import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';
import { getSession } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event, page, metadata } = body;
        const session = await getSession();

        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const ua = req.headers.get('user-agent') || 'unknown';

        // ASYNC Tracking: Don't wait for it if you want to respond fast
        // But for testing purposes, we await here
        trackEvent({
            userId: session?.userId,
            event: event || 'page_view',
            page: page || '/',
            metadata: metadata || {},
            ip: ip,
            ua: ua
        }).catch(err => console.error('[Track API] Silent fail:', err));

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error('[Track API] Error:', err);
        return NextResponse.json({ success: false }, { status: 400 });
    }
}
