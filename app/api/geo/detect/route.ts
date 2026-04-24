export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EU_COUNTRIES = new Set([
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

const REGION_META: Record<string, { label: string; flag: string; hreflang: string }> = {
    IN: { label: 'India', flag: '🇮🇳', hreflang: 'en-in' },
    US: { label: 'United States', flag: '🇺🇸', hreflang: 'en-us' },
    EU: { label: 'Europe', flag: '🇪🇺', hreflang: 'en-eu' },
};

export async function GET(request: NextRequest) {
    const country =
        request.headers.get('x-vercel-ip-country') ||
        request.headers.get('cf-ipcountry') ||
        null;

    if (!country) {
        return NextResponse.json({ country: null, suggestedRegion: null, regionLabel: null });
    }

    const c = country.toUpperCase();
    let regionSlug: string | null = null;
    let regionKey: string | null = null;

    if (c === 'IN') {
        regionSlug = 'in';
        regionKey = 'IN';
    } else if (c === 'US') {
        regionSlug = 'us';
        regionKey = 'US';
    } else if (EU_COUNTRIES.has(c)) {
        regionSlug = 'eu';
        regionKey = 'EU';
    }

    const meta = regionKey ? REGION_META[regionKey] : null;

    return NextResponse.json({
        country: c,
        suggestedRegion: regionSlug,
        regionLabel: meta ? `${meta.label} ${meta.flag}` : null,
        hreflang: meta?.hreflang ?? null,
    });
}


