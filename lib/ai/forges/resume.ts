import { callAI } from '../router';
import { ResumeData } from '@/types/resume';

export interface ProfileContext {
    targetRole: string;
    skills: string[];
    professionalSummary: string;
    experienceLevel: string;
    preferredWorkMode: string;
}

export class ResumeForge {
    static async optimize(resumeData: ResumeData, jobDescription: string, userId?: string, profileContext?: ProfileContext) {
        // Build profile-aware system prompt
        let profileSection = '';
        if (profileContext) {
            const parts: string[] = [];
            if (profileContext.targetRole) parts.push(`Target Role: ${profileContext.targetRole}`);
            if (profileContext.experienceLevel) parts.push(`Experience Level: ${profileContext.experienceLevel}`);
            if (profileContext.skills?.length) parts.push(`Known Skills: ${profileContext.skills.join(', ')}`);
            if (profileContext.professionalSummary) parts.push(`Career Summary: ${profileContext.professionalSummary}`);
            if (profileContext.preferredWorkMode) parts.push(`Work Preference: ${profileContext.preferredWorkMode}`);
            if (parts.length > 0) {
                profileSection = `\n\nCANDIDATE PROFILE (use this to personalize the resume):\n${parts.join('\n')}`;
            }
        }

        const systemPrompt = `You are a resume enhancement engine focused on intelligent JD-alignment.
${profileSection}

RULES:
- Use the candidate's REAL profile data. Do NOT fabricate experience, projects, or achievements.
- Match the candidate's actual experience level — do not inflate a student resume to sound like a senior engineer.
- Naturally integrate matching keywords from the JD into the resume content.
- If the candidate has a professional summary in their profile, use it as a starting point for the resume summary.
- Prioritize the candidate's known skills that overlap with the JD requirements.
- Keep education, certifications, and personal info intact — only enhance descriptions and bullet points.

Return a JSON object containing:
- "optimized_resume": The full ResumeData object with enhanced content.
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

    static async generateSummary(resumeData: ResumeData, userId?: string, profileContext?: ProfileContext) {
        let contextHint = '';
        if (profileContext?.targetRole) {
            contextHint += `\nTarget Role: ${profileContext.targetRole}`;
        }
        if (profileContext?.experienceLevel) {
            contextHint += `\nExperience Level: ${profileContext.experienceLevel}`;
        }
        if (profileContext?.professionalSummary) {
            contextHint += `\nExisting Summary: ${profileContext.professionalSummary}`;
        }

        const prompt = `Generate a powerful professional summary for this resume:${contextHint}\n${JSON.stringify(resumeData)}`;
        
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
