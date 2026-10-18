export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { PROVIDERS, getRedirectUri, setOAuthStateCookie, setOAuthRedirectCookie } from '@/lib/auth/oauth';
import crypto from 'crypto';
import { BASE_URL } from '@/lib/constants';
import { resolvePostAuthDestination } from '@/lib/auth/intent';

export async function GET(request: Request, { params }: { params: { provider: string } }) {
    const provider = params.provider.toLowerCase();

    // Check if provider is supported
    if (!PROVIDERS[provider]) {
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    const config = PROVIDERS[provider];
    const url = new URL(request.url);

    // Save intent or redirect if supplied
    const destination = resolvePostAuthDestination(url.searchParams, 'en-in', true);
    if (destination && destination !== '/en-in/dashboard') {
        setOAuthRedirectCookie(destination);
    } else {
        const rawRedirect = url.searchParams.get('redirect');
        if (rawRedirect && rawRedirect.startsWith('/')) {
            setOAuthRedirectCookie(rawRedirect);
        }
    }

    // Generate secure state parameter
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in httpOnly cookie
    setOAuthStateCookie(state);

    // Build redirect URL
    const redirectUri = getRedirectUri(provider, BASE_URL);

    const authParams = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: config.scope,
        state: state,
    });

    if (provider === 'google') {
        authParams.append('access_type', 'offline');
        authParams.append('prompt', 'consent');
    }

    const providerAuthUrl = `${config.authUrl}?${authParams.toString()}`;

    return NextResponse.redirect(providerAuthUrl);
}
