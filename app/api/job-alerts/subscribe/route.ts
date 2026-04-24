export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { skills, locations, frequency, is_active } = body;

        const supabase = createClient();

        // Upsert job alert for the user
        const { data, error } = await supabase
            .from('job_alerts')
            .upsert({
                user_id: session.userId,
                skills: skills || [],
                locations: locations || [],
                frequency: frequency || 'daily',
                is_active: is_active !== undefined ? is_active : true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) {
            console.error('[JobAlerts API] Error:', error);
            return NextResponse.json({ error: 'Failed to save job alert preferences' }, { status: 500 });
        }

        return NextResponse.json({ success: true, alert: data });
    } catch (err) {
        console.error('[JobAlerts API] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();
        const { data, error } = await supabase
            .from('job_alerts')
            .select('*')
            .eq('user_id', session.userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned"
            console.error('[JobAlerts API] GET Error:', error);
            return NextResponse.json({ error: 'Failed to fetch job alerts' }, { status: 500 });
        }

        return NextResponse.json({ success: true, alert: data || null });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


