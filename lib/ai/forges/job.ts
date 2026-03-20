import { callAI } from '../router';

export class JobForge {
    static async findRelatedJobs(skills: string[], location?: string, userId?: string) {
        const prompt = `Suggest job titles and companies for someone with these skills: ${skills.join(', ')}. ${location ? `Preferred location: ${location}` : ''}`;
        
        return await callAI({
            task: 'job',
            prompt,
            userId,
            responseFormat: 'json'
        });
    }

    static async generateCoverLetter(resumeSummary: string, jobTitle: string, company: string, userId?: string) {
        const prompt = `Write a professional cover letter for a ${jobTitle} role at ${company} based on this summary:\n\n${resumeSummary}`;
        
        return await callAI({
            task: 'job',
            prompt,
            userId
        });
    }
}
