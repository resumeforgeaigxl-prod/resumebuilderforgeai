import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { InterviewRoundType, DifficultyType } from '@/types/interview-prep';

/**
 * POST /api/interview-prep/submit
 * User shares their interview experience.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { companyName, roleName, roundType, questionText, difficulty, notes } = body;

        if (!companyName || !roleName || !roundType || !questionText) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createClient();

        // ── Validation ────────────────────────────────────────────────────────
        const allowedRounds: InterviewRoundType[] = [
            'Online Assessment', 'Aptitude Test', 'Technical Interview', 'System Design', 'HR Interview'
        ];
        if (!allowedRounds.includes(roundType)) {
            return NextResponse.json({ error: 'Invalid round type' }, { status: 400 });
        }

        const allowedDifficulty: DifficultyType[] = ['Easy', 'Medium', 'Hard'];
        if (difficulty && !allowedDifficulty.includes(difficulty)) {
            return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
        }

        // ── Insert Submission ────────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('interview_submissions').insert({
            user_id: session.userId,
            company_name: companyName.trim(),
            role_name: roleName.trim(),
            round_type: roundType,
            question_text: questionText.trim(),
            difficulty: difficulty || 'Medium',
            notes: notes?.trim() || null,
            status: 'pending'
        });

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Experience submitted for moderation. Thank you!' });
    } catch {
        return NextResponse.json({ error: 'Failed to submit experience' }, { status: 500 });
    }
}
