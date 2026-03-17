import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GapReport {
  strengths: string[];
  moderate: string[];
  weak: string[];
  missing: string[];
  recommendations: string[];
}

interface SkillRequirement {
  skills: {
    name: string;
  };
}

export async function calculateSkillScores(userId: string) {
  // Fetch data from various sources
  const [resumeData, codingData] = await Promise.all([
    supabase.from('resumes').select('skills').eq('user_id', userId),
    supabase.from('coding_progress').select('score, difficulty').eq('user_id', userId),
    supabase.from('mock_interviews').select('overall_score').eq('user_id', userId)
  ]);

  // Logic to process scores (simplified for now)
  const skills: Record<string, number> = {};

  // Process Resume Skills (Basic presence)
  resumeData.data?.forEach(resume => {
    const list = Array.isArray(resume.skills) ? resume.skills : (resume.skills as string)?.split(',') || [];
    list.forEach((s: string) => {
      const name = s.trim().toLowerCase();
      skills[name] = (skills[name] || 50) + 5; // Base score for being in resume
    });
  });

  // Process Coding Data
  codingData.data?.forEach(session => {
    // Logic to map coding problem to skill (needs a mapping table ideally)
    // For now, assume general 'coding' skill
    skills['coding'] = (skills['coding'] || 50) + (session.score / 10);
  });

  // Constrain scores to 0-100
  Object.keys(skills).forEach(name => {
    skills[name] = Math.min(100, Math.max(0, skills[name]));
  });

  return skills;
}

export async function generateGapReport(userId: string, targetRole: string) {
  const userScores = await calculateSkillScores(userId);
  
  // Fetch requirements for the role
  const { data } = await supabase
    .from('role_skill_requirements')
    .select('*, skills(name)')
    .eq('role_name', targetRole);

  const requirements = data as unknown as SkillRequirement[] | null;

  const report: GapReport = {
    strengths: [],
    moderate: [],
    weak: [],
    missing: [],
    recommendations: []
  };

  (requirements || []).forEach((req) => {
    const skillName = req.skills.name.toLowerCase();
    const score = userScores[skillName] || 0;

    if (score >= 80) report.strengths.push(skillName);
    else if (score >= 50) report.moderate.push(skillName);
    else if (score > 0) report.weak.push(skillName);
    else report.missing.push(skillName);
  });

  return report;
}
