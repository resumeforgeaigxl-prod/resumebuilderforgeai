export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

/**
 * POST /api/payment/validate-coupon
 * Validates a coupon and returns precise discount info.
 * Does NOT consume (increment used_count) — that happens at activation.
 *
 * Discount logic:
 *   type = 'percentage' → discount = price * value / 100
 *   type = 'fixed'      → discount = value  (flat INR deduction)
 *   type = 'full'       → discount = price  (100% free)
 *   value >= 100 with type = 'percentage' → treated as full
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const code: string = (body.code ?? '').trim().toUpperCase();
        const planPrice: number = Number(body.plan_price ?? 0);
        const selectedPlan: string = (body.plan_name ?? '').toLowerCase();

        if (!code) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        const supabase = createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: coupon } = await (supabase as any)
            .from('coupons')
            .select('id, code, type, value, plan_type, expires_at, max_uses, used_count, is_active')
            .eq('code', code)
            .eq('is_active', true)
            .single() as {
                data: {
                    id: string; code: string; type: string;
                    value: number; plan_type: string; expires_at: string | null;
                    max_uses: number | null; used_count: number; is_active: boolean;
                } | null
            };

        if (!coupon) {
            return NextResponse.json({ valid: false, error: 'Invalid or inactive coupon code' }, { status: 200 });
        }

        // Plan-specific validation
        if (coupon.plan_type !== 'all' && coupon.plan_type !== selectedPlan) {
            return NextResponse.json({ valid: false, error: 'This coupon is not valid for this plan.' }, { status: 200 });
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return NextResponse.json({ valid: false, error: 'This coupon has expired' }, { status: 200 });
        }

        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' }, { status: 200 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: alreadyUsed } = await (supabase as any)
            .from('subscriptions')
            .select('id')
            .eq('user_id', session.userId)
            .eq('coupon_code', code)
            .limit(1)
            .single() as { data: { id: string } | null };

        if (alreadyUsed) {
            return NextResponse.json({ valid: false, error: 'You have already used this coupon' }, { status: 200 });
        }

        // ── Discount calculation ──────────────────────────────────────────────
        let discountAmount: number;
        let discountLabel: string;

        if (coupon.type === 'full') {
            discountAmount = planPrice;          // 100% off — plan is free
            discountLabel = '100% off';
        } else if (coupon.type === 'fixed') {
            discountAmount = Math.min(coupon.value, planPrice); // flat INR, capped at price
            discountLabel = `₹${coupon.value} off`;
        } else {
            // 'percentage' (or legacy default)
            const pct = Math.min(coupon.value, 100);
            discountAmount = Math.round((planPrice * pct) / 100);
            discountLabel = `${pct}% off`;
        }

        const finalPrice = Math.max(0, planPrice - discountAmount);
        const isFree = finalPrice === 0;

        return NextResponse.json({
            valid: true,
            code: coupon.code,
            couponType: coupon.type,
            discountAmount,
            discountLabel,
            finalPrice,
            isFree,
            message: isFree
                ? `${discountLabel} — plan will be activated for free!`
                : `${discountLabel} — you save ₹${discountAmount}`,
        });
    } catch (err) {
        console.error('[validate-coupon] Error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}


