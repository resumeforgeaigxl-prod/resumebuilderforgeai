import { callAI } from '../router';

export class CareerForge {
    static async generateRoadmap(currentRole: string, targetRole: string, skills: string[], userId?: string) {
        const prompt = `Create a step-by-step career roadmap to move from ${currentRole} to ${targetRole}. Current skills: ${skills.join(', ')}.`;
        
        return await callAI({
            task: 'career',
            prompt,
            userId,
            responseFormat: 'json'
        });
    }

    static async suggestCertifications(targetRole: string, userId?: string) {
        const prompt = `Suggest the top 5 industry-recognized certifications for a ${targetRole} career path.`;
        
        return await callAI({
            task: 'career',
            prompt,
            userId
        });
    }
}
