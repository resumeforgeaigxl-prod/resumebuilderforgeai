import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';
import { randomBytes } from 'crypto';

/**
 * @api {get} /v1/keys Get your API keys
 * @api {post} /v1/keys Generate a new API key
 */
export async function GET() {
    const session = await getSession();
    if (!session?.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: keys, error } = await (supabase as any)
        .from('api_keys')
        .select('*')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: keys || [] });
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session?.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { name } = body;

        // Generate a high-entropy API key
        // Format: rf_ + 64 char random hex string
        const apiKey = `rf_${randomBytes(32).toString('hex')}`;
        
        const supabase = createAdminClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('api_keys')
            .insert({
                user_id: session.userId,
                api_key: apiKey,
                name: name || 'Default Key',
                usage_limit: 1000 // Default limit
            })
            .select('*')
            .single();

        if (error) {
            console.error('[API Keys] Error creating key:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'API key generated successfully. Please store it securely.',
            data
        });
    } catch (e: unknown) {
        const error = e as Error;
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * @api {delete} /v1/keys Revoke a key
 */
export async function DELETE(req: NextRequest) {
    const session = await getSession();
    if (!session?.userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
        return NextResponse.json({ success: false, error: 'Key ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('api_keys')
        .update({ status: 'revoked' })
        .eq('id', keyId)
        .eq('user_id', session.userId);

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Key revoked successfully' });
}
