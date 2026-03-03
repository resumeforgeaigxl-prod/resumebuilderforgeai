import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { logMockTestGenerated } from '@/lib/admin-logger';

export const runtime = 'nodejs';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.DEFAULT_MODEL || 'openai/gpt-4o-mini';

interface RawQuestion {
    question_number: number;
    category: string;
    difficulty: string;
    question: string;
    options: string[] | null;
    correct_answer: string | null;
    explanation: string | null;
}

async function generateQuestions(
    category: string,
    startNum: number,
    jobDescription: string,
    resumeText: string,
    jobTitle: string
): Promise<RawQuestion[]> {
    const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

    const categoryPrompts: Record<string, string> = {
        technical: `Generate 10 technical multiple-choice questions based on this job description and the candidate's resume. Focus on the specific technologies, tools, frameworks, and concepts mentioned in the JD.`,
        aptitude: `Generate 10 quantitative aptitude multiple-choice questions (mathematics, numbers, percentages, profit/loss, time-speed-distance, data interpretation). Make them appropriate for a ${jobTitle || 'tech professional'}.`,
        verbal: `Generate 10 verbal ability multiple-choice questions (grammar, sentence correction, reading comprehension, vocabulary, analogy). Make them appropriate for a ${jobTitle || 'professional'} role.`,
        logical: `Generate 10 logical reasoning multiple-choice questions (patterns, sequences, coding-decoding, blood relations, seating arrangement, syllogisms). Make them appropriate for a ${jobTitle || 'professional'} interview.`,
        interview: `Generate 10 open-ended interview questions (mix of behavioral, situational, and technical) based on this job description. These should NOT have MCQ options — just the question and a model answer guideline.`,
    };

    const isInterview = category === 'interview';

    const prompt = `${categoryPrompts[category]}

JOB TITLE: ${jobTitle || 'Not specified'}
JOB DESCRIPTION:
${jobDescription.slice(0, 1500)}

${resumeText ? `CANDIDATE RESUME SUMMARY:\n${resumeText.slice(0, 500)}` : ''}

RULES:
1. Return ONLY valid JSON. No markdown. No extra text.
2. Questions are numbered ${startNum} to ${startNum + 9}.
3. Each question must have: question_number, category="${category}", difficulty (easy/medium/hard), question.
${isInterview ? `4. Interview questions: set options=null, correct_answer=null, explanation=a model answer guideline (2-3 sentences).` : `4. MCQ: options=["A. ...", "B. ...", "C. ...", "D. ..."], correct_answer="A" or "B" or "C" or "D", explanation=1-2 sentence explanation.`}

SCHEMA:
{
  "questions": [
    {
      "question_number": ${startNum},
      "category": "${category}",
      "difficulty": "medium",
      "question": "...",
      "options": ${isInterview ? 'null' : '["A. ...", "B. ...", "C. ...", "D. ..."]'},
      "correct_answer": ${isInterview ? 'null' : '"A"'},
      "explanation": "..."
    }
  ]
}`;

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'X-Title': 'ResumeForge AI',
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert exam question generator. Return ONLY valid JSON with no markdown, no code blocks, and no extra text.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 4000,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`AI error (${response.status}): ${err.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const parsed = JSON.parse(clean);
        return (parsed.questions ?? []) as RawQuestion[];
    } catch {
        console.error(`[MockTest] JSON parse fail for ${category}:`, clean.slice(0, 300));
        throw new Error(`AI returned invalid JSON for category: ${category}`);
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { jobDescription, resumeText = '', jobTitle = '' } = body;

        if (!jobDescription?.trim() || jobDescription.trim().length < 50) {
            return NextResponse.json({ error: 'Please paste a full job description (minimum 50 characters).' }, { status: 400 });
        }

        const supabase = createClient();

        // Create the mock_test record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: testRow, error: testErr } = await (supabase as any)
            .from('mock_tests')
            .insert({
                user_id: session.userId,
                job_title: jobTitle || 'Unknown Role',
                job_description: jobDescription,
                resume_text: resumeText || null,
                total_questions: 50,
            })
            .select()
            .single();

        if (testErr || !testRow) {
            console.error('[MockTest] DB insert error:', testErr);
            return NextResponse.json({ error: 'Failed to create test record.' }, { status: 500 });
        }

        const testId = testRow.id;

        // Generate all 5 categories in parallel (10 questions each)
        const categories: Array<{ name: string; start: number }> = [
            { name: 'technical', start: 1 },
            { name: 'aptitude', start: 11 },
            { name: 'verbal', start: 21 },
            { name: 'logical', start: 31 },
            { name: 'interview', start: 41 },
        ];

        console.log(`[MockTest] Generating 50 questions for test ${testId}...`);

        const results = await Promise.allSettled(
            categories.map(c =>
                generateQuestions(c.name, c.start, jobDescription, resumeText, jobTitle)
            )
        );

        const allQuestions: RawQuestion[] = [];
        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                allQuestions.push(...result.value);
            } else {
                console.error(`[MockTest] Category ${categories[i].name} failed:`, result.reason);
                // Insert fallback placeholder questions so total stays near 50
                for (let q = categories[i].start; q < categories[i].start + 10; q++) {
                    allQuestions.push({
                        question_number: q,
                        category: categories[i].name,
                        difficulty: 'medium',
                        question: `Question ${q} could not be generated. Please retake the test.`,
                        options: categories[i].name !== 'interview' ? ['A. N/A', 'B. N/A', 'C. N/A', 'D. N/A'] : null,
                        correct_answer: categories[i].name !== 'interview' ? 'A' : null,
                        explanation: 'Generation failed for this question.',
                    });
                }
            }
        });

        // Bulk-insert all questions
        const qRows = allQuestions.map(q => ({
            test_id: testId,
            question_number: q.question_number,
            category: q.category,
            difficulty: q.difficulty || 'medium',
            question: q.question,
            options: q.options ?? null,
            correct_answer: q.correct_answer ?? null,
            explanation: q.explanation ?? null,
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: qErr } = await (supabase as any)
            .from('mock_questions')
            .insert(qRows);

        if (qErr) {
            console.error('[MockTest] Question insert error:', qErr);
            // Cleanup orphan test
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('mock_tests').delete().eq('id', testId);
            return NextResponse.json({ error: 'Failed to save questions.' }, { status: 500 });
        }

        console.log(`[MockTest] Generated ${allQuestions.length} questions for test ${testId}`);

        // Fire-and-forget admin log
        logMockTestGenerated({
            userId: session.userId,
            testId,
            jobTitle: jobTitle || 'Unknown Role',
            totalQuestions: allQuestions.length
        });

        return NextResponse.json({ success: true, testId, totalQuestions: allQuestions.length });

    } catch (e) {
        console.error('[MockTest] Unexpected error:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
    }
}
