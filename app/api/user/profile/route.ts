import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/profile — Returns the current user's name and email
 * Used by the support page to pre-fill form fields.
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();
        const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', session.userId)
            .single();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            email: user.email ?? null,
            name: user.full_name ?? null,
        });
    } catch (err) {
        console.error('[user/profile] Error:', err);
        return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
    }
}
