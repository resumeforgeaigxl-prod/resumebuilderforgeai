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
    const requestUrl = new URL(request.url)
    const supabase = createClient()
    const session = await getSession()

    if (!session) {
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

        if (error || !data) {
            console.error("Error creating resume:", error);
            const errorUrl = new URL('/dashboard', request.url);
            errorUrl.searchParams.set('error', 'Could not create resume');
            return NextResponse.redirect(errorUrl, { status: 303 });
        }

        const redirectUrl = new URL(`/builder/${data.id}`, request.url);
        return NextResponse.redirect(redirectUrl, { status: 303 });
    } catch (err: unknown) {
        console.error("Unexpected error creating resume:", err);
        const errorUrl = new URL('/dashboard', request.url);
        errorUrl.searchParams.set('error', err instanceof Error ? err.message : 'Server error');
        return NextResponse.redirect(errorUrl, { status: 303 });
    }
}
