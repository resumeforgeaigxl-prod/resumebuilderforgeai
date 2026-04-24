export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = createClient();

        // ── Fetch Companies with Roles & Questions ─────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: companies, error } = await (supabase as any)
            .from('companies')
            .select(`
                id, name, industry, logo_url,
                roles (
                    id,
                    interview_rounds (
                        id,
                        interview_questions ( id )
                    )
                )
            `);

        if (error) throw error;

        // ── Formatting ────────────────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = (companies || []).map((co: { id: string, roles: { interview_rounds?: { interview_questions?: { id: string }[] }[] }[], name: string, industry: string, logo_url: string }) => {
            const roleCount = co.roles?.length || 0;
            let questionCount = 0;

            co.roles?.forEach((role: { interview_rounds?: { interview_questions?: { id: string }[] }[] }) => {
                role.interview_rounds?.forEach((round: { interview_questions?: { id: string }[] }) => {
                    questionCount += round.interview_questions?.length || 0;
                });
            });

            return {
                id: co.id,
                name: co.name,
                industry: co.industry,
                logo_url: co.logo_url,
                role_count: roleCount,
                question_count: questionCount
            };
        });

        return NextResponse.json({ success: true, data: formatted });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

