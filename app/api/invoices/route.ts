export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

/**
 * GET /api/invoices
 * Returns all invoices for the logged-in user.
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('invoices')
            .select('id, invoice_number, plan, amount, payment_method, coupon_code, created_at, status, invoice_url')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false }) as {
                data: {
                    id: string; invoice_number: string; plan: string;
                    amount: number; payment_method: string;
                    coupon_code: string | null; created_at: string;
                    status: string; invoice_url: string | null;
                }[] | null;
                error: unknown;
            };

        if (error) throw error;

        return NextResponse.json({ success: true, invoices: data ?? [] });
    } catch (err) {
        console.error('[GET /api/invoices]', err);
        return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 });
    }
}

