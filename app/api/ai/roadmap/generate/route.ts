export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { generateAIResponse, extractJson } from '@/lib/ai-provider';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { target_role, experience_level, time_available } = body;

        if (!target_role || !experience_level || !time_available) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const systemPrompt = `You are a career expert. Generate a detailed, step-by-step career learning roadmap in JSON format.
Return ONLY the JSON. No markdown, no extra text.
Structure:
{
  "title": "Target Role Roadmap",
  "description": "Brief overview",
  "steps": [
    {
      "name": "Phase Name",
      "items": ["Specific skill/topic 1", "topic 2"],
      "estimated_weeks": number,
      "resources": ["resource 1 hint", "resource 2 hint"]
    }
  ],
  "estimated_total_months": number
}`;

        const userPrompt = `Generate a career roadmap for someone targeting the role of "${target_role}".
Experience Level: ${experience_level}
Time Availability: ${time_available} per week.
Provide a logical progression of skills and certifications needed.`;

        const aiResponse = await generateAIResponse(userPrompt, undefined, systemPrompt);
        const cleanedJson = extractJson(aiResponse.text);

        let roadmapJson;
        try {
            console.log('[Roadmap] AI Response received. Length:', cleanedJson.length);
            roadmapJson = JSON.parse(cleanedJson);
        } catch (e) {
            console.error('[Roadmap] JSON Parse Error:', e);
            console.error('[Roadmap] Raw cleaned JSON:', cleanedJson);
            return NextResponse.json({ error: 'Failed to generate valid roadmap structure. The AI returned an invalid format.' }, { status: 500 });
        }

        const supabase = createClient();

        // Store in DB
        const { data, error } = await supabase
            .from('roadmaps')
            .insert({
                user_id: session.userId,
                target_role,
                experience_level,
                time_available,
                roadmap_json: roadmapJson
            })
            .select()
            .single();

        if (error) {
            console.error('[Roadmap] DB Error:', error);
            return NextResponse.json({ error: 'Failed to save roadmap' }, { status: 500 });
        }

        return NextResponse.json({ success: true, roadmap: data });

    } catch (err) {
        console.error('[Roadmap] Error:', err);
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
            .from('roadmaps')
            .select('*')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch roadmaps' }, { status: 500 });
        }

        return NextResponse.json({ success: true, roadmaps: data });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


