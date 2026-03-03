import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { resumeId, roleTitle, companyName, content } = await req.json();

        if (!resumeId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createClient();

        const { data, error } = await supabase
            .from('cover_letters')
            .insert({
                resume_id: resumeId,
                user_id: session.userId,
                role_title: roleTitle,
                company_name: companyName,
                content: content
            })
            .select()
            .single();

        if (error) {
            console.error('[API] Save CV Error:', error);
            return NextResponse.json({ error: 'Failed to save cover letter' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error: unknown) {
        console.error('[API] Save CV Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
