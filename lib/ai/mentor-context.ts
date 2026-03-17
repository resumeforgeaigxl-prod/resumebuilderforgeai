import { createClient } from '@supabase/supabase-js';
import { checkMentorPermission } from './governance-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function buildUserContext(userId: string) {
  const context: any = {};
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
function calculateReadinessScore(data: any) {
    const weights = { resume: 0.3, coding: 0.3, interview: 0.25, projects: 0.15 };
    
    const resumeScore = data.ResumeForge?.avg_score || 0;
    const codingScore = data.CodingForge?.accuracy || 0;
    const interviewScore = data.InterviewForge?.avg_performance || 0;
    const projectScore = 50; // Manual projects baseline

    const total = 
        (resumeScore * weights.resume) + 
        (codingScore * weights.coding) + 
        (interviewScore * weights.interview) + 
        (projectScore * weights.projects);
        
    return Math.round(total);
}

async function analyzeUserProfile(userId: string, context: any) {
    const readinessScore = calculateReadinessScore(context);
    
    const strengths = [];
    const weaknesses = [];
    
    if ((context.ResumeForge?.avg_score || 0) > 70) strengths.push("Resume Quality");
    else if ((context.ResumeForge?.avg_score || 0) > 0) weaknesses.push("Resume Impact");

    if ((context.CodingForge?.accuracy || 0) > 60) strengths.push("Logic & Coding");
    else if ((context.CodingForge?.accuracy || 0) > 0) weaknesses.push("Technical Foundations");

    return {
        readinessScore,
        strengths,
        weaknesses,
        recommendations: [
            readinessScore < 60 ? "Improve coding speed in CodingForge" : "Practice interviews",
            context.ResumeForge?.count === 0 ? "Generate your first resume" : null
        ].filter(Boolean)
    };
}

async function fetchForgeData(userId: string, forge: string) {
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
      return { learn };
    // Add other forges as needed
    default:
      return null;
  }
}
