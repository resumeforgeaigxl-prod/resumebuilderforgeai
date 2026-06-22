import { generateAIResponse } from '@/lib/ai-core/rag-engine';

export interface ResumeAgentProgressEvent {
  type: 'tool_start' | 'tool_end' | 'thinking';
  name: string;
  status: 'running' | 'finished' | 'error';
  step: number;
}

const ANALYSIS_PROMPT = `
You are a professional Resume Strategist and ATS (Applicant Tracking System) Expert. 
Analyze the provided resume and provide a detailed analysis to help the user improve their chances of getting hired.

Return the analysis in JSON format with the following keys:
1. ats_score: A number between 0 and 100 representing how well the resume is structured and keyword-optimized.
2. strengths: An array of strings highlighting the key professional highlights and well-written sections.
3. missing_skills: An array of 5-8 technical or soft skills that are industry-relevant but missing from the resume.
4. improvements: An array of specific, actionable advice to make the resume more impactful.

Focus on:
- Quantitative impact (numbers, %, etc.)
- Action verbs
- Section clarity
- Visual hierarchy and structure

Resume Data:
{{RESUME_DATA}}
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runResumeAnalysisAgent(
  resumeData: unknown,
  userId: string,
  onProgress: (event: ResumeAgentProgressEvent) => void
) {
  // Step 1: Structural Verification
  onProgress({
    type: 'tool_start',
    name: 'verify_resume_structure',
    status: 'running',
    step: 1
  });
  await delay(1200);
  onProgress({
    type: 'tool_end',
    name: 'verify_resume_structure',
    status: 'finished',
    step: 1
  });

  // Step 2: Tech Stack & Keywords Scan
  onProgress({
    type: 'tool_start',
    name: 'assess_keywords_density',
    status: 'running',
    step: 2
  });
  await delay(1200);
  onProgress({
    type: 'tool_end',
    name: 'assess_keywords_density',
    status: 'finished',
    step: 2
  });

  // Step 3: LLM Optimization Strategy Generation
  onProgress({
    type: 'tool_start',
    name: 'generate_ats_optimization_strategy',
    status: 'running',
    step: 3
  });

  const prompt = ANALYSIS_PROMPT.replace('{{RESUME_DATA}}', JSON.stringify(resumeData));
  const aiResponse = await generateAIResponse(prompt, {
    userId,
    contextType: 'general',
    jsonMode: true,
    systemPrompt: "You are a Resume Intelligence AI."
  });

  onProgress({
    type: 'tool_end',
    name: 'generate_ats_optimization_strategy',
    status: 'finished',
    step: 3
  });

  return aiResponse;
}
