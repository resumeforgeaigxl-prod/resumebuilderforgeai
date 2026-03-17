import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkMentorPermission(userId: string, forgeName: string) {
  const { data, error } = await supabase
    .from('mentor_permissions')
    .select('permission_granted')
    .eq('user_id', userId)
    .eq('forge_name', forgeName)
    .maybeSingle();

  return data?.permission_granted || false;
}

export async function grantMentorPermission(userId: string, forgeName: string) {
  const { error } = await supabase
    .from('mentor_permissions')
    .upsert({
      user_id: userId,
      forge_name: forgeName,
      permission_granted: true,
      granted_at: new Date().toISOString()
    });

  if (error) throw error;
}

export async function trackAIUsage(userId: string, module: string, tokens: { input: number, output: number }, modelUsed: string) {
  // 1. Update daily quota
  const { data: usage, error: uError } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('module', module)
    .maybeSingle();

  if (!usage) {
    await supabase.from('ai_usage').insert({
      user_id: userId,
      module: module,
      requests_count: 1,
      tokens_used: tokens.input + tokens.output
    });
  } else {
    await supabase.from('ai_usage')
      .update({
        requests_count: usage.requests_count + 1,
        tokens_used: usage.tokens_used + tokens.input + tokens.output,
        updated_at: new Date().toISOString()
      })
      .eq('id', usage.id);
  }

  // 2. Log token details
  await supabase.from('ai_token_usage').insert({
    user_id: userId,
    module: module,
    input_tokens: tokens.input,
    output_tokens: tokens.output,
    total_tokens: tokens.input + tokens.output,
    model_used: modelUsed
  });
}

export async function logAIChat(userId: string, module: string, userMessage: string, aiResponse: string, tokensUsed: number) {
  await supabase.from('ai_chat_logs').insert({
    user_id: userId,
    module: module,
    user_message: userMessage,
    ai_response: aiResponse,
    tokens_used: tokensUsed
  });
}

export async function isUnderQuota(userId: string, module: string, limit: number = 10) {
  // Bypassing quota for MentorForge during system upgrade
  if (module === 'MentorForge') return true;

  const { data, error } = await supabase
    .from('ai_usage')
    .select('requests_count')
    .eq('user_id', userId)
    .eq('module', module)
    .maybeSingle();

  if (!data) return true;
  return data.requests_count < limit;
}

export async function updateMentorMemory(userId: string, insights: { goals?: string[], weaknesses?: string[], improvements?: string[] }) {
    const { data: existing } = await supabase
        .from('mentor_memory')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (!existing) {
        await supabase.from('mentor_memory').insert({
            user_id: userId,
            ...insights
        });
    } else {
        await supabase.from('mentor_memory')
            .update({
                goals: Array.from(new Set([...(existing.goals || []), ...(insights.goals || [])])),
                weaknesses: Array.from(new Set([...(existing.weaknesses || []), ...(insights.weaknesses || [])])),
                improvements: Array.from(new Set([...(existing.improvements || []), ...(insights.improvements || [])])),
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
    }
}

export async function getMentorMemory(userId: string) {
    const { data } = await supabase
        .from('mentor_memory')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    return data || {};
}
