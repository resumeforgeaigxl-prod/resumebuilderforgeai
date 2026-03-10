import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
const COOKIE_NAME = 'resume_forge_auth';
const JWT_EXPIRES_IN = '7d';

export interface AuthSession {
    userId: string;
    role: string;
    isBlocked: boolean;
    termsAccepted: boolean;
    profileCompleted: boolean;
    provider: string;
}

import { MAIN_DOMAIN } from '../constants';

export async function createSession(payload: AuthSession) {
    const expiresInSec = 7 * 24 * 60 * 60; // 7 days

    // Strip JWT-reserved fields (exp, iat, nbf) that may be present if
    // payload was spread from a previously decoded token (getSession result)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { exp, iat, nbf, ...cleanPayload } = payload as any;
    void exp; void iat; void nbf; // suppress unused var warnings

    const token = jwt.sign(cleanPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const { cookies } = await import('next/headers');
    cookies().set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: expiresInSec,
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? `.${MAIN_DOMAIN}` : undefined,
    });
}

export async function getSession(): Promise<AuthSession | null> {
    const { cookies } = await import('next/headers');
    const token = cookies().get(COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthSession;
        return decoded;
    } catch {
        return null;
    }
}

export async function clearSession() {
    const { cookies } = await import('next/headers');
    cookies().delete(COOKIE_NAME);
}

export function verifyAdminSession(session: AuthSession | null): boolean {
    return session !== null && session.role === 'admin' && !session.isBlocked;
}
