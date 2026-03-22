import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

type PlanName = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PRO';

const PLAN_PRICES: Record<PlanName, number> = {
    DAILY: 29,
    WEEKLY: 79,
    MONTHLY: 199,
    PRO: 499,
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

        // ── 1. Detect Country and Set Currency ──────────────────────────────
        // Priority: Vercel header > Cloudflare header > Browser query > Fallback
        const countryCode = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'IN';
        const isIndia = countryCode === 'IN';
        const currency = isIndia ? 'INR' : 'USD';

        // ── 2. Determine Pricing ──────────────────────────────────────────
        // Career: 499 INR or 6 USD
        const CURRENCY_PRICES: Record<string, Record<PlanName, number>> = {
            INR: { DAILY: 29, WEEKLY: 79, MONTHLY: 199, PRO: 499 },
            USD: { DAILY: 1.5, WEEKLY: 3, MONTHLY: 7, PRO: 15 }
        };


        const basePrice = CURRENCY_PRICES[currency][planName] || CURRENCY_PRICES['INR'][planName];
        let discountAmount = 0;
        let validatedCouponCode: string | null = null;

        // ── 3. Server-side coupon re-validation ─────────────────────────────
        if (couponCode) {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: coupon } = await (supabase as any)
                .from('coupons')
                .select('id, type, value, plan_type, expires_at, max_uses, used_count, is_active')
                .eq('code', couponCode)
                .eq('is_active', true)
                .single();

            if (coupon) {
                const now = new Date();
                const expired = coupon.expires_at && new Date(coupon.expires_at) < now;
                const limitReached = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;
                const planMatch = coupon.plan_type === 'all' || coupon.plan_type === planName.toLowerCase();

                if (!expired && !limitReached && planMatch) {
                    if (coupon.type === 'full') {
                        discountAmount = basePrice;
                    } else if (coupon.type === 'fixed') {
                        discountAmount = Math.min(coupon.value, basePrice);
                    } else {
                        const pct = Math.min(coupon.value, 100);
                        discountAmount = Math.round((basePrice * pct) / 100);
                    }
                    validatedCouponCode = couponCode;
                }
            }
        }

        const finalPrice = Math.max(0, basePrice - discountAmount);
        const amountPaise = Math.round(finalPrice * 100); // Razorpay expects subunits

        // If coupon makes it ₹0/$0
        if (finalPrice === 0) {
            return NextResponse.json({
                isFree: true,
                message: 'Coupon makes total 0 — use activate-coupon endpoint',
            }, { status: 200 });
        }

        const receipt = `rcpt_${session.userId.slice(0, 8)}_${Date.now()}`;

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // ── 4. Create Razorpay Order ──────────────────────────────────────
        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: currency, // INR or USD
            receipt,
            notes: {
                userId: session.userId,
                planName,
                country: countryCode
            }
        });

        // ── 5. Store order in DB ──────────────────────────────────────────
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('orders').insert({
            user_id: session.userId,
            plan_name: planName,
            original_price: Math.round(basePrice * 100),
            coupon_code: validatedCouponCode,
            discount_amount: Math.round(discountAmount * 100),
            amount: amountPaise,
            currency,
            country_code: countryCode,
            payment_gateway: 'razorpay',
            razorpay_order_id: order.id,
            status: 'pending',
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            // UI helper info
            originalPrice: basePrice,
            discountAmount,
            finalPrice,
            currencySymbol: isIndia ? '₹' : '$',
            couponApplied: validatedCouponCode,
            country: countryCode
        });
    } catch (err) {
        console.error('[create-order] Error:', err);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
