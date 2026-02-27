import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { generateAIResponse } from '@/lib/ai-provider';
import { isValidUsername, PortfolioData } from '@/types/portfolio';

export const runtime = 'nodejs';

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 20);
}

async function generateUniqueUsername(supabase: ReturnType<typeof createClient>, baseName: string): Promise<string> {
    const base = slugify(baseName) || 'user';
    for (let attempt = 0; attempt < 10; attempt++) {
        const suffix = Math.random().toString(36).slice(2, 6);
        const candidate = attempt === 0 ? base : `${base}-${suffix}`;
        if (!isValidUsername(candidate)) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
            .from('portfolios')
            .select('id')
            .eq('username', candidate)
            .limit(1)
            .single();
        if (!data) return candidate;
    }
    return `user-${Date.now().toString(36)}`;
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();

        // Check if user is blocked
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: user } = await (supabase as any)
            .from('users')
            .select('is_blocked, full_name, email')
            .eq('id', session.userId)
            .single() as { data: { is_blocked: boolean; full_name: string; email: string } | null };

        if (!user || user.is_blocked) {
            return NextResponse.json({ error: 'Account blocked' }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        let { resumeData, jobTitle } = body;

        // If no resumeData provided, try to fetch the user's latest resume
        if (!resumeData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: latestResume } = await (supabase as any)
                .from('resumes')
                .select('resume_json')
                .eq('user_id', session.userId)
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();
            if (latestResume) {
                resumeData = latestResume.resume_json;
            }
        }

        // Build prompt context from resume data if provided
        const resumeContext = resumeData
            ? `Resume Data:\n${JSON.stringify(resumeData, null, 2).slice(0, 3000)}`
            : `Name: ${user.full_name || 'Professional'}\nEmail: ${user.email}`;

        const prompt = `You are a professional portfolio content writer. Generate a structured portfolio JSON from the following resume data.

${resumeContext}
${jobTitle ? `Target Role: ${jobTitle}` : ''}

Create a compelling portfolio with:
- A powerful headline (max 10 words)
- A human "about" paragraph (2-3 sentences, first person)
- Curated skills list (top 10-15)
- Projects with clear descriptions
- Experience with key achievements
- Education and certifications

RULES:
1. Return ONLY valid JSON. No markdown. No extra text.
2. All text must be clean, professional English.
3. Keep descriptions concise — max 2 sentences per project.
4. Do NOT fabricate data not in the resume.

SCHEMA:
{
  "name": "",
  "headline": "",
  "about": "",
  "email": "",
  "phone": "",
  "linkedin": "",
  "github": "",
  "website": "",
  "skills": ["skill1", "skill2"],
  "projects": [
    { "title": "", "description": "", "tech": [], "github": "", "live": "" }
  ],
  "experience": [
    { "company": "", "role": "", "duration": "", "points": [] }
  ],
  "education": [
    { "school": "", "degree": "", "duration": "", "cgpa": "" }
  ],
  "certifications": [
    { "title": "", "issuer": "", "year": "" }
  ]
}`;

        const aiOut = await generateAIResponse(prompt);
        let portfolioData: PortfolioData;

        try {
            portfolioData = JSON.parse(aiOut.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch {
            console.error('[Portfolio] AI JSON parse fail:', aiOut.slice(0, 300));
            return NextResponse.json({ error: 'AI returned invalid data. Please try again.' }, { status: 500 });
        }

        // Check if user already has a portfolio
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
            .from('portfolios')
            .select('id, username')
            .eq('user_id', session.userId)
            .single() as { data: { id: string; username: string } | null };

        const previewToken = crypto.randomUUID();

        if (existing) {
            // Update existing portfolio
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: updated } = await (supabase as any)
                .from('portfolios')
                .update({ data: portfolioData, preview_token: previewToken, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select()
                .single();

            return NextResponse.json({ success: true, portfolioId: updated.id, username: existing.username, previewToken });
        }

        // Create new portfolio
        const username = await generateUniqueUsername(supabase, portfolioData.name || user.full_name || 'user');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: portfolio, error } = await (supabase as any)
            .from('portfolios')
            .insert({
                user_id: session.userId,
                username,
                data: portfolioData,
                theme: 'minimal',
                is_public: false,
                preview_token: previewToken,
            })
            .select()
            .single();

        if (error) {
            console.error('[Portfolio] Insert error:', error);
            return NextResponse.json({ error: 'Failed to create portfolio.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, portfolioId: portfolio.id, username, previewToken });

    } catch (e) {
        console.error('[Portfolio Generate]', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
