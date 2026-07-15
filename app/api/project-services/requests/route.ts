export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

// Helper to generate a unique random Project ID (PRJ-XXXXXXXX)
function generateProjectId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PRJ-${result}`;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    // Query requests belonging to current user
    const { data: requests, error } = await supabase
      .from('project_requests')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Project Services API GET Error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    console.error('[Project Services API GET Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createClient();

    // Validate essential fields
    const required = [
      'full_name',
      'email',
      'phone',
      'college',
      'university',
      'branch',
      'year',
      'semester',
      'project_type',
      'project_domain',
      'project_title',
      'project_description',
      'urgency',
      'budget_range',
      'project_mode'
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const projectId = generateProjectId();

    // Insert request
    const { data: projectRequest, error } = await supabase
      .from('project_requests')
      .insert({
        project_id: projectId,
        user_id: session.userId,
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        whatsapp: body.whatsapp || null,
        college: body.college,
        university: body.university,
        branch: body.branch,
        year: body.year,
        semester: body.semester,
        project_type: body.project_type,
        project_domain: body.project_domain,
        project_title: body.project_title,
        project_description: body.project_description,
        existing_abstract: body.existing_abstract || null,
        requirements: body.requirements || [],
        additional_requirements: body.additional_requirements || null,
        tech_frontend: body.tech_frontend || null,
        tech_backend: body.tech_backend || null,
        tech_database: body.tech_database || null,
        tech_language: body.tech_language || null,
        tech_ai_framework: body.tech_ai_framework || null,
        tech_hosting: body.tech_hosting || null,
        submission_date: body.submission_date || null,
        urgency: body.urgency,
        budget_range: body.budget_range,
        project_mode: body.project_mode,
        team_size: body.team_size || 1,
        status: 'Pending'
      })
      .select()
      .single();

    if (error) {
      console.error('[Project Services API POST Insert Error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Insert initial timeline event
    await supabase.from('project_timeline').insert({
      request_id: projectRequest.id,
      title: 'Requirement Submitted',
      description: 'Your project request has been successfully submitted and is under pending review.',
      status: 'Pending'
    });

    return NextResponse.json({ success: true, request: projectRequest });
  } catch (err: any) {
    console.error('[Project Services API POST Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
