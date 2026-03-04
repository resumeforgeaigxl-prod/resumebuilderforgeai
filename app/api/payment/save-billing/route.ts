import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            full_name,
            email,
            phone,
            country,
            state,
            city,
            zip_code,
            address,
            company_name,
            latitude,
            longitude,
        } = body;

        if (!full_name || !email) {
            return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
        }

        // Extract real IP address
        const forwarded = req.headers.get('x-forwarded-for');
        const ip_address = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') ?? null;

        const supabase = createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('billing_details').insert({
            user_id: session.userId,
            full_name,
            email,
            phone: phone || null,
            country: country || null,
            state: state || null,
            city: city || null,
            zip_code: zip_code || null,
            address: address || null,
            company_name: company_name || null,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            ip_address,
        });

        if (error) {
            console.error('[save-billing] DB error:', error);
            return NextResponse.json({ error: 'Failed to save billing details' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[save-billing] Error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
