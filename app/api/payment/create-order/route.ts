export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { BILLING_CONFIG, PlanId } from '@/lib/billing';

type PlanName =
    | 'STARTER' | 'SEARCH' | 'PRO' | 'AGENT' | 'AUTOPILOT'
    | 'TOPUP_75' | 'TOPUP_175' | 'TOPUP_350' | 'TOPUP_550'
    | 'DAILY' | 'DAILY_STANDARD' | 'DAILY_ALL_ACCESS'
    | 'WEEKLY' | 'WEEKLY_STANDARD' | 'WEEKLY_ALL_ACCESS'
    | 'MONTHLY' | 'MONTHLY_STANDARD' | 'MONTHLY_ALL_ACCESS'
    | 'PROFESSIONAL' | 'PRO_STANDARD' | 'PRO_ALL_ACCESS';

const PLAN_PRICES: Record<string, number> = {
    // Canonical Level 11 Plans
    STARTER: BILLING_CONFIG.plans.STARTER.priceInr,
    SEARCH: BILLING_CONFIG.plans.SEARCH.priceInr,
    PRO: BILLING_CONFIG.plans.PRO.priceInr,
    AGENT: BILLING_CONFIG.plans.AGENT.priceInr,
    AUTOPILOT: BILLING_CONFIG.plans.AUTOPILOT.priceInr,
    // Canonical Level 11 Top-ups
    TOPUP_75: BILLING_CONFIG.topUpPacks.TOPUP_75.priceInr,
    TOPUP_175: BILLING_CONFIG.topUpPacks.TOPUP_175.priceInr,
    TOPUP_350: BILLING_CONFIG.topUpPacks.TOPUP_350.priceInr,
    TOPUP_550: BILLING_CONFIG.topUpPacks.TOPUP_550.priceInr,
    // Legacy support
    DAILY: 29, DAILY_STANDARD: 29, DAILY_ALL_ACCESS: 49,
    WEEKLY: 79, WEEKLY_STANDARD: 79, WEEKLY_ALL_ACCESS: 129,
    MONTHLY: 199, MONTHLY_STANDARD: 199, MONTHLY_ALL_ACCESS: 399,
    PROFESSIONAL: 499, PRO_STANDARD: 499, PRO_ALL_ACCESS: 899,
};

/**
 * POST /api/payment/create-order
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const planName = (body.plan as string)?.toUpperCase();
        const couponCode: string = (body.coupon_code ?? '').trim().toUpperCase();

        if (!planName || !PLAN_PRICES[planName]) {
            return NextResponse.json({ error: 'Invalid plan or top-up pack' }, { status: 400 });
        }

        // ── 1. Detect Country and Set Currency ──────────────────────────────
        const countryCode = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'IN';
        const isIndia = countryCode === 'IN';
        const currency = isIndia ? 'INR' : 'USD';

        // ── 2. Determine Pricing ──────────────────────────────────────────
        let basePrice = PLAN_PRICES[planName];
        if (currency === 'USD') {
            basePrice = Math.max(2, Math.round(basePrice / 80));
        }
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
                const planMatch =
                    coupon.plan_type === 'all' ||
                    coupon.plan_type === planName.toLowerCase() ||
                    planName.toLowerCase().startsWith(coupon.plan_type + '_');

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


