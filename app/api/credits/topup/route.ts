export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { BILLING_CONFIG } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const packId = (body.packId as string)?.toUpperCase();
    const pack = BILLING_CONFIG.topUpPacks[packId];

    if (!pack) {
      return NextResponse.json(
        { success: false, message: `Invalid top-up pack ID: ${packId}` },
        { status: 400 }
      );
    }

    const countryCode = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'IN';
    const isIndia = countryCode === 'IN';
    const currency = isIndia ? 'INR' : 'USD';

    let price = pack.priceInr;
    if (currency === 'USD') {
      price = Math.max(3, Math.round(price / 80));
    }
    const amountPaise = Math.round(price * 100);

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { success: false, message: 'Payment gateway configuration missing' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const receipt = `rf_topup_${session.userId.slice(0, 8)}_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt,
      notes: {
        userId: session.userId,
        packId: pack.id,
        credits: pack.credits.toString(),
        type: 'topup',
      },
    });

    const supabase = createClient();
    await supabase.from('orders').insert({
      user_id: session.userId,
      plan_name: pack.id,
      original_price: amountPaise,
      discount_amount: 0,
      amount: amountPaise,
      currency,
      country_code: countryCode,
      payment_gateway: 'razorpay',
      razorpay_order_id: order.id,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      pack: {
        id: pack.id,
        name: pack.name,
        credits: pack.credits,
        price,
        currencySymbol: isIndia ? '₹' : '$',
      },
    });
  } catch (error: any) {
    console.error('[API /api/credits/topup] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create top-up order' },
      { status: 500 }
    );
  }
}
