import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-provider';
import google from 'googlethis';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 60; // Set higher timeout limit for Vercel
export const dynamic = 'force-dynamic';

type GeneratedPrep = {
    company?: string;
    role?: string;
    rounds?: Array<{
        round?: string;
        questions?: Array<{
            question?: string;
        }>;
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
            `${company} ${role} interview questions`,
            `${company} ${role} interview experience`,
            `${company} ${role} coding interview problems`
        ];

        let webContext = '';
        const options = {
            page: 0,
            safe: false, // Safe Search
            parse_ads: false, // If set to true sponsored results will be parsed
            additional_params: {
                hl: 'en'
            }
        };

        // Execute searches in parallel
        await Promise.all(queries.map(async (query) => {
            try {
                const response = await google.search(query, options);
                if (response.results && response.results.length > 0) {
                    const descriptions = response.results.map(r => r.description).join(' ');
                    webContext += `\nSearch Query: ${query}\nResults: ${descriptions}\n`;
                }
            } catch (err) {
                console.error(`Search failed for query: ${query}`, err);
            }
        }));

        if (!webContext.trim()) {
            webContext = "No specific online context found. Rely on general industry knowledge.";
        }

        // 2. Prepare AI Prompt
        const systemPrompt = `You are an expert technical recruiter and interview prep AI. 
Generate realistic interview preparation for specific companies and roles using the provided web search context.

RULES:
- Extract commonly reported interview questions from the web context provided.
- Do NOT invent unrealistic or overly generic questions if specific ones are mentioned.
- Prefer frequently mentioned interview questions and topics.
- Structure the questions accurately by interview rounds (e.g., Online Assessment, Technical Interview, HR Interview).
- Each question must include: question text, difficulty (Easy, Medium, or Hard), topic, and interview round.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this structure EXACTLY. No markdown, no extra text.
{
  "company": "string",
  "role": "string",
  "rounds": [
    {
      "round": "string (e.g. Round 1 - Online Assessment)",
      "questions": [
        {
          "question": "string",
          "difficulty": "Easy" | "Medium" | "Hard",
          "topic": "string",
          "interview_round": "string"
        }
      ]
    }
  ]
}`;

        const userPrompt = `Company: ${company}
Role: ${role}

--- WEB SEARCH CONTEXT ---
${webContext}
--------------------------

Extract and generate the structured interview preparation for this company and role based primarily on the context above.`;

        // 3. Call AI
        const aiResponseMeta = await generateAIResponse(userPrompt, 'openai/gpt-4o-mini', systemPrompt, 0.7);
        const rawAiResponse = aiResponseMeta.text;

        let parsedData: GeneratedPrep;
        try {
            parsedData = JSON.parse(rawAiResponse);
        } catch {
            console.error("Failed to parse AI response JSON:", rawAiResponse);
            // Fallback cleanup
            const jsonMatch = rawAiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsedData = JSON.parse(jsonMatch[0]);
            else throw new Error("Invalid AI JSON response format.");
        }

        // 4. Log the generation (Company Prep)
        const session = await getSession();
        if (session && session.userId) {
            const admin = createAdminClient();

            // Extract some sample generated questions for logging
            let sampleQuestions: string[] = [];
            if (parsedData.rounds && Array.isArray(parsedData.rounds)) {
                for (const r of parsedData.rounds) {
                    if (r.questions && Array.isArray(r.questions)) {
                        sampleQuestions = [
                            ...sampleQuestions,
                            ...r.questions.map(q => q.question).filter((q): q is string => typeof q === 'string' && q.length > 0),
                        ];
                    }
                }
            }

            // We log this in mock_interviews with interview_mode = 'company_prep'
            await admin.from('mock_interviews').insert({
                user_id: session.userId,
                role: `${company} - ${role}`, // Storing both in role field
                job_description: 'Generated Company Prep Interview Guide',
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
