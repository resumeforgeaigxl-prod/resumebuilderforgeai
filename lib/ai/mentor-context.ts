import { createAdminClient } from '@/lib/supabase/admin';
import { checkMentorPermission } from './governance-service';

const supabase = createAdminClient();

interface ForgeData {
  count?: number;
  avg_score?: number;
  total?: number;
  passed?: number;
  accuracy?: number;
  avg_performance?: number;
  applied?: number;
  active?: number;
  permission_denied?: boolean;
  message?: string;
  learn?: unknown[];
}

export interface UserContext {
  [key: string]: ForgeData | { readinessScore: number; strengths: string[]; weaknesses: string[]; recommendations: string[] } | undefined | null;
  analysis?: { readinessScore: number; strengths: string[]; weaknesses: string[]; recommendations: string[] } | null;
}

export async function buildUserContext(userId: string) {
  const context: UserContext = {};
  const forges = ['ResumeForge', 'CodingForge', 'InterviewForge', 'CareerForge', 'LearnForge', 'ExplainForge', 'JobForge'];

  for (const forge of forges) {
    const hasPermission = await checkMentorPermission(userId, forge);
    if (hasPermission) {
      context[forge] = await fetchForgeData(userId, forge);
    } else {
      context[forge] = { permission_denied: true, message: "Use AI to ask for access to this forge data" };
    }
  }

  // Calculate high-level analysis
  context.analysis = await analyzeUserProfile(userId, context);
  
  return context;
}

/**
 * Weighted Career Readiness Score logic
 */
function calculateReadinessScore(data: UserContext) {
    const weights = { resume: 0.3, coding: 0.3, interview: 0.25, projects: 0.15 };
    
    const resumeScore = (data.ResumeForge as ForgeData)?.avg_score || 0;
    const codingScore = (data.CodingForge as ForgeData)?.accuracy || 0;
    const interviewScore = (data.InterviewForge as ForgeData)?.avg_performance || 0;
    const projectScore = 50; // Manual projects baseline

    const total = 
        (resumeScore * weights.resume) + 
        (codingScore * weights.coding) + 
        (interviewScore * weights.interview) + 
        (projectScore * weights.projects);
        
    return Math.round(total);
}

async function analyzeUserProfile(_userId: string, context: UserContext) {
    const readinessScore = calculateReadinessScore(context);
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    const resumeAvgScore = (context.ResumeForge as ForgeData)?.avg_score || 0;
    if (resumeAvgScore > 70) strengths.push("Resume Quality");
    else if (resumeAvgScore > 0) weaknesses.push("Resume Impact");

    const codingAccuracy = (context.CodingForge as ForgeData)?.accuracy || 0;
    if (codingAccuracy > 60) strengths.push("Logic & Coding");
    else if (codingAccuracy > 0) weaknesses.push("Technical Foundations");

    return {
        readinessScore,
        strengths,
        weaknesses,
        recommendations: [
            readinessScore < 60 ? "Improve coding speed in CodingForge" : "Practice interviews",
            (context.ResumeForge as ForgeData)?.count === 0 ? "Generate your first resume" : null
        ].filter((item): item is string => item !== null)
    };
}

async function fetchForgeData(userId: string, forge: string): Promise<ForgeData | null> {
  switch (forge) {
    case 'ResumeForge':
      const { data: resumes } = await supabase.from('resumes').select('id, title, score, updated_at').eq('user_id', userId);
      const avgScore = resumes?.length ? resumes.reduce((acc, r) => acc + (r.score || 0), 0) / resumes.length : 0;
      return { count: resumes?.length || 0, avg_score: Math.round(avgScore) };
    case 'CodingForge':
      const { data: coding } = await supabase.from('coding_submissions').select('status, score').eq('user_id', userId);
      const passed = coding?.filter(s => s.status === 'success').length || 0;
      return { total: coding?.length || 0, passed, accuracy: coding?.length ? Math.round((passed / coding.length) * 100) : 0 };
    case 'InterviewForge':
      const { data: interviews } = await supabase.from('mock_interviews').select('score, feedback').eq('user_id', userId);
      const avgPerf = interviews?.length ? interviews.reduce((acc, i) => acc + (i.score || 0), 0) / interviews.length : 0;
      return { count: interviews?.length || 0, avg_performance: Math.round(avgPerf) };
    case 'JobForge':
      const { data: jobs } = await supabase.from('job_applications').select('status').eq('user_id', userId);
      return { applied: jobs?.length || 0, active: jobs?.filter(j => j.status === 'applied').length || 0 };
    case 'LearnForge':
      const { data: learn } = await supabase.from('user_learning_progress').select('*').eq('user_id', userId);
      return { learn: learn || [] };
    // Add other forges as needed
    default:
      return null;
  }
}
