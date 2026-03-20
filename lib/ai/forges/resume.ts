import { callAI } from '../router';
import { ResumeData } from '@/types/resume';

export class ResumeForge {
    static async optimize(resumeData: ResumeData, jobDescription: string, userId?: string) {
        const systemPrompt = `You are a resume enhancement engine focused on intelligent JD-alignment.
        Return a JSON object containing:
        - "optimized_resume": The full ResumeData object.
        - "analysis": { "match_score": 0-100, "matched_keywords": [], "missing_keywords": [], "improvements": [] }`;

        const prompt = `Enhance this Resume JSON to align with the provided Job Description.\n\nRESUME:\n${JSON.stringify(resumeData)}\n\nJOB DESCRIPTION:\n${jobDescription}`;

        const response = await callAI({
            task: 'resume',
            prompt,
            systemPrompt,
            userId,
            responseFormat: 'json',
            temperature: 0.2
        });

        return JSON.parse(response.text);
    }

    static async generateSummary(resumeData: ResumeData, userId?: string) {
        const prompt = `Generate a powerful professional summary for this resume:\n${JSON.stringify(resumeData)}`;
        
        return await callAI({
            task: 'resume',
            prompt,
            userId,
            priority: 'normal'
        });
    }

    static async matchJD(resumeData: ResumeData, jobDescription: string, userId?: string) {
        const prompt = `Analyze how well this resume matches the JD. Return a score out of 100 and key points.\n\nRESUME:\n${JSON.stringify(resumeData)}\n\nJD:\n${jobDescription}`;
        
        return await callAI({
            task: 'resume',
            prompt,
            userId,
            responseFormat: 'json'
        });
    }
}
