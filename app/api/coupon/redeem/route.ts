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
                id: string; code: string; type: string;
                value: number; expires_at: string | null;
                max_uses: number | null; used_count: number; is_active: boolean;
            } | null
        };

    if (!coupon) {
        return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
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

    // 4. Special Case: LAUNCH100 - Free 6-Month Pro Access
    if (normalizedCode === 'LAUNCH100') {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 6);

        // Update User directly (Source of Truth for access check)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('users')
            .update({
                plan: 'pro',
                access_expires_at: expiresAt.toISOString(),
                is_free_override: true // persistent fallback
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any)
            .eq('id', session.userId);

        // Record in subscriptions table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('subscriptions')
            .insert({
                user_id: session.userId,
                plan: 'pro',
                status: 'active',
                expires_at: expiresAt.toISOString(),
                coupon_code: 'LAUNCH100',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

        return NextResponse.json({
            valid: true,
            access_granted: true,
            unlock_all: true,
            expires_in: "6 months",
            message: "🎉 Free 6-Month Pro Access Activated",
        });
    }

    // 5. If full access (100% or type=full): create active subscription
    const isFullAccess = coupon.type === 'full' || coupon.value >= 100;

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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

        // Also mark user as having override for persistence
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('users')
            .update({ is_free_override: true })
            .eq('id', session.userId);

        return NextResponse.json({
            valid: true,
            discount: 100,
            unlock_all: true,
            message: "100% discount applied — Full access unlocked.",
        });
    }

    // Partial discount — just confirm valid
    return NextResponse.json({
        valid: true,
        discount: coupon.value || 0,
        unlock_all: false,
        message: `Coupon valid! ${coupon.value}% discount applied.`,
    });
}
