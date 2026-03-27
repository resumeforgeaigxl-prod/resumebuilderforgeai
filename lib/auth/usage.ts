import { createClient } from '../supabase/server';
import { getSession } from './jwt';

export const FORGE_LIMITS = {
  resumeforge: 1,
  codingforge: 2,
  interviewforge: 1,
  prepforge: 3,
  jobforge: 5,
  projectforge: 1,
} as const;

export type ForgeType = keyof typeof FORGE_LIMITS;

export interface ForgeAccessResponse {
  hasAccess: boolean;
  reason?: 'auth_required' | 'user_not_found' | 'limit_reached' | 'is_blocked';
  remaining?: number;
  isAdmin?: boolean;
  isPro?: boolean;
}

export async function checkForgeAccess(forge: ForgeType): Promise<ForgeAccessResponse> {
  const session = await getSession();
  if (!session) return { hasAccess: false, reason: 'auth_required' };
  
  if (session.isBlocked) return { hasAccess: false, reason: 'is_blocked' };
  
  // Admin bypass
  if (session.role === 'admin') return { hasAccess: true, isAdmin: true };

  const supabase = createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('plan_type, free_resume_count, free_coding_runs, free_interview_sessions, free_prep_questions, free_job_views, free_project_creates')
    .eq('id', session.userId)
    .single();

  if (error || !user) return { hasAccess: false, reason: 'user_not_found' };

  // Pro/Premium/Career bypass
  if (user.plan_type !== 'free') return { hasAccess: true, isPro: true };

  const usageMap: Record<ForgeType, number> = {
    resumeforge: user.free_resume_count ?? 0,
    codingforge: user.free_coding_runs ?? 0,
    interviewforge: user.free_interview_sessions ?? 0,
    prepforge: user.free_prep_questions ?? 0,
    jobforge: user.free_job_views ?? 0,
    projectforge: user.free_project_creates ?? 0,
  };

  const limit = FORGE_LIMITS[forge];
  const currentUsage = usageMap[forge];

  if (currentUsage < limit) {
    return { hasAccess: true, remaining: limit - currentUsage };
  }

  return { hasAccess: false, reason: 'limit_reached' };
}

export async function incrementForgeUsage(forge: ForgeType) {
    const session = await getSession();
    if (!session || session.role === 'admin') return;

    const supabase = createClient();
    
    const columnMap: Record<ForgeType, string> = {
        resumeforge: 'free_resume_count',
        codingforge: 'free_coding_runs',
        interviewforge: 'free_interview_sessions',
        prepforge: 'free_prep_questions',
        jobforge: 'free_job_views',
        projectforge: 'free_project_creates',
    };

    const columnName = columnMap[forge];
    
    // Check if we are in pro plan (bypass)
    const { data: user } = await supabase.from('users').select('plan_type').eq('id', session.userId).single();
    if (user && user.plan_type !== 'free') return;

    // Use RPC if available, otherwise fetch and update (fallback)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: rpcError } = await (supabase as any).rpc('increment_user_usage', { 
        user_id_p: session.userId, 
        column_name: columnName 
    });

    if (rpcError) {
        console.warn('[Usage] RPC failed, falling back to manual update:', rpcError.message);
        // Manual fallback for dev if function not exists
        const { data: userRecord } = await supabase.from('users').select(columnName).eq('id', session.userId).single();
        if (userRecord) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const currentCount = (userRecord as any)[columnName] || 0;
            await supabase.from('users').update({ [columnName]: currentCount + 1 }).eq('id', session.userId);
        }
    }
}
