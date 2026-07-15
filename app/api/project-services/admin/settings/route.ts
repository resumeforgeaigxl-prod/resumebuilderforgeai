export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

function isAdminUser(session: any): boolean {
  return session?.role === 'admin' || session?.email === 'saivarshith8284@gmail.com';
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminUser(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient();
    const { data: settings, error } = await supabase
      .from('project_settings')
      .select('*');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Format list of settings into key-value map
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (err: any) {
    console.error('[Settings API GET Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminUser(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: setting, error } = await supabase
      .from('project_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, setting });
  } catch (err: any) {
    console.error('[Settings API POST Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
