import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STR = process.env.JWT_SECRET || 'dummy-secret-for-build-safety';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STR);

const MAIN_DOMAIN = 'resumeforgeai.in';

const VALID_REGIONS = new Set(['in', 'us', 'eu']);
const SUPPORTED_LOCALES = ['en', 'hi', 'te', 'ta', 'ml', 'es', 'fr', 'de'];
const DEFAULT_LOCALE = 'en';
const DEFAULT_REGION = 'in';

const BOT_USER_AGENTS = ['googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp', 'baiduspider', 'facebookexternalhit', 'twitterbot', 'linkedinbot', 'slackbot', 'applebot', 'discordbot'];

function countryToRegion(country: string | null): string | null {
    if (!country) return null;
    const c = country.toUpperCase();
    if (c === 'IN') return 'in';
    if (c === 'US') return 'us';
    const EU_COUNTRIES = new Set(['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']);
    if (EU_COUNTRIES.has(c)) return 'eu';
    return null;
}

function getLocale(request: NextRequest): string {
    const cookieLocale = request.cookies.get('preferred_lang')?.value;
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
        const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().split('-')[0]);
        for (const lang of languages) if (SUPPORTED_LOCALES.includes(lang)) return lang;
    }
    return DEFAULT_LOCALE;
}

function getRegion(request: NextRequest): string {
    const cookieRegion = request.cookies.get('preferred_region')?.value;
    if (cookieRegion && VALID_REGIONS.has(cookieRegion)) return cookieRegion;
    const countryCode = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry');
    return countryToRegion(countryCode) || DEFAULT_REGION;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = (request.headers.get('host') ?? '').toLowerCase();

    // ─── 1. STATIC ASSETS & API SKIP (CRITICAL: MUST BE FIRST) ───────────────
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/locales') ||
        pathname.includes('.') // Catch all file extensions
    ) {
        return NextResponse.next();
    }

    const isAppSub = host.startsWith('app.');
    const isAdminSub = host.startsWith('admin.');
    const isWaitlistSub = host.startsWith('waitlist.');
    const isDocsSub = host.startsWith('docs.');
    const isSubdomain = isAppSub || isAdminSub || isWaitlistSub || isDocsSub;

    const currentLocale = getLocale(request);
    const currentRegion = getRegion(request);
    const localePrefix = `${currentLocale}-${currentRegion}`;

    // ─── 2. SUBDOMAIN HANDLING (REDIRECTS TO MAIN DOMAIN PATHS) ─────────────
    if (isSubdomain) {
        let targetPath = pathname;
        if (isWaitlistSub) targetPath = pathname === '/' ? '/waitlist' : (pathname.startsWith('/waitlist') ? pathname : `/waitlist${pathname}`);
        else if (isAdminSub) targetPath = pathname === '/' ? '/admin' : (pathname.startsWith('/admin') ? pathname : `/admin${pathname}`);
        else if (isAppSub) targetPath = pathname === '/' ? '/dashboard' : pathname;
        else if (isDocsSub) targetPath = pathname === '/' ? '/docs' : (pathname.startsWith('/docs') ? pathname : `/docs${pathname}`);

        return NextResponse.redirect(new URL(`https://${MAIN_DOMAIN}/${localePrefix}${targetPath}`, request.url));
    }

    // ─── 3. LOCALE DISCOVERY & MAIN DOMAIN REDIRECTS ────────────────────────
    const pathParts = pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0] ?? '';
    const localeMatch = firstSegment.match(/^([a-z]{2})-([a-z]{2})$/);
    const hasFullLocale = localeMatch && SUPPORTED_LOCALES.includes(localeMatch[1]) && VALID_REGIONS.has(localeMatch[2]);

    const ROOT_PATHS = ['/privacy', '/terms', '/cookie-policy', '/sitemap', '/robots.txt', '/sw.js', '/manifest.json'];
    const isRootPath = ROOT_PATHS.some(p => pathname.startsWith(p));

    if (!hasFullLocale && !isRootPath) {
        return NextResponse.redirect(new URL(`/${localePrefix}${pathname === '/' ? '' : pathname}`, request.url));
    }

    // ─── 4. AUTH & ROUTE PROTECTION ─────────────────────────────────────────
    const normalizedPath = hasFullLocale ? ('/' + pathParts.slice(1).join('/')) : pathname;
    const token = request.cookies.get('resume_forge_auth')?.value;
    let session = null;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            session = payload as any;
        } catch { session = null; }
    }

    const isAuthRoute = normalizedPath.startsWith('/login') || normalizedPath.startsWith('/signup');
    const isPublicRoute = normalizedPath === '/' || normalizedPath.startsWith('/privacy') || normalizedPath.startsWith('/terms') || normalizedPath.startsWith('/waitlist') || normalizedPath.startsWith('/posts') || normalizedPath.startsWith('/jobs') || normalizedPath.startsWith('/p/');

    if (!session && !isAuthRoute && !isPublicRoute) {
        return NextResponse.redirect(new URL(`/${localePrefix}/login`, request.url));
    }

    if (session) {
        if (session.isBlocked) {
            const res = NextResponse.redirect(new URL(`/${localePrefix}/login?error=AccountBlocked`, request.url));
            res.cookies.delete('resume_forge_auth');
            return res;
        }
        if (isAuthRoute) return NextResponse.redirect(new URL(`/${localePrefix}/dashboard`, request.url));
        if (normalizedPath.startsWith('/admin') && session.role !== 'admin') {
            return NextResponse.redirect(new URL(`/${localePrefix}/dashboard`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|locales|pdfjs-worker|.*\\.(?:svg|png|jpg|jpeg|gif|webp|xml|ico|js|mjs|css|map|txt|woff|woff2|ttf|otf|json)$).*)'],
};
