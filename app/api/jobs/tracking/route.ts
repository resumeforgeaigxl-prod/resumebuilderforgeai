export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        const supabase = createClient();

        if (jobId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase as any)
                .from('job_applications')
                .select('*')
                .eq('user_id', session.userId)
                .eq('job_id', jobId)
                .single();
            
            return NextResponse.json({ success: true, application: data });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
            .from('job_applications')
            .select('*, jobs(company_name, role_title, logo_url)')
            .eq('user_id', session.userId)
            .order('updated_at', { ascending: false });

        return NextResponse.json({ success: true, applications: data });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const { jobId, status, notes } = await req.json();

        if (!jobId) return NextResponse.json({ success: false, message: "Missing jobId" }, { status: 400 });

        const supabase = createClient();

        // Check if exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
            .from('job_applications')
            .select('id')
            .eq('user_id', session.userId)
            .eq('job_id', jobId)
            .maybeSingle();

        if (existing) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('job_applications')
                .update({ status, notes, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return NextResponse.json({ success: true, application: data, updated: true });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('job_applications')
                .insert({
                    user_id: session.userId,
                    job_id: jobId,
                    status: status || 'Applied',
                    notes
                })
                .select()
                .single();
            if (error) throw error;
            return NextResponse.json({ success: true, application: data, created: true });
        }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}



