export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { PricingService } from '@/lib/pricing/service';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const status = await PricingService.getUserAccess(session.userId);

        return NextResponse.json({
            planId: status.plan.id,
            creditsRemaining: status.creditsRemaining,
            jobViewsRemaining: status.jobViewsRemaining,
        });

    } catch (err: unknown) {
        console.error('[Pricing Status API Error]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

