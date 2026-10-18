import { createClient } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/router';

export interface LearningPlanParams {
  topic: string;
  durationWeeks?: number;
}

export interface LearningPlanResult {
  success: boolean;
  tool: string;
  id: string;
  title: string;
  topic: string;
  durationWeeks: number;
  syllabus_steps: number;
  syllabus: string[];
  progress: number;
  status: string;
}

export interface LearningProgressItem {
  id: string;
  topic?: string;
  title?: string;
  status?: string;
  progress?: number;
  syllabus?: string[];
  created_at?: string;
}

/**
 * Creates a structured multi-week learning plan and syllabus for a topic.
 */
export async function createLearningPlan(
  params: LearningPlanParams,
  userId: string
): Promise<LearningPlanResult> {
  const supabase = createClient();
  const weeks = params.durationWeeks || 4;
  const prompt = `Create a ${weeks}-week structured study syllabus outline for learning "${params.topic}".
Return ONLY a JSON array of strings representing the weekly milestone titles: ["Week 1: ...", "Week 2: ...", ...]`;

  const response = await callAI({
    task: 'learn',
    prompt,
    systemPrompt: 'You are an expert technical curriculum designer. Return valid JSON only.',
    userId,
    responseFormat: 'json',
  });

  const syllabus = JSON.parse(response.text);
  if (!Array.isArray(syllabus)) {
    throw new Error('Syllabus is not a valid array');
  }

  const { data: roadmap, error } = await supabase
    .from('roadmaps')
    .insert({
      user_id: userId,
      title: params.topic,
      status: 'active',
      progress: 0,
      syllabus: syllabus,
    })
    .select('id, title')
    .single();

  if (error) throw error;

  return {
    success: true,
    tool: 'trigger_study_plan',
    id: roadmap.id,
    title: roadmap.title,
    topic: params.topic,
    durationWeeks: weeks,
    syllabus_steps: syllabus.length,
    syllabus,
    progress: 0,
    status: 'active',
  };
}

/**
 * Adds an individual learning/study topic to the user's trajectory.
 */
export async function addStudyTopic(
  topicName: string,
  userId: string
): Promise<{
  success: boolean;
  tool: string;
  title: string;
  topic: string;
  progress: number;
  syllabus: string[];
}> {
  const supabase = createClient();
  const defaultSyllabus = [
    `Foundations of ${topicName}`,
    `Core Principles & Architecture`,
    `Applied Hands-on Practice`,
  ];

  const { data, error } = await supabase
    .from('roadmaps')
    .insert({
      user_id: userId,
      title: topicName,
      status: 'active',
      progress: 0,
      syllabus: defaultSyllabus,
    })
    .select()
    .maybeSingle();

  if (error) {
    // Fallback to user_learning_progress table
    const { error: lpError } = await supabase
      .from('user_learning_progress')
      .insert({
        user_id: userId,
        topic: topicName,
        status: 'active',
        progress: 0,
      })
      .select()
      .maybeSingle();

    if (lpError) throw lpError;
  }

  return {
    success: true,
    tool: 'add_study_topic',
    title: topicName,
    topic: topicName,
    progress: 0,
    syllabus: (data as any)?.syllabus || defaultSyllabus,
  };
}

/**
 * Retrieves the user's active learning roadmap modules and progress.
 */
export async function getLearningProgress(
  userId: string
): Promise<LearningProgressItem[]> {
  const supabase = createClient();
  let { data, error } = await supabase
    .from('user_learning_progress')
    .select('*')
    .eq('user_id', userId);

  if (error || !data || data.length === 0) {
    const { data: roadmaps, error: roadmapsErr } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId);

    if (!roadmapsErr && roadmaps) {
      data = roadmaps;
    }
  }

  return (data || []) as LearningProgressItem[];
}

/**
 * Updates learning topic progress percentage or status.
 */
export async function updateLearningProgress(
  params: { topicId: string; progress: number; status?: string },
  userId: string
): Promise<{ success: boolean }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('roadmaps')
    .update({
      progress: params.progress,
      status: params.status || 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.topicId)
    .eq('user_id', userId);

  if (error) {
    // Fallback try user_learning_progress
    await supabase
      .from('user_learning_progress')
      .update({
        progress: params.progress,
        status: params.status || 'active',
      })
      .eq('id', params.topicId)
      .eq('user_id', userId);
  }

  return { success: true };
}

/**
 * Recommends learning topics aligned with target role and candidate skill gaps.
 */
export async function recommendLearningTopic(
  role: string,
  currentSkills: string[],
  userId: string
): Promise<{ recommendedTopics: string[] }> {
  const prompt = `Recommend 3 high-impact learning topics for a ${role} with current skills: ${currentSkills.join(', ')}.
Return ONLY a JSON array of strings: ["Topic 1", "Topic 2", "Topic 3"]`;

  try {
    const response = await callAI({
      task: 'learn',
      prompt,
      systemPrompt: 'You are an elite engineering curriculum advisor. Return valid JSON only.',
      userId,
      responseFormat: 'json',
    });
    const topics = JSON.parse(response.text);
    return { recommendedTopics: Array.isArray(topics) ? topics : [] };
  } catch {
    return { recommendedTopics: ['Distributed Systems Patterns', 'Clean Architecture', 'System Design'] };
  }
}
