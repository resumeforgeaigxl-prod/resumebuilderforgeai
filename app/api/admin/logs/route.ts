export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const admin = createAdminClient();

        // Primary: fetch from new audit_logs table (platform-wide user events)
        const { data: auditLogs, error: auditErr } = await admin
            .from('audit_logs')
            .select('id, user_id, action, metadata, created_at')
            .order('created_at', { ascending: false })
            .limit(100);

        // Secondary: fetch from admin_logs (admin panel actions) if available
        const { data: adminLogs } = await admin
            .from('admin_logs')
            .select('id, action, target_id, metadata, created_at, admin_id, users(email)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (auditErr) throw auditErr;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedAudit = (auditLogs || []).map((l: any) => ({
            id: l.id,
            action: l.action,
            target_id: l.user_id,
            metadata: l.metadata,
            created_at: l.created_at,
            admin_email: 'User Event',
            source: 'audit'
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedAdmin = (adminLogs || []).map((l: any) => ({
            id: l.id,
            action: l.action,
            target_id: l.target_id,
            metadata: l.metadata,
            created_at: l.created_at,
            admin_email: (Array.isArray(l.users) ? l.users[0]?.email : l.users?.email) || 'Admin',
            source: 'admin'
        }));

        // Merge and sort by date desc
        const merged = [...formattedAudit, ...formattedAdmin]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 150);

        return NextResponse.json({ success: true, logs: merged });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

