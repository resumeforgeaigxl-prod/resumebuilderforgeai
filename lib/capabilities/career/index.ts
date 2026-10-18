import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureCareerForgeLibrarySeeded } from '@/lib/careerforge-library-db';

export interface CareerMemoryUpdateParams {
  goals?: string[];
  weaknesses?: string[];
  improvements?: string[];
}

export interface CareerMemoryRecord {
  id?: string;
  user_id: string;
  goals: string[];
  weaknesses: string[];
  improvements: string[];
  updated_at?: string;
}

/**
 * Updates user career goals, weaknesses, and recommendations inside persistent memory.
 */
export async function updateCareerProfileInsights(
  params: CareerMemoryUpdateParams,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from('mentor_memory')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const newGoals = Array.from(new Set([...(existing?.goals || []), ...(params.goals || [])]));
  const newWeaknesses = Array.from(new Set([...(existing?.weaknesses || []), ...(params.weaknesses || [])]));
  const newImprovements = Array.from(new Set([...(existing?.improvements || []), ...(params.improvements || [])]));

  if (!existing) {
    const { error } = await supabase
      .from('mentor_memory')
      .insert({
        user_id: userId,
        goals: newGoals,
        weaknesses: newWeaknesses,
        improvements: newImprovements,
      });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('mentor_memory')
      .update({
        goals: newGoals,
        weaknesses: newWeaknesses,
        improvements: newImprovements,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (error) throw error;
  }

  return { success: true, message: 'Career profile insights updated successfully.' };
}

/**
 * Retrieves the user's career memory and learning metrics.
 */
export async function getCareerProfileMemory(userId: string): Promise<CareerMemoryRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mentor_memory')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[getCareerProfileMemory] Error:', error.message);
    return null;
  }
  return data;
}

/**
 * Ensures career topic and skill catalog tables are seeded in the database.
 */
export async function ensureCareerLibrary(supabase: SupabaseClient): Promise<void> {
  return ensureCareerForgeLibrarySeeded(supabase);
}
