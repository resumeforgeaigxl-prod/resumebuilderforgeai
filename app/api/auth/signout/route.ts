export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth/jwt';
import { clearOAuthStateCookie } from '@/lib/auth/oauth';

export async function POST(request: Request) {
    const requestUrl = new URL(request.url);

    // Clear custom JWT cookie
    clearSession();
    clearOAuthStateCookie();

    return NextResponse.redirect(`${requestUrl.origin}/login`, {
        status: 301,
    });
}


