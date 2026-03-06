import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { generateAIResponse } from '@/lib/ai-provider';

/**
 * Moderation API for Interview Prep
 * GET: Fetch pending submissions
 * POST: Approve/Reject/Edit submission
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('interview_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('[AdminModeration] GET Error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { submissionId, action, editData } = body; // action: 'approve' | 'reject' | 'edit'

        if (!submissionId || !action) {
            return NextResponse.json({ error: 'Missing submission ID or action' }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: submission } = await (supabase as any)
            .from('interview_submissions')
            .select('*')
            .eq('id', submissionId)
            .single();

        if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

        if (action === 'reject') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('interview_submissions').update({ status: 'rejected' }).eq('id', submissionId);
            return NextResponse.json({ success: true, message: 'Submission rejected' });
        }

        if (action === 'approve') {
            const finalData = editData || submission;

            // 1. Clean Question via AI (Auto-Correction)
            const cleanPrompt = `Clean the formatting of this interview question. 
            Fix typos, capitalization, and grammar. 
            Keep it professional. 
            If it's already clean, return it exactly as is.
            
            QUESTION:
            ${finalData.question_text}`;

            let cleanedQuestion = finalData.question_text;
            try {
                const aiRes = await generateAIResponse(cleanPrompt, undefined, "You are a professional technical editor.", 0.1, 500);
                cleanedQuestion = aiRes.text.trim().replace(/^"|"$/g, '');
            } catch {
                console.error('[Moderation] AI Cleaning failed');
            }

            // 2. Resolve Company, Role, and Round
            // ── Company ──────────────────────────────────────────────────────────
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let { data: company } = await (supabase as any).from('companies').select('id').ilike('name', finalData.company_name.trim()).single();
            if (!company) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: newCo } = await (supabase as any).from('companies').insert({ name: finalData.company_name.trim() }).select('id').single();
                company = newCo;
            }

            // ── Role ─────────────────────────────────────────────────────────────
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let { data: role } = await (supabase as any).from('roles').select('id').eq('company_id', company.id).ilike('role_name', finalData.role_name.trim()).single();
            if (!role) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: newRole } = await (supabase as any).from('roles').insert({ company_id: company.id, role_name: finalData.role_name.trim() }).select('id').single();
                role = newRole;
            }

            // ── Round ────────────────────────────────────────────────────────────
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let { data: round } = await (supabase as any).from('interview_rounds').select('id').eq('role_id', role.id).eq('round_type', finalData.round_type).single();
            if (!round) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: newRound } = await (supabase as any).from('interview_rounds').insert({ role_id: role.id, round_type: finalData.round_type }).select('id').single();
                round = newRound;
            }

            // 3. Duplicate Detection & Insertion
            // Check for similar text in the same round
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existingQuestions } = await (supabase as any)
                .from('interview_questions')
                .select('id, question_text, frequency_score')
                .eq('round_id', round.id);

            // Simple string similarity or inclusion for frequency score
            const normalizedText = cleanedQuestion.toLowerCase().replace(/\s+/g, ' ');
            const matched = existingQuestions?.find((q: { id: string, question_text: string, frequency_score: number }) => {
                const qText = q.question_text.toLowerCase().replace(/\s+/g, ' ');
                return qText === normalizedText || qText.includes(normalizedText) || normalizedText.includes(qText);
            });

            if (matched) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any).from('interview_questions')
                    .update({ frequency_score: (matched.frequency_score || 0) + 1 })
                    .eq('id', matched.id);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any).from('interview_questions').insert({
                    round_id: round.id,
                    question_text: cleanedQuestion,
                    difficulty: finalData.difficulty,
                    verified: true,
                    source: 'user_submission',
                    frequency_score: 1
                });
            }

            // 4. Update submission status
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('interview_submissions').update({ status: 'approved' }).eq('id', submissionId);

            return NextResponse.json({ success: true, message: 'Submission approved and merged.' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        console.error('[AdminModeration] Error:', err);
        return NextResponse.json({ error: 'Failed to complete moderation' }, { status: 500 });
    }
}
