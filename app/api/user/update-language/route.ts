export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { language } = await request.json();
        const client = await createClient();

        const { error } = await client
            .from('users')
            .update({ preferred_language: language })
            .eq('id', session.userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


