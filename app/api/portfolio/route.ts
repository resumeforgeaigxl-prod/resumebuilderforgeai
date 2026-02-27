import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { isValidUsername } from '@/types/portfolio';

export const runtime = 'nodejs';

// GET — fetch current user's portfolio
export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('portfolios')
        .select('*')
        .eq('user_id', session.userId)
        .single();

    return NextResponse.json({ success: true, portfolio: data ?? null });
}

// PATCH — update portfolio (ownership verified server-side)
export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { data, theme, username, is_public } = body;

    // Validate username if provided
    if (username !== undefined) {
        if (!isValidUsername(username)) {
            return NextResponse.json(
                { error: 'Username must be 3–30 characters: lowercase letters, numbers, and hyphens only.' },
                { status: 400 }
            );
        }
    }

    const supabase = createClient();

    // Verify ownership — only update user's own portfolio
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
        .from('portfolios')
        .select('id')
        .eq('user_id', session.userId)
        .single() as { data: { id: string } | null };

    if (!existing) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data !== undefined) updates.data = data;
    if (theme !== undefined) updates.theme = theme;
    if (username !== undefined) updates.username = username;
    if (is_public !== undefined) updates.is_public = is_public;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error } = await (supabase as any)
        .from('portfolios')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Username already taken. Please choose another.' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, portfolio: updated });
}
