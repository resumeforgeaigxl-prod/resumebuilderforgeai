import { createClient } from '../supabase/server';
import { getSession } from './jwt';

export const FORGE_LIMITS = {
  resumeforge: 1,      // 1 download only for FREE
  codingforge: 2,      // 2 problems only for FREE
  interviewforge: 2,   // 2 sessions only for FREE
  prepforge: 3,
  jobforge: 5,
  projectforge: 1,
  resumecount: 2,       // Max 2 resumes for FREE
  mentorforge: 0,       // PAID only
  knowledgeforge: 0,
} as const;

export type ForgeType = keyof typeof FORGE_LIMITS | 'knowledgeforge_write';

export interface ForgeAccessResponse {
  hasAccess: boolean;
  reason?: 'auth_required' | 'user_not_found' | 'limit_reached' | 'is_blocked' | 'upgrade_required';
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

  // 1. Fetch user plan details first (columns that always exist)
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('plan, plan_type')
    .eq('id', session.userId)
    .single();

  if (userError || !user) {
    console.error('[checkForgeAccess] User fetch failed:', userError?.message);
    return { hasAccess: false, reason: 'user_not_found' };
  }

  // Paid bypass
  const currentPlan = (user.plan_type || user.plan || 'FREE').toUpperCase();
  const isPaid = ['DAILY', 'WEEKLY', 'MONTHLY', 'PROFESSIONAL', 'PRO'].includes(currentPlan);
  if (isPaid) return { hasAccess: true, isPro: true };

  // Feature specific locks
  if (forge === 'mentorforge' || forge === 'knowledgeforge_write') {
      return { hasAccess: false, reason: 'upgrade_required' };
  }

  // 2. Safely fetch optional usage counters. If the columns do not exist in the DB,
  // we catch the failure and fallback to default (0).
  let usageMap: Record<string, number> = {
    resumeforge: 0,
    codingforge: 0,
    interviewforge: 0,
    prepforge: 0,
    jobforge: 0,
    projectforge: 0,
    resumecount: 0,
  };

  const { data: userUsage, error: usageError } = await supabase
    .from('users')
    .select('free_resume_count, free_coding_runs, free_interview_sessions, free_prep_questions, free_job_views, free_project_creates')
    .eq('id', session.userId)
    .single();

  if (!usageError && userUsage) {
    usageMap = {
      resumeforge: userUsage.free_resume_count ?? 0,
      codingforge: userUsage.free_coding_runs ?? 0,
      interviewforge: userUsage.free_interview_sessions ?? 0,
      prepforge: userUsage.free_prep_questions ?? 0,
      jobforge: userUsage.free_job_views ?? 0,
      projectforge: userUsage.free_project_creates ?? 0,
      resumecount: 0,
    };
  } else {
    console.warn('[checkForgeAccess] Usage columns missing or select failed, defaulting to 0:', usageError?.message);
  }

  // Special check for max resumes
  if (forge === 'resumecount') {
      const { count } = await supabase.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', session.userId);
      if ((count || 0) >= FORGE_LIMITS.resumecount) return { hasAccess: false, reason: 'limit_reached' };
      return { hasAccess: true, remaining: FORGE_LIMITS.resumecount - (count || 0) };
  }

  const limit = forge in FORGE_LIMITS ? FORGE_LIMITS[forge as keyof typeof FORGE_LIMITS] : 0;
  const currentUsage = usageMap[forge] || 0;

  if (currentUsage < limit) {
    return { hasAccess: true, remaining: limit - currentUsage };
  }

  return { hasAccess: false, reason: 'limit_reached' };
}

export async function incrementForgeUsage(forge: ForgeType) {
    const session = await getSession();
    if (!session || session.role === 'admin') return;

    const supabase = createClient();
    
    const columnMap: Record<string, string> = {
        resumeforge: 'free_resume_count',
        codingforge: 'free_coding_runs',
        interviewforge: 'free_interview_sessions',
        prepforge: 'free_prep_questions',
        jobforge: 'free_job_views',
        projectforge: 'free_project_creates',
        resumecount: 'none',
        mentorforge: 'none',
        knowledgeforge: 'none',
    };

    const columnName = columnMap[forge];
    if (columnName === 'none' || !columnName) return;
    
    try {
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
            if (userRecord && columnName in userRecord) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const currentCount = (userRecord as any)[columnName] || 0;
                await supabase.from('users').update({ [columnName]: currentCount + 1 }).eq('id', session.userId);
            }
        }
    } catch (err) {
        console.warn('[Usage] incrementForgeUsage failed:', err);
    }
}
