import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_change_in_production'
);

const MAIN_DOMAIN = 'resumeforgeai.in';

// EU country codes for region mapping
const EU_COUNTRIES = new Set([
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

const VALID_REGIONS = new Set(['in', 'us', 'eu']);

/** Map Vercel/CF country code to a region slug */
function countryToRegion(country: string | null): string | null {
    if (!country) return null;
    const c = country.toUpperCase();
    if (c === 'IN') return 'in';
    if (c === 'US') return 'us';
    if (EU_COUNTRIES.has(c)) return 'eu';
    return null;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = request.headers.get('host') ?? '';

    // Determine if this is a subdomain request
    const isAppSubdomain = host.startsWith('app.');
    const isApiSubdomain = host.startsWith('api.');
    const isAdminSubdomain = host.startsWith('admin.');
    const isSubdomain = isAppSubdomain || isApiSubdomain || isAdminSubdomain;

    // ─── Always pass through: static files
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.ico')
    ) {
        return NextResponse.next();
    }

    // ─── API subdomain: rewrite to /api/* and add CORS headers ───────────────
    if (isApiSubdomain) {
        // Passthrough API calls with CORS headers
        const response = NextResponse.next();
        const origin = request.headers.get('origin') ?? '';
        const allowedOrigins = [
            'https://app.resumeforgeai.in',
            'https://admin.resumeforgeai.in',
            `https://${MAIN_DOMAIN}`,
        ];
        if (allowedOrigins.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
        }
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, { status: 204, headers: response.headers });
        }
        return response;
    }

    // ─── JWT session resolution ───────────────────────────────────────────────
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

    // ─── Admin subdomain ──────────────────────────────────────────────────────
    if (isAdminSubdomain) {
        if (!session) {
            const loginUrl = new URL(`https://${MAIN_DOMAIN}/login`);
            return NextResponse.redirect(loginUrl);
        }
        if (session.isBlocked) {
            const res = NextResponse.redirect(new URL(`https://${MAIN_DOMAIN}/login?error=AccountBlocked`));
            res.cookies.delete('resume_forge_auth');
            return res;
        }
        if (session.role !== 'admin') {
            return NextResponse.redirect(new URL(`https://${MAIN_DOMAIN}/dashboard`));
        }
        return NextResponse.next();
    }

    // ─── App subdomain ────────────────────────────────────────────────────────
    if (isAppSubdomain) {
        const origin = `https://app.${MAIN_DOMAIN}`;
        const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
        const isPublicRoute = pathname === '/' || pathname.startsWith('/privacy') || pathname.startsWith('/terms');
        const isCompleteProfile = pathname === '/complete-profile';

        if (!session && !isAuthRoute && !isPublicRoute && !isCompleteProfile) {
            return NextResponse.redirect(`${origin}/login`);
        }

        if (session) {
            if (session.isBlocked) {
                const res = NextResponse.redirect(`${origin}/login?error=AccountBlocked`);
                res.cookies.delete('resume_forge_auth');
                return res;
            }
            const profileIncomplete = !session.profileCompleted;
            if (profileIncomplete && !isCompleteProfile && !isAuthRoute && !isPublicRoute) {
                return NextResponse.redirect(`${origin}/complete-profile`);
            }
            if (!profileIncomplete && isCompleteProfile) {
                return NextResponse.redirect(`${origin}/dashboard`);
            }
            if (isAuthRoute) {
                return NextResponse.redirect(`${origin}/dashboard`);
            }
        }
        return NextResponse.next();
    }

    // ─── Main domain: handle regional subfolders + geo detection ─────────────
    const isApiRoute = pathname.startsWith('/api');
    if (isApiRoute) {
        return NextResponse.next();
    }

    // Detect regional segment from URL path: /in /us /eu
    const pathParts = pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0] ?? '';
    const isRegionalPath = VALID_REGIONS.has(firstSegment);

    // ─── Geo suggestion cookie logic (main domain homepage only) ─────────────
    if (!isRegionalPath && pathname === '/') {
        const regionCookie = request.cookies.get('region')?.value;

        // Only set geo_country cookie if user hasn't chosen a region yet
        if (!regionCookie) {
            // Vercel sets x-vercel-ip-country; CloudFlare sets cf-ipcountry
            const countryCode =
                request.headers.get('x-vercel-ip-country') ||
                request.headers.get('cf-ipcountry');
            const suggestedRegion = countryToRegion(countryCode);

            if (suggestedRegion) {
                const response = NextResponse.next();
                // Set a short-lived cookie so the client-side banner knows what to suggest
                response.cookies.set('geo_country', countryCode ?? '', {
                    path: '/',
                    maxAge: 3600, // 1 hour
                    httpOnly: false, // readable by client JS for the banner
                    sameSite: 'lax',
                });
                response.cookies.set('geo_suggested_region', suggestedRegion, {
                    path: '/',
                    maxAge: 3600,
                    httpOnly: false,
                    sameSite: 'lax',
                });
                return response;
            }
        }
    }

    // ─── Standard auth logic for main domain ─────────────────────────────────
    const origin = `https://${MAIN_DOMAIN}`;
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isPublicRoute =
        pathname === '/' ||
        isRegionalPath ||
        pathname.startsWith('/privacy') ||
        pathname.startsWith('/terms') ||
        pathname.startsWith('/ai-resume-builder') ||
        pathname.startsWith('/ats-resume-builder') ||
        pathname.startsWith('/ai-mock-interview') ||
        pathname.startsWith('/job-interview-ai-coach') ||
        pathname.startsWith('/sitemap') ||
        pathname.startsWith('/p/'); // public portfolios
    const isCompleteProfile = pathname === '/complete-profile';

    // 1. Unauthenticated accessing protected route
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

        // 3. Profile not completed
        const profileIncomplete = !session.profileCompleted;
        if (profileIncomplete && !isCompleteProfile && !isAuthRoute && !isPublicRoute) {
            return NextResponse.redirect(`${origin}/complete-profile`);
        }

        // 4. Completed user hitting complete-profile
        if (!profileIncomplete && isCompleteProfile) {
            return NextResponse.redirect(`${origin}/dashboard`);
        }

        // 5. Admin route protection (main domain /admin/* still protected)
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
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
