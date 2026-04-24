export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ success: true }); // Silent fail

        const supabase = createClient();
        
        await supabase.from('pwa_installs').insert({
            user_id: session.userId,
            device: req.headers.get('user-agent') || 'unknown'
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: true }); // Always success to not break client
    }
}


