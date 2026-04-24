import { SignJWT, jwtVerify } from 'jose';
import { MAIN_DOMAIN } from '../constants';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
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

export async function createSession(payload: AuthSession) {
    const expiresInSec = 7 * 24 * 60 * 60; // 7 days

    // Strip JWT-reserved fields (exp, iat, nbf)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { exp, iat, nbf, ...cleanPayload } = payload as any;
    void exp; void iat; void nbf;

    const token = await new SignJWT(cleanPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);

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
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as AuthSession;
    } catch (err) {
        console.error('[Auth] getSession failed:', err instanceof Error ? err.message : 'Unknown error');
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
