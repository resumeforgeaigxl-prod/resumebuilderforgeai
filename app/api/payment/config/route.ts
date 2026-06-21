export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const CURRENCY_PRICES: Record<string, Record<string, number>> = {
    INR: { 
        daily: 29, 
        daily_standard: 29, 
        daily_all_access: 49,
        weekly: 79, 
        weekly_standard: 79, 
        weekly_all_access: 129,
        monthly: 199, 
        monthly_standard: 199, 
        monthly_all_access: 399,
        pro: 499,
        pro_standard: 499, 
        pro_all_access: 899,
        professional: 499,
        professional_standard: 499,
        professional_all_access: 899
    },
    USD: { 
        daily: 1.5, 
        daily_standard: 1.5, 
        daily_all_access: 2.5,
        weekly: 3, 
        weekly_standard: 3, 
        weekly_all_access: 5,
        monthly: 7, 
        monthly_standard: 7, 
        monthly_all_access: 14,
        pro: 15,
        pro_standard: 15, 
        pro_all_access: 28,
        professional: 15,
        professional_standard: 15,
        professional_all_access: 28
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

