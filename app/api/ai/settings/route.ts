export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();

        // Check terms
        const { data: settings, error: settingsError } = await supabase
            .from('ai_user_settings')
            .select('ai_terms_accepted_at')
            .eq('user_id', session.userId)
            .maybeSingle();

        if (settingsError) {
            console.error('[AI Settings GET] Settings fetch error:', settingsError);
        }

        // Check name — we'll check both display_name (custom for AI) and full_name (original)
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('display_name, full_name')
            .eq('id', session.userId)
            .maybeSingle();

        if (userError) {
            console.error('[AI Settings GET] User fetch error:', userError);
        }

        return NextResponse.json({
            acceptedTerms: !!settings?.ai_terms_accepted_at,
            displayName: user?.display_name || user?.full_name || null
        });

    } catch (error: unknown) {
        console.error('[AI Settings GET Fatal Error]', error);
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
            const { error } = await supabase.from('ai_user_settings').upsert({
                user_id: session.userId,
                ai_terms_accepted_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            if (error) {
                console.error('[AI Settings POST] Accept terms error:', error);
                return NextResponse.json({ success: false, error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true });
        }

        if (body.action === 'set_name' && body.name) {
            const { error: updateError } = await supabase.from('users').update({
                display_name: body.name.trim()
            }).eq('id', session.userId);

            if (updateError) {
                console.error('[AI Settings POST] Set name error:', updateError);
                // Fallback to updating full_name if display_name update fails
                await supabase.from('users').update({
                    full_name: body.name.trim()
                }).eq('id', session.userId);
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: unknown) {
        console.error('[AI Settings POST Error]', error);
        const message = error instanceof Error ? error.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}



