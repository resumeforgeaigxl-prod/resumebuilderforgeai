import { createAdminClient } from './supabase/admin';
import { generateAIResponse, extractJson } from './ai-provider';

const TOPICS = [
    'Arrays', 'Strings', 'HashMaps', 'Recursion',
    'Sorting', 'Searching', 'Dynamic Programming',
    'Graphs', 'Trees', 'SQL', 'Bit Manipulation', 'Logic'
];

interface GeneratedTestCase {
    input: string;
    output: string;
    is_hidden?: boolean;
}

interface GeneratedCodingQuestion {
    title: string;
    description: string;
    difficulty: string;
    type?: string;
    topic: string;
    approach: string;
    interview_tips: string;
    time_complexity: string;
    space_complexity: string;
    test_cases?: GeneratedTestCase[];
    solutions?: Record<string, string>;
    company_tags?: string[];
}

export async function generateCodingQuestions(count: number = 5) {
    const stats = {
        requested: count,
        generated: 0,
        inserted: 0,
        skipped: 0,
        failed: 0
    };

    for (let i = 0; i < count; i++) {
        try {
            const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

            const prompt = `
            Generate EXACTLY ONE unique coding interview question.
            Type: Randomly pick from [Programming, Debugging].
            Topic: ${topic}.
            
            Provide:
            - title: Highly specific and unique.
            - description: Detailed problem statement.
            - difficulty: Easy, Medium, or Hard.
            - type: The picked type.
            - topic: ${topic}.
            - company_tags: Array of companies.
            - approach: Step-by-step logic.
            - interview_tips: Advice.
            - time_complexity: O(...).
            - space_complexity: O(...).
            - test_cases: Array of 3 objects { "input": "...", "output": "...", "is_hidden": boolean }. 
                - Ensure the first test case matches the example usage and is NOT hidden.
                - The remaining 2 should be hidden edge cases.
            - solutions: Object { "Java": "...", "Python": "..." }
            
            Return ONLY a valid JSON object.
            `;

            console.log(`[Gen] Requesting question ${i + 1}/${count} (Topic: ${topic})...`);
            const response = await generateAIResponse(
                prompt,
                'openai/gpt-4o-mini',
                "expert competitive programmer. Focus on creating unique, non-generic interview questions with automated test cases.",
                0.8,
                4000
            );

            stats.generated++;
            const jsonString = extractJson(response.text);
            const q = JSON.parse(jsonString) as GeneratedCodingQuestion;

            const supabase = createAdminClient();
            const slug = q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const { data: existing } = await supabase
                .from('coding_questions')
                .select('id')
                .eq('slug', slug)
                .single();

            if (existing) {
                console.log(`[Gen] Skipping duplicate: ${q.title}`);
                stats.skipped++;
                continue;
            }

            const { data: questionData, error: qError } = await supabase
                .from('coding_questions')
                .insert({
                    title: q.title,
                    slug: slug,
                    description: q.description,
                    difficulty: q.difficulty,
                    topic: q.topic,
                    type: q.type || 'Programming',
                    approach: q.approach,
                    interview_tips: q.interview_tips,
                    time_complexity: q.time_complexity,
                    space_complexity: q.space_complexity
                })
                .select()
                .single();

            if (qError) {
                console.error(`[Gen] Error inserting question ${q.title}:`, qError);
                stats.failed++;
                continue;
            }

            const questionId = questionData.id;

            // Solutions
            const solutionsToInsert = Object.entries(q.solutions ?? {}).map(([lang, code]) => ({
                question_id: questionId,
                language: lang,
                code
            }));
            if (solutionsToInsert.length > 0) {
                await supabase.from('coding_solutions').insert(solutionsToInsert);
            }

            // Test Cases
            const testCasesToInsert = (q.test_cases || []).map((tc, idx) => ({
                question_id: questionId,
                input: tc.input,
                expected_output: tc.output,
                is_hidden: tc.is_hidden || false,
                order_index: idx
            }));
            if (testCasesToInsert.length > 0) {
                await supabase.from('coding_test_cases').insert(testCasesToInsert);
            }

            // Companies
            const companiesToInsert = (q.company_tags || []).map((company) => ({
                question_id: questionId,
                company_name: company
            }));
            if (companiesToInsert.length > 0) {
                await supabase.from('coding_companies').insert(companiesToInsert);
            }

            stats.inserted++;
        } catch (err) {
            console.error(`[Gen] Error in iteration ${i}:`, err);
            stats.failed++;
        }
    }

    return stats;
}
