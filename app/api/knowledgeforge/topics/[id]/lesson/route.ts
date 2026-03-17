import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    const { data: lesson, error } = await supabase
      .from('knowledge_lessons')
      .select('*, examples:knowledge_examples(*), questions:knowledge_questions(*)')
      .eq('topic_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ lesson });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
