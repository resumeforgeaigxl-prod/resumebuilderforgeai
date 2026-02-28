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
        return NextResponse.redirect(`${requestUrl.origin}/login`, { status: 303 })
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
            .single()

        if (error || !data) {
            console.error("Error creating resume:", error)
            return NextResponse.redirect(`${requestUrl.origin}/dashboard?error=Could not create resume`, { status: 303 })
        }

        console.log("Created new resume with ID:", data.id)
        // Redirect to the builder
        return NextResponse.redirect(`${requestUrl.origin}/builder/${data.id}`, { status: 303 })
    } catch (err) {
        console.error("Unexpected error creating resume:", err)
        return NextResponse.redirect(`${requestUrl.origin}/dashboard?error=Server error`, { status: 303 })
    }
}
