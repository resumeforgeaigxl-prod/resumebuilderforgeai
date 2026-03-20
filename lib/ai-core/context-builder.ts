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
        const { data: profile } = await supabase
            .from('users')
            .select('full_name, role, experience_level, bio')
            .eq('id', userId)
            .single();
        if (profile) {
            context += `User Profile: ${profile.full_name} (${profile.role}, ${profile.experience_level}) - ${profile.bio || ''}\n`;
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
