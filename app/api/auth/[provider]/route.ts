export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { PROVIDERS, getRedirectUri, setOAuthStateCookie } from '@/lib/auth/oauth';
import crypto from 'crypto';
import { BASE_URL } from '@/lib/constants';

export async function GET(request: Request, { params }: { params: { provider: string } }) {
    const provider = params.provider.toLowerCase();

    // Check if provider is supported
    if (!PROVIDERS[provider]) {
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    const config = PROVIDERS[provider];

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
