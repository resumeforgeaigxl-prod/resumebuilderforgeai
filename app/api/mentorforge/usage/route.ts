import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { startOfDay } from 'date-fns';
import { getSession } from '@/lib/auth/jwt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.userId;

    const { data: usage } = await supabase
      .from('ai_usage')
      .select('requests_count')
      .eq('user_id', userId)
      .eq('module', 'MentorForge')
      .maybeSingle();

    return NextResponse.json({ 
      count: usage?.requests_count || 0,
      limit: 10
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
