export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { role } = await req.json(); // 'user' or 'recruiter'

        if (role !== 'user' && role !== 'recruiter') {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Ensure not setting admin role accidentally or modifying an admin
        const { data: userData } = await supabase.from('users').select('role').eq('id', params.id).single();
        if (userData?.role === 'admin') {
            return NextResponse.json({ error: 'Cannot modify admin role' }, { status: 403 });
        }

        const { error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', params.id);

        if (error) {
            console.error('Role update DB Error:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Role update Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
