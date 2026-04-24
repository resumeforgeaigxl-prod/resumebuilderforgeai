export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: topics } = await supabase
      .from('knowledge_topics')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({ topics });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { name, description } = await req.json();

    const { data, error } = await supabase
      .from('knowledge_topics')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ topic: data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


