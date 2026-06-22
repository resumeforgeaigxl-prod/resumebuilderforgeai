import { cookies } from 'next/headers';

export interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
    profileUrl: string;
    scope: string;
}

export const PROVIDERS: Record<string, OAuthConfig> = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        profileUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scope: 'openid email profile',
    },
    github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        profileUrl: 'https://api.github.com/user',
        scope: 'read:user user:email',
    },
    discord: {
        clientId: process.env.DISCORD_CLIENT_ID || '',
        clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
        authUrl: 'https://discord.com/api/oauth2/authorize',
        tokenUrl: 'https://discord.com/api/oauth2/token',
        profileUrl: 'https://discord.com/api/users/@me',
        scope: 'identify email',
    },
};

const OAUTH_STATE_COOKIE = 'oauth_state';

export function getRedirectUri(provider: string, baseUrl: string) {
    return `${baseUrl}/api/auth/${provider}/callback`;
}

import { MAIN_DOMAIN } from '../constants';

export function setOAuthStateCookie(state: string) {
    cookies().set(OAUTH_STATE_COOKIE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? `.${MAIN_DOMAIN}` : undefined,
    });
}

export function getOAuthStateCookie(): string | undefined {
    return cookies().get(OAUTH_STATE_COOKIE)?.value;
}

export function clearOAuthStateCookie() {
    cookies().delete(OAUTH_STATE_COOKIE);
    cookies().set(OAUTH_STATE_COOKIE, '', {
        maxAge: 0,
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? `.${MAIN_DOMAIN}` : undefined,
    });
}
