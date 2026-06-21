import { buildUserContext } from '@/lib/ai/mentor-context';
import { createClient } from '@/lib/supabase/server';

export type ContextType = 'coding' | 'interview' | 'project' | 'jobs' | 'general';

/**
 * Aggregates context for the AI based on the specified type.
 */
export async function buildCentralizedContext(userId: string, type: ContextType): Promise<string> {
    const supabase = createClient();
    let context = "";

    // 1. Base User Profile Context (always included)
    try {
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('full_name, role, experience_level, bio, target_role, skills, professional_summary, preferred_work_mode')
            .eq('id', userId)
            .single();

        if (profileError) {
            // Fallback if new columns don't exist yet
            const { data: legacyProfile } = await supabase
                .from('users')
                .select('full_name, role, experience_level, bio')
                .eq('id', userId)
                .single();
            if (legacyProfile) {
                context += `User Profile: ${legacyProfile.full_name} (${legacyProfile.role}, ${legacyProfile.experience_level}) - ${legacyProfile.bio || ''}\n`;
            }
        } else if (profile) {
            context += `User Profile: ${profile.full_name} (${profile.role || profile.target_role || 'N/A'}, ${profile.experience_level}) - ${profile.bio || profile.professional_summary || ''}\n`;
            if (profile.target_role) {
                context += `Target Role: ${profile.target_role} | Work Mode: ${profile.preferred_work_mode || 'N/A'}\n`;
            }
            if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
                context += `Current Skills: ${profile.skills.join(', ')}\n`;
            }

            // Fetch the industry-standard skill checklist for the user's target role
            if (profile.target_role) {
                try {
                    const { data: roleMap } = await supabase
                        .from('role_skills_map')
                        .select('all_skills, categories')
                        .eq('role_name', profile.target_role)
                        .single();

                    if (roleMap?.all_skills) {
                        const userSkillsLower = new Set((profile.skills || []).map((s: string) => s.toLowerCase()));
                        const missingSkills = roleMap.all_skills.filter((s: string) => !userSkillsLower.has(s.toLowerCase()));
                        if (missingSkills.length > 0) {
                            context += `Industry Skills Gap (${profile.target_role}): ${missingSkills.slice(0, 20).join(', ')}${missingSkills.length > 20 ? ` (+${missingSkills.length - 20} more)` : ''}\n`;
                        }
                    }
                } catch {
                    // role_skills_map table may not exist yet — safe to ignore
                }
            }
        }
    } catch (e) {
        console.warn('[ContextBuilder] Profile error:', e);
    }

    // 2. Type-Specific Context
    switch (type) {
        case 'coding':
            const { data: submissions } = await supabase
                .from('coding_submissions')
                .select('language, status, problem_id')
                .eq('user_id', userId)
                .limit(5);
            if (submissions?.length) {
                context += `Recent Coding Submissions: ${submissions.map(s => `${s.problem_id} (${s.language}: ${s.status})`).join(', ')}\n`;
            }
            break;

        case 'interview':
            const { data: interviews } = await supabase
                .from('mock_interviews')
                .select('role, interview_type, final_score')
                .eq('user_id', userId)
                .limit(3);
            if (interviews?.length) {
                context += `Recent Interview Performance: ${interviews.map(i => `${i.role} (${i.interview_type}): ${i.final_score}/100`).join(', ')}\n`;
            }
            break;

        case 'project':
            const { data: projects } = await supabase
                .from('explainforge_requests')
                .select('github_url, input_type')
                .eq('user_id', userId)
                .limit(3);
            if (projects?.length) {
                context += `Recent Projects Analyzed: ${projects.map(p => `${p.github_url || p.input_type}`).join(', ')}\n`;
            }
            break;

        case 'jobs':
            const { data: jobs } = await supabase
                .from('job_submissions')
                .select('job_title, company_name, status')
                .eq('user_id', userId)
                .limit(5);
            if (jobs?.length) {
                context += `Recent Job Applications: ${jobs.map(j => `${j.job_title} at ${j.company_name} (${j.status})`).join(', ')}\n`;
            }
            break;

        default:
            // For MentorForge/General, use the comprehensive mentor context
            const mentorContext = await buildUserContext(userId).catch(() => ({}));
            context += `Career Insights: ${JSON.stringify(mentorContext)}\n`;
            break;
    }

    return context;
}
