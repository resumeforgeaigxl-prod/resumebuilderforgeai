export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export async function GET(req: NextRequest, { params }: { params: { companyName: string } }) {
    try {
        const supabase = createClient();
        const { companyName } = params;

        // ── Fetch Company ──────────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: company } = await (supabase as any)
            .from('companies')
            .select('id')
            .ilike('name', companyName)
            .single();

        if (!company) return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });

        // ── Fetch Roles & Detailed Questions ─────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: roles, error } = await (supabase as any)
            .from('roles')
            .select(`
                id,
                role_name,
                interview_rounds (
                    id,
                    round_type,
                    interview_questions (
                        id,
                        question_text,
                        difficulty,
                        frequency_score,
                        created_at
                    )
                )
            `)
            .eq('company_id', company.id);

        if (error) throw error;

        // ── Formatting ────────────────────────────────────────────────────────
        type DbQuestion = { id: string, question_text: string, difficulty: string, frequency_score: number, created_at: string };
        type DbRound = { id: string, round_type: string, interview_questions: DbQuestion[] };
        type DbRole = { id: string, role_name: string, interview_rounds: DbRound[] };

        const formatted = (roles || []).map((role: DbRole) => ({
            id: role.id,
            name: role.role_name,
            rounds: (role.interview_rounds || []).map((round: DbRound) => ({
                id: round.id,
                type: round.round_type,
                questions: (round.interview_questions || [])
                    .sort((a: DbQuestion, b: DbQuestion) => (b.frequency_score || 0) - (a.frequency_score || 0))
                    .map((q: DbQuestion) => ({
                        id: q.id,
                        text: q.question_text,
                        difficulty: q.difficulty,
                        frequency: q.frequency_score,
                        date: format(new Date(q.created_at), 'MMM dd, yyyy')
                    }))
            }))
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
