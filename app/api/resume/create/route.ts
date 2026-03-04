import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getSession } from '@/lib/auth/jwt'
import { sendResumeCreatedEmail } from '@/lib/brevo'

const DEFAULT_RESUME_JSON = {
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: []
}

export async function POST() {
    // 1. Get current session from JWT (Primary identity)
    const session = await getSession();
    const userId = session?.userId;

    console.log('[API] Resume Create - Auth check:', {
        jwtSession: session?.userId,
        finalUserId: userId
    });

    // 2. Ensure user_id exists before inserting resume
    if (!userId) {
        console.warn('[API] Resume Create - No userId found');
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const supabase = createClient(); // Use service role for guaranteed write if session exists

        // 3. Await insert with .select().single()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('resumes')
            .insert({
                user_id: userId,
                title: 'Untitled Resume',
                resume_json: DEFAULT_RESUME_JSON,
                template_selected: 'modern'
            })
            .select('id')
            .single();

        // 4. Handle insert errors explicitly
        if (error) {
            console.error("[API] Resume insert error:", error);
            return NextResponse.json({
                success: false,
                error: 'Database insertion failed',
                details: error.message
            }, { status: 500 });
        }

        if (!data?.id) {
            console.error("[API] Resume create - No ID returned");
            return NextResponse.json({
                success: false,
                error: 'Failed to generate resume ID'
            }, { status: 500 });
        }

        // 5. Send resume-created email (non-blocking, fire-and-forget)
        try {
            const supabaseAdmin = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            const { data: userRow } = await supabaseAdmin
                .from('users')
                .select('email, full_name')
                .eq('id', userId)
                .single();

            if (userRow?.email) {
                sendResumeCreatedEmail(
                    userRow.email,
                    userRow.full_name || undefined,
                    'Untitled Resume',
                    data.id
                ).catch(e => console.error('[Resume Create] Email error:', e));
            }
        } catch (emailErr) {
            console.error('[Resume Create] Failed to trigger email:', emailErr);
        }

        return NextResponse.json({ success: true, id: data.id });
    } catch (err: unknown) {
        console.error("[API] Resume creation failed:", err);
        const msg = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
