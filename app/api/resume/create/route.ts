import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/jwt'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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

export async function POST(request: Request) {
    const isJson = request.headers.get('Accept')?.includes('application/json');
    const cookieStore = cookies();

    // 1. Await Supabase auth.getUser() before insert
    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch { /* Handle in middleware */ }
                },
            },
        }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();

    // Fallback to custom JWT session if Supabase auth fails (backward compatibility)
    const session = await getSession();
    const userId = user?.id || session?.userId;

    // 2. Ensure user_id exists before inserting resume
    if (!userId) {
        if (isJson) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
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
            if (isJson) return NextResponse.json({ error: 'Database insertion failed', details: error.message }, { status: 500 });
            throw new Error(error.message);
        }

        if (!data?.id) {
            throw new Error('No data returned from insertion');
        }

        if (isJson) return NextResponse.json({ success: true, id: data.id });

        const redirectUrl = new URL(`/builder/${data.id}`, request.url);
        return NextResponse.redirect(redirectUrl, { status: 303 });
    } catch (err: unknown) {
        console.error("[API] Resume creation failed:", err);
        const msg = err instanceof Error ? err.message : 'Internal server error';
        if (isJson) return NextResponse.json({ error: msg }, { status: 500 });

        const errorUrl = new URL('/dashboard', request.url);
        errorUrl.searchParams.set('error', msg);
        return NextResponse.redirect(errorUrl, { status: 303 });
    }
}
