import { callAI } from '../router';

export class CodingForge {
    static async review(code: string, language: string, userId?: string) {
        const prompt = `Review this ${language} code for bugs, performance issues, and best practices:\n\n${code}`;
        
        return await callAI({
            task: 'code',
            prompt,
            userId,
            systemPrompt: 'You are an expert software engineer and code reviewer.'
        });
    }

    static async explain(code: string, language: string, userId?: string) {
        const prompt = `Explain this ${language} code in simple terms:\n\n${code}`;
        
        return await callAI({
            task: 'explain',
            prompt,
            userId
        });
    }

    static async optimize(code: string, language: string, userId?: string) {
        const prompt = `Optimize this ${language} code for better performance and readability:\n\n${code}`;
        
        return await callAI({
            task: 'code',
            prompt,
            userId
        });
    }
}
