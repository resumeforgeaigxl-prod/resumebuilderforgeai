import { createAdminClient } from './supabase/admin';
import { generateAIResponse, extractJson } from './ai-provider';

const TOPICS = [
    'Arrays', 'Strings', 'HashMaps', 'Recursion',
    'Sorting', 'Searching', 'Dynamic Programming',
    'Graphs', 'Trees', 'SQL', 'Bit Manipulation', 'Logic'
];

const LANGUAGES = [
    'Java', 'Python', 'C', 'C++', 'JavaScript',
    'Go', 'Rust', 'C#', 'PHP'
];

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
            Type: Randomly pick from [Programming, SQL, Debugging, Logic].
            Topic: ${topic}.
            
            UNiQUENESS RULE: Generate a highly specific and creative problem. Avoid generic titles like "Reverse a String" or "Binary Search". Try to create a scenario-based or advanced version of common problems.
            
            Provide:
            - title: Highly specific and unique.
            - description: Detailed problem statement.
            - difficulty: Easy, Medium, or Hard.
            - type: The picked type.
            - topic: ${topic}.
            - company_tags: Array of companies.
            - approach: Step-by-step logic explanation.
            - interview_tips: Advice for answering this in interviews.
            - time_complexity: e.g. O(N log N).
            - space_complexity: e.g. O(1).
            - solutions: Object with keys as language names.
              For Programming: include ${LANGUAGES.join(', ')}.
              For SQL: include 'SQL'.
              For Logic: include explanation.
            
            Return ONLY a valid JSON object:
            {
              "title": "...",
              "description": "...",
              "difficulty": "Easy",
              "type": "...",
              "topic": "...",
              "company_tags": ["..."],
              "approach": "...",
              "interview_tips": "... ",
              "time_complexity": "...",
              "space_complexity": "...",
              "solutions": { "Java": "...", "Python": "..." }
            }
            `;

            console.log(`[Gen] Requesting question ${i + 1}/${count} (Topic: ${topic})...`);
            const response = await generateAIResponse(
                prompt,
                'openai/gpt-4o-mini',
                "expert competitive programmer. Focus on creating unique, non-generic interview questions.",
                0.8, // Increased temperature for variety
                4000
            );

            stats.generated++;
            const jsonString = extractJson(response.text);
            const q = JSON.parse(jsonString);

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
            const solutionsToInsert = Object.entries(q.solutions).map(([lang, code]) => ({
                question_id: questionId,
                language: lang,
                code: code as string
            }));
            if (solutionsToInsert.length > 0) {
                await supabase.from('coding_solutions').insert(solutionsToInsert);
            }

            // Companies
            const companiesToInsert = (q.company_tags || []).map((company: string) => ({
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

