export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const CURRENCY_PRICES: Record<string, Record<string, number>> = {
    INR: { 
        daily: 29, 
        weekly: 79, 
        monthly: 199, 
        pro: 499 
    },
    USD: { 
        daily: 1.5, 
        weekly: 3, 
        monthly: 7, 
        pro: 15 
    }
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

