import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CURRENCY_PRICES: Record<string, Record<string, number>> = {
    INR: { pro: 29, premium: 199, career: 499 },
    USD: { pro: 1, premium: 3, career: 6 }
};

export async function GET(req: NextRequest) {
    const countryCode = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'IN';
    const isIndia = countryCode === 'IN';
    const currency = isIndia ? 'INR' : 'USD';
    const symbol = isIndia ? '₹' : '$';

    return NextResponse.json({
        countryCode,
        currency,
        symbol,
        prices: CURRENCY_PRICES[currency]
    });
}
