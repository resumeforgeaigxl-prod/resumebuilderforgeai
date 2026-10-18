export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { CreditService } from '@/lib/billing';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const [balance, entitlements] = await Promise.all([
      CreditService.getBalance(session.userId),
      CreditService.getUserEntitlements(session.userId),
    ]);

    return NextResponse.json({
      success: true,
      balance,
      entitlements,
    });
  } catch (error: any) {
    console.error('[API /api/credits/balance] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch credit balance' },
      { status: 500 }
    );
  }
}
