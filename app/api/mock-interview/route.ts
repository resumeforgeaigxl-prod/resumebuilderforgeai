import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { stripMarkdown } from '@/lib/ai-provider';

export const runtime = 'nodejs';

import { checkForgeAccess, incrementForgeUsage } from '@/lib/auth/usage';

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

        const access = await checkForgeAccess('interviewforge');
        
        // If limit reached, return specifically to trigger UI logic if needed
        if (!access.hasAccess && access.reason === 'limit_reached') {
            return NextResponse.json({ 
                error: 'You’ve used your free interview session. Unlock full access to continue.',
                limitReached: true,
                user: {
                    id: session.userId,
                    interviewsUsed: 1, // Assume 1 for free users who are blocked
                    interviewLimit: 1
                }
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: session.userId,
                role: access.isAdmin ? 'admin' : 'user',
                plan_type: access.isPro ? 'pro' : 'free',
                interviewsUsed: 0, // Placeholder as we use lifetime tracking now
                interviewLimit: access.isPro ? 999 : 1
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

            // Check access before creating
            const access = await checkForgeAccess('interviewforge');
            if (!access.hasAccess && access.reason === 'limit_reached') {
                return NextResponse.json({ 
                    error: 'Limit reached. Upgrade to start a new interview session.',
                    limitReached: true 
                }, { status: 403 });
            }

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

            // Increment lifetime usage
            await incrementForgeUsage('interviewforge');

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
