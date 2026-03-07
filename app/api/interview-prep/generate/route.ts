import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-provider';
import google from 'googlethis';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 60; // Set higher timeout limit for Vercel
export const dynamic = 'force-dynamic';

type GeneratedPrep = {
    company: string;
    role: string;
    difficulty_level: 'Entry' | 'Intermediate' | 'Advanced';
    hiring_process: Array<{
        round_name: string;
        details: string;
        expected_difficulty: string;
    }>;
    top_questions: Array<{
        question: string;
        topic: string;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        frequency: 'High' | 'Medium' | 'Low';
        answer_coach: {
            ideal_structure: string[];
            example_answer: string;
            common_mistakes: string[];
        }
    }>;
    topic_heatmap: Array<{
        topic: string;
        percentage: number;
    }>;
    prep_roadmap: Array<{
        day: number;
        topics: string[];
        tasks: string[];
    }>;
};

type OverviewData = Pick<GeneratedPrep, 'company' | 'role' | 'difficulty_level' | 'hiring_process' | 'topic_heatmap'>;
type DetailsData = Pick<GeneratedPrep, 'top_questions' | 'prep_roadmap'>;

export async function POST(req: NextRequest) {
    try {
        const { company, role } = await req.json();

        if (!company || !role) {
            return NextResponse.json({ success: false, error: 'Company and Role are required' }, { status: 400 });
        }

        // 1. Perform web search queries
        const queries = [
            `${company} ${role} interview process hiring rounds`,
            `${company} ${role} interview questions glassdoor geeksforgeeks`,
            `${company} ${role} interview difficulty and frequency`,
            `${company} ${role} interview preparation guide reddit`
        ];

        let webContext = '';
        const options = {
            page: 0,
            safe: false,
            parse_ads: false,
            additional_params: { hl: 'en' }
        };

        // Parallel searches
        await Promise.all(queries.map(async (query) => {
            try {
                const response = await google.search(query, options);
                if (response.results && response.results.length > 0) {
                    const descriptions = response.results.map(r => r.description).join(' ');
                    webContext += `\n[SEARCH: ${query}]\nResults: ${descriptions}\n`;
                }
            } catch (err) {
                console.error(`Search failed: ${query}`, err);
            }
        }));

        // 2. Phase 1: Overview (Hiring Process & topic Heatmap)
        const overviewSystemPrompt = `You are an expert AI Interview Intelligence Coach.
Generate the "Intelligence Overview" for a specific company and role.

OUTPUT FORMAT:
Return ONLY a valid JSON object.
SCHEMA:
{
  "company": "string",
  "role": "string",
  "difficulty_level": "Entry" | "Intermediate" | "Advanced",
  "hiring_process": [
    { "round_name": "string", "details": "string", "expected_difficulty": "string" }
  ],
  "topic_heatmap": [
    { "topic": "string", "percentage": number }
  ]
}`;

        // Improved Helper to extract and repair JSON
        const repairJson = (text: string) => {
            let json = text.trim();

            // 1. Try to extract JSON between backticks or the first/last braces
            const jsonMatch = json.match(/```json\s*([\s\S]*?)\s*```/) ||
                json.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                json = jsonMatch[1] || jsonMatch[0];
            }

            json = json.trim();

            // 2. Basic balance check and closing for potential truncation
            const openBraces = (json.match(/\{/g) || []).length;
            const closeBraces = (json.match(/\}/g) || []).length;
            const openBrackets = (json.match(/\[/g) || []).length;
            const closeBrackets = (json.match(/\]/g) || []).length;

            if (openBraces > closeBraces) json += '}'.repeat(openBraces - closeBraces);
            if (openBrackets > closeBrackets) json += ']'.repeat(openBrackets - closeBrackets);

            // Remove trailing commas before closing braces/brackets (common AI error)
            json = json.replace(/,\s*([\}\]])/g, '$1');

            return json;
        };

        const overviewUserPrompt = `Target: ${company} - ${role}\nWeb Context: ${webContext}\nGenerate the overview and hiring process.`;

        console.log(`[Interview Prep] Calling Phase 1: Overview (GPT-4o-Mini)...`);
        const phase1Response = await generateAIResponse(overviewUserPrompt, 'openai/gpt-4o-mini', overviewSystemPrompt, 0.4, 1500);

        let overviewData: OverviewData;
        try {
            const cleanJson = repairJson(phase1Response.text);
            overviewData = JSON.parse(cleanJson);
        } catch {
            console.warn('[Interview Prep] Phase 1 Repair failed, trying raw match');
            const rawMatch = phase1Response.text.match(/\{[\s\S]*\}/);
            if (rawMatch) overviewData = JSON.parse(rawMatch[0]);
            else throw new Error("Phase 1: Invalid AI JSON response format.");
        }

        // 3. Phase 2: Questions & Roadmap
        const detailsSystemPrompt = `You are an expert AI Interview Intelligence Coach.
Based on the provided overview, generate the "Top Questions" and "Study Roadmap".

RULES:
- TOP QUESTIONS: Provide exactly 8 most asked questions. For each, provide an "Answer Coach".
- ROADMAP: A compact 4-day study plan.

OUTPUT FORMAT:
Return ONLY a valid JSON object.
SCHEMA:
{
  "top_questions": [
    {
      "question": "string",
      "topic": "string",
      "difficulty": "Easy" | "Medium" | "Hard",
      "frequency": "High" | "Medium" | "Low",
      "answer_coach": {
         "ideal_structure": ["string"],
         "example_answer": "string",
         "common_mistakes": ["string"]
      }
    }
  ],
  "prep_roadmap": [
    { "day": number, "topics": ["string"], "tasks": ["string"] }
  ]
}`;

        const detailsUserPrompt = `Context:\n${JSON.stringify(overviewData)}\n\nGenerate the Top Questions and 4-Day Roadmap for ${company} ${role}. Be concise and ensure valid JSON.`;

        console.log(`[Interview Prep] Calling Phase 2: Questions & Roadmap (GPT-4o-Mini)...`);
        const phase2Response = await generateAIResponse(detailsUserPrompt, 'openai/gpt-4o-mini', detailsSystemPrompt, 0.4, 3000);

        let detailsData: DetailsData;
        try {
            const cleanJson = repairJson(phase2Response.text);
            detailsData = JSON.parse(cleanJson);
        } catch (e) {
            console.error('[Interview Prep] Phase 2 JSON parse failed:', e);
            const rawMatch = phase2Response.text.match(/\{[\s\S]*\}/);
            if (rawMatch) detailsData = JSON.parse(rawMatch[0]);
            else throw new Error("Phase 2: Could not extract valid JSON from response.");
        }

        // Define interfaces for mapping to avoid 'any'
        interface HiringProcessItem { round_name?: string; details?: string; expected_difficulty?: string; }
        interface HeatmapItem { topic?: string; percentage?: number | string; }
        interface QuestionItem {
            question?: string;
            topic?: string;
            difficulty?: string;
            frequency?: string;
            answer_coach?: {
                ideal_structure?: string[];
                example_answer?: string;
                common_mistakes?: string[];
            };
        }
        interface RoadmapItem { day?: number | string; topics?: (string | { topic: string })[]; tasks?: (string | { task: string })[]; }

        // Combine data with deep defensive defaults to prevent client-side crashes
        const parsedData: GeneratedPrep = {
            company: String(overviewData?.company || company || "Company"),
            role: String(overviewData?.role || role || "Software Engineer"),
            difficulty_level: (overviewData?.difficulty_level as 'Entry' | 'Intermediate' | 'Advanced') || 'Intermediate',
            hiring_process: Array.isArray(overviewData?.hiring_process)
                ? (overviewData.hiring_process as HiringProcessItem[]).map((r) => ({
                    round_name: String(r?.round_name || "Technical Round"),
                    details: String(r?.details || "Interview details not specified"),
                    expected_difficulty: String(r?.expected_difficulty || "Medium")
                }))
                : [],
            topic_heatmap: Array.isArray(overviewData?.topic_heatmap)
                ? (overviewData.topic_heatmap as HeatmapItem[]).map((t) => ({
                    topic: String(t?.topic || "General"),
                    percentage: typeof t?.percentage === 'number' ? t.percentage : parseInt(String(t?.percentage)) || 10
                }))
                : [],
            top_questions: Array.isArray(detailsData?.top_questions)
                ? (detailsData.top_questions as QuestionItem[]).map((q) => ({
                    question: String(q?.question || "Strategic question not provided"),
                    topic: String(q?.topic || "Core Knowledge"),
                    difficulty: (q?.difficulty as 'Easy' | 'Medium' | 'Hard') || "Medium",
                    frequency: (q?.frequency as 'High' | 'Medium' | 'Low') || "Medium",
                    answer_coach: {
                        ideal_structure: Array.isArray(q?.answer_coach?.ideal_structure)
                            ? q.answer_coach.ideal_structure.map((s: string) => String(s || ""))
                            : ["Structure not defined"],
                        example_answer: String(q?.answer_coach?.example_answer || "No example provided"),
                        common_mistakes: Array.isArray(q?.answer_coach?.common_mistakes)
                            ? q.answer_coach.common_mistakes.map((m: string) => String(m || ""))
                            : ["No common pitfalls listed"]
                    }
                })) : [],
            prep_roadmap: Array.isArray(detailsData?.prep_roadmap)
                ? (detailsData.prep_roadmap as RoadmapItem[]).map((d) => ({
                    day: typeof d?.day === 'number' ? d.day : parseInt(String(d?.day)) || 1,
                    topics: Array.isArray(d?.topics) ? d.topics.map((t: string | { topic: string }) => {
                        if (typeof t === 'string') return t;
                        return t?.topic || "Topics";
                    }) : ["Core Topics"],
                    tasks: Array.isArray(d?.tasks) ? d.tasks.map((t: string | { task: string }) => {
                        if (typeof t === 'string') return t;
                        return t?.task || "Tasks";
                    }) : ["Complete Review"]
                }))
                : []
        };

        console.log(`[Interview Prep] Data sanitized. Questions: ${parsedData.top_questions.length}`);

        // 4. Save to Intelligence Cache
        const admin = createAdminClient();
        const { error: upsertError } = await admin.from('interview_intelligence_reports').upsert({
            company: parsedData.company,
            role: parsedData.role,
            hiring_process: parsedData.hiring_process,
            top_questions: parsedData.top_questions,
            topic_heatmap: parsedData.topic_heatmap,
            prep_roadmap: parsedData.prep_roadmap
        }, { onConflict: 'company,role' });

        if (upsertError) {
            console.error('[Interview Prep] Database upsert error:', upsertError);
            // Non-blocking but logged
        }

        // 5. Log the generation (Company Prep)
        const session = await getSession();
        if (session && session.userId) {
            let sampleQuestions: string[] = [];
            if (parsedData.top_questions && Array.isArray(parsedData.top_questions)) {
                sampleQuestions = parsedData.top_questions.map((q) => q.question);
            }

            const { error: insertError } = await admin.from('mock_interviews').insert({
                user_id: session.userId,
                role: `${parsedData.company} - ${parsedData.role}`,
                job_description: 'Generated Interview Intelligence Report',
                experience_level: 'various',
                interview_type: 'Company Prep',
                num_questions: sampleQuestions.length,
                questions: sampleQuestions,
                interview_mode: 'company_prep'
            });

            if (insertError) {
                console.error('[Interview Prep] Database insert error:', insertError);
            }
        }

        return NextResponse.json({ success: true, data: parsedData });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[Interview Prep Generate API] Error:', err.message);
        return NextResponse.json({
            success: false,
            error: err.message || 'Failed to generate interview prep'
        }, { status: 500 });
    }
}
