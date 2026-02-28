import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/jwt'

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
    const supabase = createClient()
    const session = await getSession()
    const isJson = request.headers.get('Accept')?.includes('application/json');

    if (!session) {
        if (isJson) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('resumes')
            .insert({
                user_id: session.userId,
                title: 'Untitled Resume',
                resume_json: DEFAULT_RESUME_JSON,
                template_selected: 'modern'
            })
            .select('id')
            .single();

        if (error || !data || !data.id) {
            console.error("[API] Resume creation failed:", error);
            if (isJson) return NextResponse.json({ error: 'Could not create resume', details: error?.message }, { status: 500 });

            const errorUrl = new URL('/dashboard', request.url);
            errorUrl.searchParams.set('error', 'Could not create resume');
            return NextResponse.redirect(errorUrl, { status: 303 });
        }

        if (isJson) return NextResponse.json({ success: true, id: data.id });

        const redirectUrl = new URL(`/builder/${data.id}`, request.url);
        return NextResponse.redirect(redirectUrl, { status: 303 });
    } catch (err: unknown) {
        console.error("[API] Unexpected error:", err);
        const msg = err instanceof Error ? err.message : 'Server error';
        if (isJson) return NextResponse.json({ error: msg }, { status: 500 });

        const errorUrl = new URL('/dashboard', request.url);
        errorUrl.searchParams.set('error', msg);
        return NextResponse.redirect(errorUrl, { status: 303 });
    }
}
