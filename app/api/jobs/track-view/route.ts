import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: true, tracked: false });
        }

        const { job_id, job_title, company } = await req.json();

        const admin = createAdminClient();
        await admin.from('job_views').insert({
            user_id: session.userId,
            job_id: job_id || null,
            job_title: job_title || '',
            company: company || ''
        });

        return NextResponse.json({ success: true, tracked: true });

    } catch (error: unknown) {
        console.error('[Track View] Error:', error);
        return NextResponse.json({ success: true, tracked: false });
    }
}
