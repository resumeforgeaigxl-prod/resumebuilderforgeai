export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serverClient = createServerClient();

    // Verify admin calling
    const { data: adminUser } = await serverClient.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUserId = params.id;
    if (!targetUserId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        // Log action
        await serverClient.from('admin_logs').insert({
            admin_id: session.userId,
            action: 'delete_user',
            target_id: targetUserId
        });

        // Initialize Supabase Admin Client using SERVICE_ROLE_KEY to bypass RLS and Auth rules
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Delete user directly from auth.users (cascades down to profiles, resumes, etc. due to schema ON DELETE CASCADE)
        const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

        if (error) {
            console.error('Supabase Admin Delete Error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'User deleted permanently' });

    } catch (error: unknown) {
        const e = error as Error;
        console.error('API Error:', e);
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
