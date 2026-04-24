export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { checkUserAccess } from '@/lib/access';

export const runtime = 'nodejs';

const FREE_LIMIT = 5;

export async function GET(
    _request: Request,
    { params }: { params: { testId: string } }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { testId } = params;
        const supabase = createClient();

        // Fetch test record — verify ownership
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: test } = await (supabase as any)
            .from('mock_tests')
            .select('*')
            .eq('id', testId)
            .eq('user_id', session.userId)
            .single() as { data: Record<string, unknown> | null };

        if (!test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        // Fetch all questions ordered
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: questions } = await (supabase as any)
            .from('mock_questions')
            .select('*')
            .eq('test_id', testId)
            .order('question_number', { ascending: true }) as { data: Record<string, unknown>[] | null };

        // Server-side access check — determines gating
        const access = await checkUserAccess(session.userId);
        const gated = !access.hasAccess;

        // If gated: strip sensitive fields from questions beyond FREE_LIMIT
        const processedQuestions = (questions ?? []).map((q: Record<string, unknown>, idx: number) => {
            if (gated && idx >= FREE_LIMIT) {
                return {
                    id: q.id,
                    question_number: q.question_number,
                    category: q.category,
                    difficulty: q.difficulty,
                    question: q.question,
                    options: null,         // hidden
                    correct_answer: null,  // hidden
                    explanation: null,     // hidden
                    gated: true,
                };
            }
            return { ...q, gated: false };
        });

        return NextResponse.json({
            success: true,
            test,
            questions: processedQuestions,
            gated,
            freeLimit: FREE_LIMIT,
            access: {
                hasAccess: access.hasAccess,
                plan: access.plan,
                expiresAt: access.expiresAt,
                reason: access.reason
            }
        });

    } catch (e) {
        console.error('[MockTest GET]', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
