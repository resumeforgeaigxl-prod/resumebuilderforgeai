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

        // 2. Prepare AI Prompt
        const systemPrompt = `You are an expert AI Interview Intelligence Coach. 
Generate a comprehensive, data-driven "Interview Intelligence Report" for specific companies and roles.

RULES:
- Use the web context to find ACTUAL hiring rounds and questions if possible.
- If specific data is missing, use patterns from similar Tier-1 or Mid-size companies.
- HIRING PROCESS: Provide 3-5 rounds with detailed context.
- TOP QUESTIONS: Aggregate 15-20 most asked questions. For each, provide an "Answer Coach".
- HEATMAP: Breakdown topics (e.g., DSA, System Design, Behavioral) as percentages.
- ROADMAP: A 4-day intensive study plan.
- DIFFICULTY: Estimate overall difficulty (Entry, Intermediate, Advanced).

OUTPUT FORMAT:
Return ONLY a valid JSON object matching the structured schema.

SCHEMA:
{
  "company": "string",
  "role": "string",
  "difficulty_level": "Entry" | "Intermediate" | "Advanced",
  "hiring_process": [
    { "round_name": "string", "details": "string", "expected_difficulty": "string" }
  ],
  "top_questions": [
    {
      "question": "string",
      "topic": "string",
      "difficulty": "Easy" | "Medium" | "Hard",
      "frequency": "High" | "Medium" | "Low",
      "answer_coach": {
         "ideal_structure": ["point 1", "point 2"],
         "example_answer": "string",
         "common_mistakes": ["mistake 1", "mistake 2"]
      }
    }
  ],
  "topic_heatmap": [
    { "topic": "string", "percentage": number }
  ],
  "prep_roadmap": [
    { "day": number, "topics": ["string"], "tasks": ["string"] }
  ]
}`;

        const userPrompt = `Target: ${company} - ${role}

--- WEB INTELLIGENCE ---
${webContext}
-----------------------

Generate the full Interview Intelligence Report. Be specific about ${company}'s culture and technical bar.`;

        // 3. Call AI
        const aiResponseMeta = await generateAIResponse(userPrompt, 'openai/gpt-4o', systemPrompt, 0.4);
        const rawAiResponse = aiResponseMeta.text;

        let parsedData: GeneratedPrep;
        try {
            // Cleanup in case of markdown
            const cleanJson = rawAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleanJson);
        } catch {
            const jsonMatch = rawAiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsedData = JSON.parse(jsonMatch[0]);
            else throw new Error("Invalid AI JSON response format.");
        }

        // 4. Save to Intelligence Cache
        const admin = createAdminClient();
        await admin.from('interview_intelligence_reports').upsert({
            company: company,
            role: role,
            hiring_process: parsedData.hiring_process,
            top_questions: parsedData.top_questions,
            topic_heatmap: parsedData.topic_heatmap,
            prep_roadmap: parsedData.prep_roadmap
        }, { onConflict: 'company,role' });

        // 5. Log the generation (Company Prep)
        const session = await getSession();
        if (session && session.userId) {
            // Extract some sample generated questions for logging
            let sampleQuestions: string[] = [];
            if (parsedData.top_questions && Array.isArray(parsedData.top_questions)) {
                sampleQuestions = parsedData.top_questions.map((q: { question: string }) => q.question);
            }

            // We log this in mock_interviews with interview_mode = 'company_prep'
            await admin.from('mock_interviews').insert({
                user_id: session.userId,
                role: `${company} - ${role}`,
                job_description: 'Generated Interview Intelligence Report',
                experience_level: 'various',
                interview_type: 'Company Prep',
                num_questions: sampleQuestions.length,
                questions: sampleQuestions,
                interview_mode: 'company_prep'
            });
        }

        return NextResponse.json({ success: true, data: parsedData });
    } catch (error: unknown) {
        console.error('[Interview Prep Generate API] Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate interview prep' }, { status: 500 });
    }
}
