import { callAI } from '../router';
import { ResumeForge } from './resume';
import type { ResumeData } from '@/types/resume';

export class MentorForge {
    /**
     * Central AI system that can coordinate multiple forges.
     */
    static async analyzeUser(context: { 
        resumeData?: ResumeData, 
        codeSnippets?: string[], 
        careerGoals?: string 
    }, userId?: string) {
        
        const systemPrompt = `You are the central Mentor AI for ResumeForgeAI. 
        Your goal is to provide a holistic career analysis by coordinating between specialized forges.
        Analyze skill gaps, suggest improvements, and provide a unified roadmap.`;

        const prompt = `User Context:
        Resume: ${context.resumeData ? 'Attached' : 'Missing'}
        Code Samples: ${context.codeSnippets?.length || 0}
        Goals: ${context.careerGoals || 'Not set'}
        
        Please provide a comprehensive mentor analysis and suggest next steps.`;

        return await callAI({
            task: 'mentor',
            prompt,
            userId,
            systemPrompt
        });
    }

    static async detectSkillGaps(resumeData: ResumeData, targetJobDescription: string, userId?: string) {
        // Orchestrate: ResumeForge + CareerForge concepts
        const analysis = await ResumeForge.matchJD(resumeData, targetJobDescription, userId);
        
        const prompt = `Based on this resume-JD match analysis, identify specific skill gaps and suggest concrete learning resources.\n\nAnalysis: ${JSON.stringify(analysis)}`;
        
        return await callAI({
            task: 'mentor',
            prompt,
            userId,
            responseFormat: 'json'
        });
    }
}
