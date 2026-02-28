import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { addMonths } from 'date-fns';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();

    // Verify admin calling
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUserId = params.id;
    if (!targetUserId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        // Log action
        await supabase.from('admin_logs').insert({
            admin_id: session.userId,
            action: 'upgrade_user',
            target_id: targetUserId,
            metadata: { duration: '1 month' }
        });

        const expiresAt = addMonths(new Date(), 1).toISOString();

        // Check if subscription exists
        const { data: existingSub } = await supabase.from('subscriptions').select('id').eq('user_id', targetUserId).single();

        let writeError;

        if (existingSub) {
            // update existing
            const { error: updateError } = await supabase.from('subscriptions').update({
                plan: 'pro',
                status: 'active',
                expires_at: expiresAt
            }).eq('user_id', targetUserId);
            writeError = updateError;
        } else {
            // insert new
            const { error: insertError } = await supabase.from('subscriptions').insert({
                user_id: targetUserId,
                plan: 'pro',
                status: 'active',
                expires_at: expiresAt
            });
            writeError = insertError;
        }

        if (writeError) throw writeError;

        return NextResponse.json({ success: true, message: 'User upgraded to Pro' });

    } catch (error: unknown) { const e = error as Error;
        console.error('API Error:', e);
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
