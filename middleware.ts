import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const MAIN_DOMAIN = 'resumeforgeai.in';

// EU country codes for region mapping
const EU_COUNTRIES = new Set([
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

const VALID_REGIONS = new Set(['in', 'us', 'eu']);
const SUPPORTED_LOCALES = ['en', 'hi', 'te', 'ta', 'ml', 'es', 'fr', 'de'];
const DEFAULT_LOCALE = 'en';
const DEFAULT_REGION = 'in';

const BOT_USER_AGENTS = [
    'googlebot',
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'slurp',
    'baiduspider',
    'ia_archiver',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkShare',
    'W3C_Validator',
    'redditbot',
    'Applebot',
    'Twitterbot',
    'Discordbot'
];

/** Map Vercel/CF country code to a region slug */
function countryToRegion(country: string | null): string | null {
    if (!country) return null;
    const c = country.toUpperCase();
    if (c === 'IN') return 'in';
    if (c === 'US') return 'us';
    if (EU_COUNTRIES.has(c)) return 'eu';
    return null;
}

function isBot(userAgent: string | null): boolean {
    if (!userAgent) return false;
    const lowerUA = userAgent.toLowerCase();
    return BOT_USER_AGENTS.some(bot => lowerUA.includes(bot));
}

function getLocale(request: NextRequest): string {
    // 1. Check for cookie
    const cookieLocale = request.cookies.get('preferred_lang')?.value;
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;

    // 2. Check Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
        const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().split('-')[0]);
        for (const lang of languages) {
            if (SUPPORTED_LOCALES.includes(lang)) return lang;
        }
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
    const host = request.headers.get('host') ?? '';
    const STATIC_FILE_EXTENSIONS = [
        '.svg', '.png', '.ico', '.jpg', '.jpeg', '.gif', '.webp', '.xml',
        '.js', '.mjs', '.css', '.map', '.txt', '.woff', '.woff2', '.ttf', '.otf', '.html', '.json'
    ];

    // Determine if this is a subdomain request
    const isAppSubdomain = host.startsWith('app.');
    const isApiSubdomain = host.startsWith('api.');
    const isAdminSubdomain = host.startsWith('admin.');
    const isDocsSubdomain = host.startsWith('docs.');
    const isSubdomain = isAppSubdomain || isApiSubdomain || isAdminSubdomain || isDocsSubdomain;

    // ─── Always pass through: static files, locales, and API routes early
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/') || // Skip all API routes immediately
        pathname === '/api' ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/locales') ||
        pathname.startsWith('/pdfjs-worker') ||
        STATIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext))
    ) {
        return NextResponse.next();
    }

    // ─── Locale Discovery ───
    const pathParts = pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0] ?? '';

    // Check for [lang]-[region] format, e.g., en-in
    const localeMatch = firstSegment.match(/^([a-z]{2})-([a-z]{2})$/);
    const hasFullLocale = localeMatch && SUPPORTED_LOCALES.includes(localeMatch[1]) && VALID_REGIONS.has(localeMatch[2]);
    
    // Check for legacy formats to redirect
    const isLegacyRegion = VALID_REGIONS.has(firstSegment);
    const secondSegment = pathParts[1] ?? '';
    const isLegacyLocale = SUPPORTED_LOCALES.includes(secondSegment);

    const userAgent = request.headers.get('user-agent');
    const isSearchBot = isBot(userAgent);

    // Get current locale and region (from path or defaults/cookies)
    let currentLocale = getLocale(request);
    let currentRegion = getRegion(request);

    if (hasFullLocale) {
        const [lang, region] = firstSegment.split('-');
        currentLocale = lang;
        currentRegion = region;
    }

    // List of paths that exist at the root level and should NOT be redirected
    const ROOT_LEVEL_PATHS = [
        '/api',
        '/sitemap',
        '/ai-resume-builder',
        '/ats-resume-builder',
        '/ai-mock-interview',
        '/job-interview-ai-coach',
        '/privacy',
        '/terms',
        '/robots.txt',
        '/favicon.ico',
        '/manifest.json',
        '/sw.js',
        '/locales',
        '/pdfjs-worker',
        '/portfolio',
        '/preview'
    ];

    const isRootLevelPath = ROOT_LEVEL_PATHS.some(p => pathname.startsWith(p));

    // 1. Redirect legacy /in/en/* to /en-in/*
    if (isLegacyRegion && isLegacyLocale) {
        const url = new URL(request.url);
        url.pathname = `/${secondSegment}-${firstSegment}${pathname.replace(`/${firstSegment}/${secondSegment}`, '') || '/'}`.replace(/\/+/g, '/');
        return NextResponse.redirect(url);
    }

    // 2. Redirect legacy /in/* or /en/* to default locale-region/*
    if (!hasFullLocale && !isRootLevelPath && !isApiSubdomain && !isAdminSubdomain) {
        if (!isSearchBot || pathname === '/') {
            const url = new URL(request.url);
            const targetLocale = `${currentLocale}-${currentRegion}`;

            let newPath = pathname;
            if (isLegacyRegion) {
                newPath = `/${currentLocale}-${firstSegment}${pathname.replace(`/${firstSegment}`, '') || '/'}`;
            } else if (SUPPORTED_LOCALES.includes(firstSegment)) {
                newPath = `/${firstSegment}-${currentRegion}${pathname.replace(`/${firstSegment}`, '') || '/'}`;
            } else {
                newPath = `/${targetLocale}${pathname}`;
            }

            url.pathname = newPath.replace(/\/+/g, '/');
            return NextResponse.redirect(url);
        }
    }

    // ─── Normalized path for internal logic ───
    let normalizedPath = pathname;
    if (hasFullLocale) {
        normalizedPath = '/' + pathParts.slice(1).join('/');
    }

    // ─── API subdomain: rewrite to /api/* and add CORS headers ───────────────
    if (isApiSubdomain) {
        const nextUrl = request.nextUrl.clone();
        if (!pathname.startsWith('/api')) {
            nextUrl.pathname = `/api${pathname}`;
        }
        const response = NextResponse.rewrite(nextUrl);
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

        if (request.method === 'OPTIONS') {
            return new NextResponse(null, { status: 204, headers: response.headers });
        }
        return response;
    }

    // ─── Docs subdomain: rewrite to /[locale]/docs ────────────────────────────
    if (isDocsSubdomain) {
        const localePrefix = `${currentLocale}-${currentRegion}`;
        let targetPath = pathname;
        
        // If pathname already starts with a valid locale-region, strip it for internal routing
        const pathParts = pathname.split('/').filter(Boolean);
        const firstSegment = pathParts[0] ?? '';
        const localeMatch = firstSegment.match(/^([a-z]{2})-([a-z]{2})$/);
        const hasLocaleInPath = localeMatch && SUPPORTED_LOCALES.includes(localeMatch[1]) && VALID_REGIONS.has(localeMatch[2]);
        
        if (hasLocaleInPath) {
            targetPath = '/' + pathParts.slice(1).join('/');
        }

        const nextUrl = request.nextUrl.clone();
        const finalPath = `/${localePrefix}/docs${targetPath === '/' ? '' : targetPath}`;
        nextUrl.pathname = finalPath.replace(/\/+/g, '/');
        return NextResponse.rewrite(nextUrl);
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
    // ─── Admin subdomain: Redirect to main domain ──────────────────────────────
    if (isAdminSubdomain) {
        let subRoute = pathname === '/' ? '/admin' : pathname;
        if (!subRoute.startsWith('/admin')) {
            subRoute = `/admin${subRoute}`;
        }
        return NextResponse.redirect(new URL(`https://www.resumeforgeai.in/${currentLocale}-${currentRegion}${subRoute}`, request.url));
    }

    // ─── App subdomain ────────────────────────────────────────────────────────
    // ─── App subdomain: Redirect to main dashboard ────────────────────────────
    if (isAppSubdomain) {
        let targetPath = pathname === '/' ? '/dashboard' : pathname;
        return NextResponse.redirect(new URL(`https://www.resumeforgeai.in/${currentLocale}-${currentRegion}${targetPath}`, request.url));
    }

    // ─── Main domain: handle regional subfolders + geo detection ─────────────
    const isApiRoute = normalizedPath.startsWith('/api');
    if (isApiRoute) {
        return NextResponse.next();
    }

    // Standard auth logic for main domain
    const isRegionalPath = hasFullLocale;

    // ─── Geo suggestion cookie logic (main domain homepage only) ─────────────
    if (!isRegionalPath && normalizedPath === '/') {
        const regionCookie = request.cookies.get('region')?.value;

        if (!regionCookie) {
            const countryCode =
                request.headers.get('x-vercel-ip-country') ||
                request.headers.get('cf-ipcountry');
            const suggestedRegion = countryToRegion(countryCode);

            if (suggestedRegion) {
                const response = NextResponse.next();
                response.cookies.set('geo_country', countryCode ?? '', {
                    path: '/',
                    maxAge: 3600,
                    httpOnly: false,
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
    const isAuthRoute = normalizedPath.startsWith('/login') || normalizedPath.startsWith('/signup');
    const isPublicRoute =
        normalizedPath === '/' ||
        isRegionalPath ||
        normalizedPath.startsWith('/privacy') ||
        normalizedPath.startsWith('/terms') ||
        normalizedPath.startsWith('/cookie-policy') ||
        normalizedPath.startsWith('/data-deletion') ||
        normalizedPath.startsWith('/ai-resume-builder') ||
        normalizedPath.startsWith('/ats-resume-builder') ||
        normalizedPath.startsWith('/ai-mock-interview') ||
        normalizedPath.startsWith('/job-interview-ai-coach') ||
        normalizedPath.startsWith('/jobforgeai') ||
        normalizedPath.startsWith('/sitemap') ||
        normalizedPath.startsWith('/knowledge') ||
        normalizedPath.startsWith('/posts') ||
        normalizedPath.startsWith('/jobs') ||
        normalizedPath.startsWith('/job/') ||
        normalizedPath.startsWith('/companies/') ||
        normalizedPath.startsWith('/p/') ||
        normalizedPath.startsWith('/portfolio/') ||
        normalizedPath.startsWith('/preview/');
    const isCompleteProfile = normalizedPath === '/complete-profile';

    if (!session && !isAuthRoute && !isPublicRoute && !isCompleteProfile) {
        return NextResponse.redirect(new URL(`/${currentLocale}-${currentRegion}/login`, request.url));
    }

    if (session) {
        if (session.isBlocked) {
            const res = NextResponse.redirect(new URL(`/${currentLocale}-${currentRegion}/login?error=AccountBlocked`, request.url));
            res.cookies.delete('resume_forge_auth');
            return res;
        }

        const profileIncomplete = !session.profileCompleted;
        if (profileIncomplete && !isCompleteProfile && !isAuthRoute && !isPublicRoute) {
            return NextResponse.redirect(new URL(`/${currentLocale}-${currentRegion}/complete-profile`, request.url));
        }

        if (!profileIncomplete && isCompleteProfile) {
            return NextResponse.redirect(new URL(`/${currentLocale}-${currentRegion}/dashboard`, request.url));
        }

        if (normalizedPath.startsWith('/admin') && session.role !== 'admin') {
            return NextResponse.redirect(new URL(`/${currentLocale}-${currentRegion}/dashboard`, request.url));
        }

        if (isAuthRoute) {
            if (profileIncomplete) return NextResponse.redirect(new URL(`/${currentLocale}-${currentRegion}/complete-profile`, request.url));
            return NextResponse.redirect(new URL(`/${currentLocale}-${currentRegion}/dashboard`, request.url));
        }
    }

    const response = NextResponse.next();

    // ─── Update preference cookies if user is on a regional path ──────────
    if (hasFullLocale && !isApiRoute) {
        const cookieRegion = request.cookies.get('preferred_region')?.value;
        const cookieLang = request.cookies.get('preferred_lang')?.value;

        if (cookieRegion !== currentRegion) {
            response.cookies.set('preferred_region', currentRegion, {
                path: '/',
                maxAge: 31536000,
                sameSite: 'lax',
            });
        }
        if (cookieLang !== currentLocale) {
            response.cookies.set('preferred_lang', currentLocale, {
                path: '/',
                maxAge: 31536000,
                sameSite: 'lax',
            });
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|locales|pdfjs-worker|.*\\.(?:svg|png|jpg|jpeg|gif|webp|xml|ico|js|mjs|css|map|txt|woff|woff2|ttf|otf|json)$).*)',
    ],
};
