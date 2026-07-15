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

    // Query experts
    const { data: experts, error: expErr } = await supabase
      .from('project_experts')
      .select('*')
      .order('name', { ascending: true });

    if (expErr) return NextResponse.json({ error: expErr.message }, { status: 500 });

    // For each expert, count active assigned projects
    const { data: requests, error: reqErr } = await supabase
      .from('project_requests')
      .select('id, expert_id, status')
      .not('expert_id', 'is', null);

    if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

    const workloadMap = requests.reduce((acc: Record<string, { assigned: number; completed: number }>, curr: any) => {
      const expId = curr.expert_id;
      if (!acc[expId]) {
        acc[expId] = { assigned: 0, completed: 0 };
      }
      if (curr.status === 'Completed' || curr.status === 'Delivered') {
        acc[expId].completed++;
      } else if (curr.status !== 'Cancelled') {
        acc[expId].assigned++;
      }
      return acc;
    }, {});

    const expertsWithStats = experts.map((e: any) => {
      const stats = workloadMap[e.id] || { assigned: 0, completed: 0 };
      return {
        ...e,
        active_projects: stats.assigned,
        completed_projects: stats.completed
      };
    });

    return NextResponse.json({ success: true, experts: expertsWithStats });
  } catch (err: any) {
    console.error('[Experts API GET Exception]', err);
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
    const { id, name, email, phone, specialization, skills, domains, availability, status } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    const supabase = createClient();

    let expertRecord;
    if (id) {
      // Update
      const { data, error } = await supabase
        .from('project_experts')
        .update({
          name,
          email,
          phone: phone || null,
          specialization: specialization || null,
          skills: skills || [],
          domains: domains || [],
          availability: availability !== undefined ? availability : true,
          status: status || 'Active'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      expertRecord = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('project_experts')
        .insert({
          name,
          email,
          phone: phone || null,
          specialization: specialization || null,
          skills: skills || [],
          domains: domains || [],
          availability: availability !== undefined ? availability : true,
          status: status || 'Active'
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      expertRecord = data;
    }

    return NextResponse.json({ success: true, expert: expertRecord });
  } catch (err: any) {
    console.error('[Experts API POST Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
