import { generateAIResponse } from './ai-provider';

export interface IntentResult {
    isJobRelated: boolean;
    violationType?: string;
}

const INTENT_SYSTEM_PROMPT = `You are JobForgeAI's specialized intent classifier. 
Your primary directive is to distinguish between career-related professional queries and unrelated topics.

STRICTLY ALLOW (Job Related) - All of these are ALLOWED:
1. Resume & Cover Letter Topics:
   - Resume creation, improvement, optimization
   - ATS optimization and keyword matching
   - Resume formatting and structure
   - Cover letter writing
   - Portfolio building

2. Interview Preparation:
   - Technical interview questions
   - System design and architecture
   - HR and behavioral interview questions
   - STAR method practice
   - Company-specific interview experiences
   - Mock interview preparation
   - Interview anxiety and confidence building

3. Coding & Problem Solving:
   - Data Structures and Algorithms (DSA)
   - Coding problems and solutions
   - Logic puzzles and problem-solving
   - Aptitude and reasoning questions
   - LeetCode-style problems

4. Job Search & Career:
   - Job description analysis and matching
   - Career roadmaps and skill paths (DevOps, Backend, Frontend, Data Science, etc.)
   - Job market trends and insights
   - Company research and industry analysis
   - Salary negotiation advice
   - Career growth strategies for freshers and experienced developers
   - Networking and professional development
   - Skill building and learning paths

STRICTLY BLOCK (Not Career Related):
- Politics, Government, Religion, or ideological debates
- Personal relationships and dating advice
- Medical or health advice
- Adult or sexually explicit content
- Harmful, hateful, or unethical content
- Illegal activities or hacking advice
- General homework unrelated to career prep
- Casual chit-chat unrelated to career
- Financial, investment, or trading advice

Return ONLY valid JSON: {"isJobRelated": boolean, "violationType": string | null}`;

export async function isJobRelated(message: string): Promise<IntentResult> {
    try {
        const aiResult = await generateAIResponse(
            `Classify this user message strictly based on your instructions. Message: "${message}"`,
            'openai/gpt-4o-mini',
            INTENT_SYSTEM_PROMPT
        );

        // Parse JSON (defensively handling potential markdown blocks)
        const cleanText = aiResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanText) as IntentResult;

        return result;
    } catch (e) {
        console.error('[AI Intent Filter] classification error:', e);
        // Default to allow if classification completely fails, to prevent broken UX,
        // but real violations will be caught by the main system prompt anyway.
        return { isJobRelated: true };
    }
}
