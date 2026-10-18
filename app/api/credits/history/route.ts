export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { CreditService } from '@/lib/billing';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const ledger = await CreditService.getLedger(session.userId, { limit, offset });

    return NextResponse.json({
      success: true,
      count: ledger.length,
      ledger,
    });
  } catch (error: any) {
    console.error('[API /api/credits/history] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch credit transaction history' },
      { status: 500 }
    );
  }
}
