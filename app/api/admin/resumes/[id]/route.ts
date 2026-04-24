export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        await supabase.from('admin_logs').insert({
            admin_id: session.userId,
            action: 'delete_resume',
            target_id: params.id
        });

        // Try deleting from standard resumes
        let { error, count } = await supabase.from('resumes').delete({ count: 'exact' }).eq('id', params.id);

        // If not found in standard resumes, try optimized_resumes
        if (!error && count === 0) {
            const result = await supabase.from('optimized_resumes').delete({ count: 'exact' }).eq('id', params.id);
            error = result.error;
            count = result.count;
        }

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Resume deleted' });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
