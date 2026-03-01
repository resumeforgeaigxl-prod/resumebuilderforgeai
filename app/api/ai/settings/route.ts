import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();

        // Check terms
        const { data: settings } = await supabase
            .from('ai_user_settings')
            .select('ai_terms_accepted_at')
            .eq('user_id', session.userId)
            .single();

        // Check name
        const { data: user } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', session.userId)
            .single();

        return NextResponse.json({
            acceptedTerms: !!settings?.ai_terms_accepted_at,
            displayName: user?.display_name || null
        });

    } catch (error: unknown) {
        console.error('[AI Settings GET Error]', error);
        const message = error instanceof Error ? error.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const body = await request.json();

        if (body.action === 'accept_terms') {
            await supabase.from('ai_user_settings').upsert({
                user_id: session.userId,
                ai_terms_accepted_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            return NextResponse.json({ success: true });
        }

        if (body.action === 'set_name' && body.name) {
            await supabase.from('users').update({
                display_name: body.name.trim()
            }).eq('id', session.userId);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: unknown) {
        console.error('[AI Settings POST Error]', error);
        const message = error instanceof Error ? error.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
