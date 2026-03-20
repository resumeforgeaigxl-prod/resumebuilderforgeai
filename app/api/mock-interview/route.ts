import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { stripMarkdown } from '@/lib/ai-provider';

export const runtime = 'nodejs';

/**
 * GET /api/mock-interview/check-access
 * Checks if user is logged in and returns daily interview limits/usage.
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();

        // 1. Fetch user plan details
        const { data: userData, error: userError } = await admin
            .from('users')
            .select('role, plan_type, daily_mock_limit, plan_end')
            .eq('id', session.userId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Count interviews used today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error: countError } = await admin
            .from('mock_interviews')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.userId)
            .gte('created_at', today.toISOString());

        if (countError) {
            console.error('[MockInterview] Count error:', countError);
        }

        const planLimits = {
            free: 3,
            pro: 10,
            premium: 15,
            career: 999
        };

        const userPlan = userData.plan_type || 'free';
        // Use daily_mock_limit if set, otherwise fallback to plan defaults
        let limit = userData.daily_mock_limit || (planLimits[userPlan as keyof typeof planLimits] || 3);

        // Admins get unlimited access
        if (userData.role === 'admin') {
            limit = 9999;
        }

        const used = count || 0;

        return NextResponse.json({
            success: true,
            user: {
                id: session.userId,
                role: userData.role,
                plan_type: userPlan,
                interviewsUsed: used,
                interviewLimit: limit
            }
        });

    } catch (err) {
        console.error('[MockInterview] Access API Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/mock-interview/session
 * Creates or updates an interview session.
 */
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { action, ...data } = body;
        const admin = createAdminClient();

        if (action === 'generate-questions') {
            const { role, jobDescription, experienceLevel, interviewType, numQuestions } = data;

            const prompt = `Generate ${numQuestions} interview questions for a ${experienceLevel} level ${interviewType} interview for the role: ${role}.

Job Description: ${jobDescription || 'Not provided'}

Questions should be relevant to the role and experience level. Return only a JSON array of question strings, no other text.

Example: ["Question 1", "Question 2", "Question 3"]`;

            const response = await generateAIResponse(prompt, { userId: session.userId, contextType: 'interview' });
            const cleanText = stripMarkdown(response as string);
            let questions;

            try {
                questions = JSON.parse(cleanText);
            } catch (e) {
                console.error('Failed to parse questions:', e, cleanText);
                return NextResponse.json({ error: 'AI returned an invalid format' }, { status: 500 });
            }

            if (!Array.isArray(questions)) {
                return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
            }

            return NextResponse.json({ success: true, questions });
        }

        if (action === 'evaluate-answer') {
            const { question, answer } = data;

            const prompt = `Evaluate this interview answer on a scale of 0-10.

Question: ${question}
Answer: ${answer}

Return a JSON object with:
- score: number (0-10)
- feedback: string (brief feedback on the answer)
- tips: string (improvement suggestions)

Example: {"score": 7, "feedback": "Good explanation but could be more specific", "tips": "Add examples from your experience"}`;

            const response = await generateAIResponse(prompt, { userId: session.userId, contextType: 'interview' });
            const cleanText = stripMarkdown(response as string);
            let evaluation;

            try {
                evaluation = JSON.parse(cleanText);
            } catch (e) {
                console.error('Failed to parse evaluation:', e, cleanText);
                return NextResponse.json({ error: 'AI returned an invalid evaluation' }, { status: 500 });
            }

            return NextResponse.json({ success: true, evaluation });
        }

        if (action === 'create') {
            const { role, jobDescription, experienceLevel, interviewType, numQuestions, questions } = data;

            const { data: interviewData, error: insertError } = await admin
                .from('mock_interviews')
                .insert({
                    user_id: session.userId,
                    role,
                    job_description: jobDescription,
                    experience_level: experienceLevel,
                    interview_type: interviewType,
                    num_questions: numQuestions,
                    questions,
                    interview_mode: data.interviewMode
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return NextResponse.json({ success: true, interview: interviewData });
        }

        if (action === 'update') {
            const { id, answers, scores, finalScore, detailedScores } = data;

            const updateData: Record<string, unknown> = {
                answers,
                scores
            };
            if (finalScore !== undefined) updateData.final_score = finalScore;
            if (detailedScores !== undefined) updateData.detailed_scores = detailedScores;

            const { error: updateError } = await admin
                .from('mock_interviews')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', session.userId);

            if (updateError) throw updateError;
            return NextResponse.json({ success: true });
        }

        if (action === 'generate-final-report') {
            const { questions, answers, scores } = data;

            const prompt = `Analyze this interview transcript and individual scores to provide a final Interview Intelligence Scorecard.
            
            Questions: ${JSON.stringify(questions)}
            Answers: ${JSON.stringify(answers)}
            Individual Feedback: ${JSON.stringify(scores)}
            
            Evaluate the user across these 4 categories (0-10 scale):
            1. Technical Knowledge (accuracy and depth)
            2. Communication (clarity and flow)
            3. Problem Solving (approach and logic)
            4. Confidence (tone and delivery)
            
            Also calculate "Overall Readiness" (0-100 percentage).
            
            Return ONLY a JSON object:
            {
              "technical": number,
              "communication": number,
              "problem_solving": number,
              "confidence": number,
              "overall_readiness": number,
              "readiness_comparison_percentile": number (generate a realistic random percentile between 40-95 based on performance),
              "improvement_suggestions": ["string"]
            }`;

            const response = await generateAIResponse(prompt, {
                userId: session.userId,
                contextType: 'interview',
                jsonMode: false,
                systemPrompt: "Analyze the interview performance. Return JSON scorecard.",
                model: 'openai/gpt-4o-mini'
            });
            const cleanText = stripMarkdown(response as string);
            let report;

            try {
                report = JSON.parse(cleanText);

                // Save to interview_scores table for historical tracking
                console.log(`[MockInterview] Saving final report for user: ${session.userId}`);
                await admin.from('interview_scores').insert({
                    user_id: session.userId,
                    technical_score: report.technical,
                    communication_score: report.communication,
                    confidence_score: report.confidence,
                    problem_solving_score: report.problem_solving,
                    overall_readiness: report.overall_readiness,
                    suggestions: report.improvement_suggestions
                });
                console.log('[MockInterview] Score saved successfully.');

            } catch (e) {
                console.error('Failed to parse or save final report:', e, cleanText);
                return NextResponse.json({ error: 'AI returned an invalid report format or DB error' }, { status: 500 });
            }

            return NextResponse.json({ success: true, report });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (err) {
        console.error('[MockInterview] Session API Error:', err);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
