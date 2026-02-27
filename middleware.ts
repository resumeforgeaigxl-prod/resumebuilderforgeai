import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_change_in_production'
);

export async function middleware(request: NextRequest) {
    const { pathname, origin } = request.nextUrl;

    // Always allow: static files, API routes, OAuth callback
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isPublicRoute = pathname === '/' || pathname.startsWith('/privacy') || pathname.startsWith('/terms');
    const isCompleteProfile = pathname === '/complete-profile';

    const token = request.cookies.get('resume_forge_auth')?.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let session: any = null;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            session = payload;
        } catch {
            session = null;
        }
    }

    // 1. Unauthenticated user trying to access a protected route
    if (!session && !isAuthRoute && !isPublicRoute && !isCompleteProfile) {
        return NextResponse.redirect(`${origin}/login`);
    }

    if (session) {
        // 2. Blocked users — force logout
        if (session.isBlocked) {
            const res = NextResponse.redirect(`${origin}/login?error=AccountBlocked`);
            res.cookies.delete('resume_forge_auth');
            return res;
        }

        // 3. Profile not completed — gate all protected pages (backend enforcement)
        const profileIncomplete = !session.profileCompleted;

        if (profileIncomplete && !isCompleteProfile && !isAuthRoute && !isPublicRoute) {
            return NextResponse.redirect(`${origin}/complete-profile`);
        }

        // 4. Completed user trying to access complete-profile again
        if (!profileIncomplete && isCompleteProfile) {
            return NextResponse.redirect(`${origin}/dashboard`);
        }

        // 5. Admin route protection
        if (pathname.startsWith('/admin') && session.role !== 'admin') {
            return NextResponse.redirect(`${origin}/dashboard`);
        }

        // 6. Authenticated user hitting login/signup
        if (isAuthRoute) {
            if (profileIncomplete) return NextResponse.redirect(`${origin}/complete-profile`);
            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
