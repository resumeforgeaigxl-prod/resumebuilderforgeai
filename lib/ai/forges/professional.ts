import { callAI } from '../router';

export class CompanyPrepForge {
    static async researchCompany(companyName: string, userId?: string) {
        const prompt = `Provide a comprehensive research report on ${companyName}. Include their core values, tech stack, recent news, and common interview themes.`;
        
        return await callAI({
            task: 'company-prep',
            prompt,
            userId,
            systemPrompt: 'You are a professional corporate researcher.'
        });
    }

    static async generateCaseStudy(industry: string, role: string, userId?: string) {
        const prompt = `Generate a realistic case study assignment for a ${role} position in the ${industry} industry.`;
        
        return await callAI({
            task: 'company-prep',
            prompt,
            userId,
            responseFormat: 'json'
        });
    }
}

export class PortfolioForge {
    static async suggestProjects(skills: string[], goal: string, userId?: string) {
        const prompt = `Suggest 3 unique portfolio projects for someone with ${skills.join(', ')} skills aiming to ${goal}. Provide names and feature lists.`;
        
        return await callAI({
            task: 'portfolio',
            prompt,
            userId,
            responseFormat: 'json'
        });
    }

    static async writeProjectBios(projectName: string, techStack: string[], userId?: string) {
        const prompt = `Write a compelling 2-sentence bio for a portfolio project named "${projectName}" built with ${techStack.join(', ')}.`;
        
        return await callAI({
            task: 'portfolio',
            prompt,
            userId
        });
    }
}
