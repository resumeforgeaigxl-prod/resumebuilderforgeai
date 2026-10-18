export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { CreditService, BILLING_CONFIG, type BillableAction } from '@/lib/billing';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action parameter is required' },
        { status: 400 }
      );
    }

    const isFree = BILLING_CONFIG.freeActions.includes(action as any);
    const cost = isFree ? 0 : (BILLING_CONFIG.actionCosts[action] ?? 0);

    const session = await getSession();
    let canAfford = true;
    let available = 0;

    if (session?.userId && cost > 0) {
      const affordRes = await CreditService.canAfford(session.userId, action as BillableAction);
      canAfford = affordRes.allowed;
      available = affordRes.available;
    }

    return NextResponse.json({
      success: true,
      action,
      cost,
      isFree,
      canAfford,
      availableBalance: available,
    });
  } catch (error: any) {
    console.error('[API /api/credits/preview] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to preview action credit cost' },
      { status: 500 }
    );
  }
}
