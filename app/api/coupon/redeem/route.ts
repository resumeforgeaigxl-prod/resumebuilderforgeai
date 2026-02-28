import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await request.json();
    if (!code?.trim()) {
        return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const supabase = createClient();
    const normalizedCode = code.trim().toUpperCase();

    // 1. Validate coupon
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: coupon } = await (supabase as any)
        .from('coupons')
        .select('*')
        .eq('code', normalizedCode)
        .eq('is_active', true)
        .single() as {
            data: {
                id: string; code: string; discount_type: string;
                discount_value: number; valid_until: string | null;
                max_uses: number | null; used_count: number; is_active: boolean;
            } | null
        };

    if (!coupon) {
        return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    // Check expiry
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 410 });
    }

    // Check max uses
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 410 });
    }

    // 2. Check if user already redeemed this code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
        .from('subscriptions')
        .select('id')
        .eq('user_id', session.userId)
        .eq('coupon_code', normalizedCode)
        .limit(1)
        .single() as { data: { id: string } | null };

    if (existing) {
        return NextResponse.json({ error: 'You have already used this coupon' }, { status: 409 });
    }

    // 3. Increment used_count atomically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', coupon.id);

    // 4. If full access (100% or type=full): create active subscription
    const isFullAccess = coupon.discount_type === 'full' || coupon.discount_value >= 100;

    if (isFullAccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('subscriptions')
            .insert({
                user_id: session.userId,
                plan: 'pro',
                status: 'active',
                expires_at: null, // permanent via coupon
                coupon_code: normalizedCode,
            });

        return NextResponse.json({
            success: true,
            hasFullAccess: true,
            message: `🎉 Coupon applied! You now have full access — no watermark on your PDFs.`,
        });
    }

    // Partial discount — just confirm valid (user can use it at checkout later)
    return NextResponse.json({
        success: true,
        hasFullAccess: false,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        message: `Coupon valid! ${coupon.discount_value}${coupon.discount_type === 'percent' ? '%' : '₹'} discount applied.`,
    });
}
