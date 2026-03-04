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

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const planName = (body.plan as string)?.toUpperCase() as PlanName;

        if (!planName || !PLAN_PRICES[planName]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const amount = PLAN_PRICES[planName] * 100; // paise
        const receipt = `rcpt_${session.userId.slice(0, 8)}_${Date.now()}`;

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt,
        });

        // Store pending order in DB
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('orders').insert({
            user_id: session.userId,
            plan_name: planName,
            amount,
            razorpay_order_id: order.id,
            status: 'pending',
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error('[create-order] Error:', err);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
