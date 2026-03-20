import { callAI } from '../router';

export class LearnForge {
    static async explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'expert' = 'beginner', userId?: string) {
        const prompt = `Explain the concept of "${concept}" at an ${level} level. Use analogies and examples.`;
        
        return await callAI({
            task: 'learn',
            prompt,
            userId
        });
    }

    static async createStudyPlan(topic: string, durationWeeks: number, userId?: string) {
        const prompt = `Create a ${durationWeeks}-week study plan for regular self-study on "${topic}".`;
        
        return await callAI({
            task: 'learn',
            prompt,
            userId,
            responseFormat: 'json'
        });
    }
}

export class KnowledgeForge {
    static async searchInKnowledgeBase(query: string, userId?: string) {
        const prompt = `Search for relevant information regarding "${query}" in the simulated domain knowledge base.`;
        
        return await callAI({
            task: 'knowledge',
            prompt,
            userId
        });
    }
}
