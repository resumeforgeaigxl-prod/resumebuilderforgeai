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
    let totalInserted = 0;

    for (let i = 0; i < count; i++) {
        try {
            const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

            const prompt = `
            Generate EXACTLY ONE unique coding interview question.
            Type: Randomly pick from [Programming, SQL, Debugging, Logic].
            Topic: ${topic}.
            
            Provide:
            - title: Clear and concise.
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
            
            SPECIAL REQUEST:
            If type is 'Logic' or if the question is visual, generate a high-quality 'image_svg' string (white/indigo strokes, transparent).
            
            Return ONLY a valid JSON object:
            {
              "title": "...",
              "description": "...",
              "difficulty": "Easy",
              "type": "...",
              "topic": "...",
              "company_tags": ["..."],
              "image_svg": "...",
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
                "expert competitive programmer. Return ONLY ONE JSON object.",
                0.1,
                4000 // Much smaller token limit per call
            );

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
                    image_svg: q.image_svg,
                    approach: q.approach,
                    interview_tips: q.interview_tips,
                    time_complexity: q.time_complexity,
                    space_complexity: q.space_complexity
                })
                .select()
                .single();

            if (qError) {
                console.error(`[Gen] Error inserting question ${q.title}:`, qError);
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

            totalInserted++;
        } catch (err) {
            console.error(`[Gen] Error in iteration ${i}:`, err);
        }
    }

    return totalInserted;
}
