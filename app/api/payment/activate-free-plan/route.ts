import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { activateUserPlan, PlanName } from '@/lib/plan-activation';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json() as { plan?: string; coupon_code?: string };
        const { plan, coupon_code } = body;

        if (!plan) {
            return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
        }

        const supabase = createClient();
        
        // 1. Re-validate coupon server-side for ₹0 amount
        const { data: coupon } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', coupon_code)
            .eq('is_active', true)
            .single();

        if (!coupon || coupon.type !== 'full') {
             return NextResponse.json({ error: 'Invalid coupon for free activation' }, { status: 400 });
        }

        // 2. Activate Plan
        await activateUserPlan(session.userId, plan.toUpperCase() as PlanName, `coupon_${coupon_code}`);

        // 3. Mark coupon as used
        await supabase.rpc('increment_coupon_used', { p_code: coupon_code });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[activate-free-plan] Error:', err);
        return NextResponse.json({ error: 'Activation failed' }, { status: 500 });
    }
}
