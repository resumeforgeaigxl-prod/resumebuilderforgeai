import { callAI } from '../router';

export class ProjectForge {
    static async analyzeProject(files: { name: string, content: string }[], userId?: string) {
        const fileNames = files.map(f => f.name).join(', ');
        const prompt = `Analyze this software project structure and core logic. Files: ${fileNames}.\n\nProvide a technical overview and suggest architectural improvements.`;
        
        return await callAI({
            task: 'project',
            prompt,
            userId,
            systemPrompt: 'You are a senior technical architect.'
        });
    }

    static async generateDocumentation(code: string, userId?: string) {
        const prompt = `Generate comprehensive technical documentation for this code:\n\n${code}`;
        
        return await callAI({
            task: 'project',
            prompt,
            userId
        });
    }
}
