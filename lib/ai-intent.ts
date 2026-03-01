import { generateAIResponse } from './ai-provider';

export interface IntentResult {
    isJobRelated: boolean;
    violationType?: string;
}

const INTENT_SYSTEM_PROMPT = `You are JobForgeAI's specialized intent classifier. 
Your primary directive is to distinguish between career-related professional queries and unrelated topics.

STRICTLY ALLOW (Job Related):
- Data Structures and Algorithms (DSA)
- Placement coding questions and logic puzzles
- Technical interview preparation (System design, patterns, etc.)
- Resume optimization and JD matching advice
- HR interview preparation and behavioral questions
- Professional career growth and networking advice
- Company-specific interview experiences

STRICTLY BLOCK (Violation):
- Politics, Government, and Current Affairs (non-career)
- Personal relationship or life advice
- General homework/assignments NOT related to career prep
- Medical, Religious, or Adult content
- Harmful, hate speech, or unethical content
- Irrelevant daily chit-chat

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
