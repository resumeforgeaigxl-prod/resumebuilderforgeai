import { callAI } from '../router';

export class InterviewForge {
    static async generateMockQuestions(role: string, level: string, userId?: string) {
        const prompt = `Generate 5 technical interview questions for a ${level} ${role} position.`;
        
        return await callAI({
            task: 'interview',
            prompt,
            userId,
            responseFormat: 'json',
            systemPrompt: 'You are an expert technical interviewer.'
        });
    }

    static async generateSingleQuestion(topic: string, difficulty: string, userId?: string) {
        const prompt = `Generate one challenging technical interview question for the topic: ${topic} (Level: ${difficulty}). Include the question and a sample answer.`;
        
        return await callAI({
            task: 'interview',
            prompt,
            userId,
            responseFormat: 'json',
            systemPrompt: 'You are an expert technical interviewer. Return JSON: { "question": "...", "answer": "..." }'
        });
    }

    static async evaluateResponse(question: string, userAnswer: string, userId?: string) {
        const prompt = `Question: ${question}\nCandidate Answer: ${userAnswer}\n\nEvaluate the answer and provide feedback and a score (0-100).`;
        
        return await callAI({
            task: 'interview',
            prompt,
            userId,
            responseFormat: 'json'
        });
    }
}
