import { createClient } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/router';

export interface MockInterviewRecord {
  id: string;
  role: string;
  score: number;
  feedback: string;
  interview_type: string;
  created_at: string;
}

export interface TriggerInterviewParams {
  role: string;
  difficulty?: 'Entry' | 'Mid' | 'Senior';
}

export interface TriggerInterviewResult {
  success: boolean;
  tool: string;
  sessionId: string;
  role: string;
  difficulty: string;
  numQuestions: number;
  questions: string[];
  firstQuestion: string;
  interviewUrl: string;
}

export interface EvaluateAnswerParams {
  role?: string;
  question: string;
  userAnswer: string;
}

export interface EvaluateAnswerResult {
  success: boolean;
  tool: string;
  role: string;
  question: string;
  userAnswer: string;
  score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  starRating: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  feedback: string;
  improvedSampleAnswer: string;
}

/**
 * Lists user mock interview history and performance scores.
 */
export async function listMockInterviews(userId: string): Promise<MockInterviewRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mock_interviews')
    .select('id, role, score, feedback, interview_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[listMockInterviews] Error:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * Creates a new mock interview session with AI-generated role questions.
 */
export async function triggerMockInterview(
  params: TriggerInterviewParams,
  userId: string
): Promise<TriggerInterviewResult> {
  const supabase = createClient();
  const role = params.role;
  const difficulty = params.difficulty || 'Mid';

  const prompt = `Generate 5 technical interview questions for a ${difficulty} level ${role} position.
Return a JSON array of strings containing only the questions: ["Question 1", "Question 2", ...]`;

  const response = await callAI({
    task: 'interview',
    prompt,
    systemPrompt: 'You are an elite technical interviewer. Return valid JSON only.',
    userId,
    responseFormat: 'json',
  });

  const questions = JSON.parse(response.text);
  if (!Array.isArray(questions)) {
    throw new Error('LLM did not return an array of questions');
  }

  const { data: session, error } = await supabase
    .from('mock_interviews')
    .insert({
      user_id: userId,
      role: role,
      interview_type: 'Technical',
      num_questions: questions.length,
      questions: questions,
      interview_mode: 'chat',
      score: 0,
      feedback: 'Awaiting completion',
    })
    .select('id')
    .single();

  if (error) throw error;

  return {
    success: true,
    tool: 'trigger_mock_interview',
    sessionId: session.id,
    role,
    difficulty,
    numQuestions: questions.length,
    questions,
    firstQuestion: questions[0] || 'Tell me about yourself and your relevant technical background.',
    interviewUrl: `/en-in/mock-interview?session=${session.id}`,
  };
}

/**
 * Evaluates candidate response using the STAR framework and returns score and coach feedback.
 */
export async function evaluateInterviewAnswer(
  params: EvaluateAnswerParams,
  userId: string
): Promise<EvaluateAnswerResult> {
  const role = params.role || 'Software Engineer';
  const evalPrompt = `
You are an expert Executive Interview Coach and Bar Raiser.
Evaluate the candidate's interview response according to the STAR framework (Situation, Task, Action, Result) and technical depth.

Role: ${role}
Question: ${params.question}
Candidate Answer: ${params.userAnswer}

Return ONLY a valid JSON object matching this schema:
{
  "score": 85,
  "verdict": "Strong Hire | Hire | Leaning Hire | Leaning No Hire",
  "strengths": ["Clear technical context", "Demonstrated ownership"],
  "weaknesses": ["Could quantify business outcome more explicitly"],
  "starRating": {
    "situation": 85,
    "task": 80,
    "action": 90,
    "result": 75
  },
  "feedback": "Comprehensive, structured response with good action verbs.",
  "improvedSampleAnswer": "Here is an executive-level version of the answer..."
}
`;

  const response = await callAI({
    task: 'interview',
    prompt: evalPrompt,
    systemPrompt: 'You are an elite Big Tech bar raiser and interview coach.',
    userId,
    responseFormat: 'json',
  });

  const parsed = JSON.parse(response.text);
  const score = parsed.score || 80;

  return {
    success: true,
    tool: 'evaluate_interview_answer',
    role,
    question: params.question,
    userAnswer: params.userAnswer,
    score,
    verdict: parsed.verdict || (score >= 80 ? 'Strong Hire' : score >= 65 ? 'Hire' : 'Needs Practice'),
    strengths: parsed.strengths || ['Good technical terminology'],
    weaknesses: parsed.weaknesses || ['Quantify measurable business KPIs'],
    starRating: parsed.starRating || { situation: 80, task: 80, action: 85, result: 75 },
    feedback: parsed.feedback || 'Good structured response.',
    improvedSampleAnswer: parsed.improvedSampleAnswer || '',
  };
}
