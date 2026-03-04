import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

type PlanName = 'PRO' | 'PREMIUM' | 'CAREER';

const PLAN_PRICES: Record<PlanName, number> = {
    PRO: 29,
    PREMIUM: 199,
    CAREER: 499,
};

/**
 * POST /api/payment/create-order
 *
 * Body:
 *   plan         — 'PRO' | 'PREMIUM' | 'CAREER'
 *   coupon_code? — optional validated coupon code to apply discount
 *
 * Flow:
 *   1. Look up plan base price
 *   2. If coupon_code provided → re-validate it server-side and compute discount
 *   3. finalAmount = max(0, basePrice - discountAmount)
 *   4. Create Razorpay order for finalAmount
 *   5. Store order row with original_price, coupon_code, discount_amount, final_amount
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const planName = (body.plan as string)?.toUpperCase() as PlanName;
        const couponCode: string = (body.coupon_code ?? '').trim().toUpperCase();

        if (!planName || !PLAN_PRICES[planName]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const basePrice = PLAN_PRICES[planName]; // INR
        let discountAmount = 0;
        let validatedCouponCode: string | null = null;

        // ── Server-side coupon re-validation ───────────────────────────────
        if (couponCode) {
            const supabase = createClient();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: coupon } = await (supabase as any)
                .from('coupons')
                .select('id, type, value, expires_at, max_uses, used_count, is_active')
                .eq('code', couponCode)
                .eq('is_active', true)
                .single() as {
                    data: {
                        id: string; type: string; value: number;
                        expires_at: string | null; max_uses: number | null;
                        used_count: number; is_active: boolean;
                    } | null
                };

            if (coupon) {
                const now = new Date();
                const expired = coupon.expires_at && new Date(coupon.expires_at) < now;
                const limitReached = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;

                if (!expired && !limitReached) {
                    if (coupon.type === 'full') {
                        discountAmount = basePrice;
                    } else if (coupon.type === 'fixed') {
                        discountAmount = Math.min(coupon.value, basePrice);
                    } else {
                        // percentage
                        const pct = Math.min(coupon.value, 100);
                        discountAmount = Math.round((basePrice * pct) / 100);
                    }
                    validatedCouponCode = couponCode;
                }
            }
        }
        // ───────────────────────────────────────────────────────────────────

        const finalPrice = Math.max(0, basePrice - discountAmount); // INR

        // If coupon makes it truly ₹0 → should use activate-coupon path, not Razorpay
        // Return early to signal frontend to switch path
        if (finalPrice === 0) {
            return NextResponse.json({
                isFree: true,
                message: 'Coupon makes total ₹0 — use activate-coupon endpoint',
            }, { status: 200 });
        }

        const amountPaise = finalPrice * 100;
        const receipt = `rcpt_${session.userId.slice(0, 8)}_${Date.now()}`;

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt,
        });

        // Store order in DB with full pricing breakdown
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('orders').insert({
            user_id: session.userId,
            plan_name: planName,
            // Pricing breakdown
            original_price: basePrice * 100,     // paise
            coupon_code: validatedCouponCode,
            discount_amount: discountAmount * 100, // paise
            amount: amountPaise,                  // final amount in paise
            razorpay_order_id: order.id,
            status: 'pending',
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,         // paise — what Razorpay shows
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            // Extra info for UI display confirmation
            originalPrice: basePrice,
            discountAmount,
            finalPrice,
            couponApplied: validatedCouponCode,
        });
    } catch (err) {
        console.error('[create-order] Error:', err);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
