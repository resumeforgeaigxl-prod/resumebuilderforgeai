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
        const supabase = createClient();
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 3. Backend Protection: Avoid duplicate resumes within 2 seconds
        const { data: recentResumes } = await supabaseAdmin
            .from('resumes')
            .select('id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (recentResumes && recentResumes.length > 0) {
            const lastCreated = new Date(recentResumes[0].created_at).getTime();
            const now = new Date().getTime();
            if (now - lastCreated < 2000) {
                console.warn('[API] Resume Create - Rate limited (duplicate request)');
                return NextResponse.json({
                    success: false,
                    error: 'Please wait a moment before creating another resume.'
                }, { status: 429 });
            }
        }

        // 4. Await insert with .select().single()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('resumes')
            .insert({
                user_id: userId,
                title: 'Untitled Resume',
                resume_json: DEFAULT_RESUME_JSON,
                template_selected: 'modern',
                email_sent: false
            })
            .select('id')
            .single();

        // 5. Handle insert errors explicitly
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

        // 6. Send resume-created email (only if email_sent is false)
        try {
            const { data: userRow } = await supabaseAdmin
                .from('users')
                .select('email, full_name')
                .eq('id', userId)
                .single();

            // Re-fetch resume to check email_sent (to be triple safe)
            const { data: resumeCheck } = await supabaseAdmin
                .from('resumes')
                .select('email_sent')
                .eq('id', data.id)
                .single();

            if (userRow?.email && resumeCheck && !resumeCheck.email_sent) {
                await sendResumeCreatedEmail(
                    userRow.email,
                    userRow.full_name || undefined,
                    'Untitled Resume',
                    data.id
                );

                // Update email_sent to true
                await supabaseAdmin
                    .from('resumes')
                    .update({ email_sent: true })
                    .eq('id', data.id);

                console.log('[API] Resume Create - Email sent and flag updated for:', data.id);
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
