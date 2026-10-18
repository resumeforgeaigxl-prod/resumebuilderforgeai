import { createClient } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/router';
import { consumeCodeExecutionCredit, refundCodeExecutionCredit } from '@/lib/code-execution-credits';

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://34.170.78.245:2358';

export const LANGUAGE_MAP: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  c: 50,
};

export interface CodingSubmissionRecord {
  id: string;
  language: string;
  status: string;
  score: number;
  problem_id: string;
  created_at: string;
}

export interface CodingProblemRecord {
  id: string;
  title: string;
  difficulty: string;
  slug: string;
  tags?: string[];
}

export interface RunSandboxParams {
  language: string;
  code: string;
  stdin?: string;
  problemId?: string;
}

export interface RunSandboxResult {
  success: boolean;
  tool: string;
  language: string;
  codeSnippet: string;
  results: Array<{
    input?: string;
    expected?: string | null;
    actual: string;
    status: string;
    status_id?: number;
    time: number;
    passed: boolean;
    stderr: string;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  executionTimeMs: number;
  creditsUsed: number;
}

export interface TriggerChallengeParams {
  topic: string;
  difficulty: string;
}

export interface TriggerChallengeResult {
  success: boolean;
  tool: string;
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  topic: string;
  description: string;
  approach: string;
  interviewTips: string[];
  timeComplexity: string;
  spaceComplexity: string;
  starterCode: string;
  testCases: any[];
  is_new: boolean;
  solveUrl: string;
}

/**
 * Lists the user's recent coding challenge submissions.
 */
export async function listCodingSubmissions(userId: string): Promise<CodingSubmissionRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coding_submissions')
    .select('id, language, status, score, problem_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[listCodingSubmissions] Error:', error.message);
    throw error;
  }
  return (data || []) as CodingSubmissionRecord[];
}

/**
 * Lists available coding problems from the question bank.
 */
export async function listCodingProblems(): Promise<CodingProblemRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coding_questions')
    .select('id, title, difficulty, slug, tags')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[listCodingProblems] Error:', error.message);
    throw error;
  }
  return (data || []) as CodingProblemRecord[];
}

/**
 * Executes source code inside an isolated Judge0 sandbox environment.
 */
export async function runCodeSandbox(
  params: RunSandboxParams,
  userId: string
): Promise<RunSandboxResult> {
  const { language, code, stdin, problemId } = params;
  if (!language || !code) throw new Error('Language and code are required.');

  const languageId = LANGUAGE_MAP[language.toLowerCase()];
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  // Deduct execution credit
  const creditResult = await consumeCodeExecutionCredit(userId);
  if (!creditResult.success) {
    throw new Error(creditResult.error || 'Out of code execution credits.');
  }

  try {
    const supabase = createClient();
    let testCases: any[] = [];

    if (problemId) {
      const { data } = await supabase
        .from('coding_test_cases')
        .select('*')
        .eq('question_id', problemId)
        .order('order_index', { ascending: true });
      if (data && data.length > 0) {
        testCases = data;
      }
    }

    if (testCases.length === 0) {
      testCases = [{ input: stdin || '', expected_output: null, is_hidden: false }];
    }

    const runPromises = testCases.map(async (tc) => {
      const response = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: tc.input || '',
        }),
      });

      if (!response.ok) throw new Error('Judge0 connection error');
      const data = await response.json();

      const actualOutput = (data.stdout || '').trim();
      const expectedOutput = (tc.expected_output || '').trim();

      let passed = true;
      if (tc.expected_output !== null) {
        passed = actualOutput === expectedOutput;
      }

      return {
        input: tc.is_hidden ? '[Hidden]' : tc.input,
        expected: tc.is_hidden ? '[Hidden]' : tc.expected_output,
        actual: actualOutput,
        status: data.status?.description || 'Unknown',
        status_id: data.status?.id,
        time: data.time || 0,
        passed,
        stderr: data.stderr || data.compile_output || '',
      };
    });

    const results = await Promise.all(runPromises);
    const anyFailed = results.some((r) => !r.passed || r.status_id !== 3);
    const avgTime = results.reduce((acc, r) => acc + (parseFloat(r.time) || 0), 0) / (results.length || 1);

    return {
      success: !anyFailed,
      tool: 'run_code_sandbox',
      language,
      codeSnippet: code.length > 500 ? code.slice(0, 500) + '...' : code,
      results,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.passed && r.status_id === 3).length,
        failed: results.filter((r) => !r.passed || r.status_id !== 3).length,
      },
      executionTimeMs: Math.max(Math.round(avgTime * 1000), 15),
      creditsUsed: 1,
    };
  } catch (err: any) {
    console.error('[runCodeSandbox] Execution failed:', err.message);
    await refundCodeExecutionCredit(userId).catch(() => {});
    throw err;
  }
}

/**
 * Triggers a coding challenge: finds an existing problem or generates a new one dynamically.
 */
export async function triggerCodingChallenge(
  params: TriggerChallengeParams,
  userId: string
): Promise<TriggerChallengeResult> {
  const supabase = createClient();
  const { topic, difficulty } = params;

  // Search existing problem in repository
  const { data: existing } = await supabase
    .from('coding_questions')
    .select('*')
    .ilike('topic', `%${topic}%`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data: testCases } = await supabase
      .from('coding_test_cases')
      .select('input, expected_output')
      .eq('question_id', existing.id)
      .eq('is_hidden', false)
      .limit(2);

    const { data: solutions } = await supabase
      .from('coding_solutions')
      .select('language, code')
      .eq('question_id', existing.id);

    return {
      success: true,
      tool: 'trigger_coding_challenge',
      id: existing.id,
      slug: existing.slug,
      title: existing.title,
      difficulty: existing.difficulty,
      topic: existing.topic,
      description: existing.description,
      approach: existing.approach || '',
      interviewTips: existing.interview_tips || [],
      timeComplexity: existing.time_complexity || 'O(N)',
      spaceComplexity: existing.space_complexity || 'O(1)',
      starterCode: solutions?.[0]?.code || `# Solution for ${existing.title}\ndef solution():\n    pass`,
      testCases: testCases || [],
      is_new: false,
      solveUrl: `/en-in/codingforge/${existing.slug}`,
    };
  }

  // Generate one dynamically with AI
  const prompt = `Generate a coding interview question. Topic: ${topic}, Difficulty: ${difficulty}.
Return ONLY a valid JSON object matching this schema:
{
  "title": "A concise title",
  "description": "Clear problem statement with examples",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "approach": "A brief explanation of how to solve it",
  "interview_tips": ["tip1", "tip2"],
  "time_complexity": "O(N)",
  "space_complexity": "O(1)",
  "test_cases": [
    { "input": "sample input text", "output": "expected output text", "is_hidden": false }
  ],
  "solutions": {
    "javascript": "function solution() { ... }"
  }
}`;

  const response = await callAI({
    task: 'code',
    prompt,
    systemPrompt: 'You are an expert technical interviewer and competitive programmer.',
    userId,
    responseFormat: 'json',
  });

  const q = JSON.parse(response.text);
  const slug = q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data: inserted, error: qError } = await supabase
    .from('coding_questions')
    .insert({
      title: q.title,
      slug,
      description: q.description,
      difficulty: q.difficulty,
      topic: q.topic,
      type: 'Programming',
      approach: q.approach,
      interview_tips: q.interview_tips,
      time_complexity: q.time_complexity,
      space_complexity: q.space_complexity,
    })
    .select()
    .single();

  if (qError) throw qError;

  if (q.test_cases && q.test_cases.length > 0) {
    const testCases = q.test_cases.map((tc: any, idx: number) => ({
      question_id: inserted.id,
      input: tc.input,
      expected_output: tc.output,
      is_hidden: tc.is_hidden || false,
      order_index: idx,
    }));
    await supabase.from('coding_test_cases').insert(testCases);
  }

  if (q.solutions) {
    const solutions = Object.entries(q.solutions).map(([lang, code]) => ({
      question_id: inserted.id,
      language: lang,
      code,
    }));
    await supabase.from('coding_solutions').insert(solutions);
  }

  return {
    success: true,
    tool: 'trigger_coding_challenge',
    id: inserted.id,
    slug,
    title: q.title,
    difficulty: q.difficulty || difficulty,
    topic: q.topic || topic,
    description: q.description || '',
    approach: q.approach || '',
    interviewTips: q.interview_tips || [],
    timeComplexity: q.time_complexity || 'O(N)',
    spaceComplexity: q.space_complexity || 'O(1)',
    starterCode:
      q.solutions?.python ||
      q.solutions?.javascript ||
      `# Solution for ${q.title}\ndef solution():\n    pass`,
    testCases: (q.test_cases || []).slice(0, 2),
    is_new: true,
    solveUrl: `/en-in/codingforge/${slug}`,
  };
}
