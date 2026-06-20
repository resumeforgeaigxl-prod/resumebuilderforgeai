import { createClient } from '@/lib/supabase/server';
import { consumeCodeExecutionCredit, refundCodeExecutionCredit } from '@/lib/code-execution-credits';
import { generateGroundedJobSearch } from '@/lib/gemini-service';
import { SchemaType } from '@google/generative-ai';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: SchemaType.OBJECT;
    properties: Record<string, {
      type: SchemaType;
      description?: string;
      enum?: string[];
      items?: {
        type: SchemaType;
      };
    }>;
    required?: string[];
  };
  execute: (args: any, userId: string) => Promise<any>;
}

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://34.170.78.245:2358';
const LANGUAGE_MAP: Record<string, number> = {
  'python': 71,
  'javascript': 63,
  'java': 62,
  'cpp': 54,
  'c': 50
};

export const toolsRegistry: Record<string, ToolDefinition> = {
  // ─── RESUMEFORGE TOOLS ───────────────────────────────────────────────────
  list_resumes: {
    name: 'list_resumes',
    description: 'Lists all professional resumes created by the user, including details like scores and last updated timestamps.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('id, title, created_at, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return { resumes: data || [] };
      } catch (err: any) {
        console.error('[list_resumes] Error:', err.message);
        return { error: `Failed to fetch resumes: ${err.message}` };
      }
    }
  },

  get_resume_details: {
    name: 'get_resume_details',
    description: 'Retrieves the complete content structure of a specific resume by its ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        resumeId: {
          type: SchemaType.STRING,
          description: 'The UUID of the resume to retrieve'
        }
      },
      required: ['resumeId']
    },
    execute: async ({ resumeId }, userId) => {
      if (!resumeId) return { error: 'resumeId is required' };
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', resumeId)
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;
        if (!data) return { error: 'Resume not found' };
        return { resume: data };
      } catch (err: any) {
        console.error('[get_resume_details] Error:', err.message);
        return { error: `Failed to fetch resume details: ${err.message}` };
      }
    }
  },

  // ─── CODINGFORGE TOOLS ───────────────────────────────────────────────────
  list_coding_submissions: {
    name: 'list_coding_submissions',
    description: 'Lists the user\'s recent coding challenge submissions, showing programming languages, pass/fail status, and scores.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('coding_submissions')
          .select('id, language, status, score, problem_id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        return { submissions: data || [] };
      } catch (err: any) {
        console.error('[list_coding_submissions] Error:', err.message);
        return { error: `Failed to fetch submissions: ${err.message}` };
      }
    }
  },

  list_coding_problems: {
    name: 'list_coding_problems',
    description: 'Lists the available coding challenges on CodingForge, including their titles, difficulty levels, and slugs.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('coding_questions')
          .select('id, title, difficulty, slug, tags')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { problems: data || [] };
      } catch (err: any) {
        console.error('[list_coding_problems] Error:', err.message);
        return { error: `Failed to fetch coding problems: ${err.message}` };
      }
    }
  },

  run_code_sandbox: {
    name: 'run_code_sandbox',
    description: 'Securely executes the user\'s programming code inside an isolated environment (Judge0 sandbox). Supports python, javascript, java, cpp, c.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        language: {
          type: SchemaType.STRING,
          description: 'The programming language (python, javascript, java, cpp, c)',
          enum: ['python', 'javascript', 'java', 'cpp', 'c']
        },
        code: {
          type: SchemaType.STRING,
          description: 'The source code to run'
        },
        stdin: {
          type: SchemaType.STRING,
          description: 'Standard input parameters to feed into the program execution (optional)'
        },
        problemId: {
          type: SchemaType.STRING,
          description: 'The UUID of the CodingForge challenge to run test cases against (optional)'
        }
      },
      required: ['language', 'code']
    },
    execute: async ({ language, code, stdin, problemId }, userId) => {
      if (!language || !code) return { error: 'Language and code are required.' };
      
      const languageId = LANGUAGE_MAP[language.toLowerCase()];
      if (!languageId) return { error: `Unsupported language: ${language}` };

      // 1. Deduct execution credit
      const creditResult = await consumeCodeExecutionCredit(userId);
      if (!creditResult.success) {
        return { error: creditResult.error || 'Out of code execution credits.' };
      }

      try {
        const supabase = createClient();
        let testCases = [];

        // If it's a specific problem, fetch its test cases
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

        // Default test case if none found
        if (testCases.length === 0) {
          testCases = [{ input: stdin || '', expected_output: null, is_hidden: false }];
        }

        // 2. Run all test cases in parallel
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
        const anyFailed = results.some(r => !r.passed || r.status_id !== 3);

        return {
          success: !anyFailed,
          results,
          summary: {
            total: results.length,
            passed: results.filter(r => r.passed && r.status_id === 3).length,
            failed: results.filter(r => !r.passed || r.status_id !== 3).length
          }
        };

      } catch (err: any) {
        console.error('[run_code_sandbox] Execution failed:', err.message);
        // Refund credit on exception
        await refundCodeExecutionCredit(userId).catch(() => {});
        return { error: `Execution sandbox error: ${err.message}` };
      }
    }
  },

  // ─── INTERVIEWFORGE TOOLS ────────────────────────────────────────────────
  list_mock_interviews: {
    name: 'list_mock_interviews',
    description: 'Lists all mock interviews taken by the user, including overall scores, performance feedback, and interview types.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('mock_interviews')
          .select('id, role, score, feedback, interview_type, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        return { interviews: data || [] };
      } catch (err: any) {
        console.error('[list_mock_interviews] Error:', err.message);
        return { error: `Failed to fetch interviews: ${err.message}` };
      }
    }
  },

  // ─── STUDYFORGE / LEARNFORGE TOOLS ───────────────────────────────────────
  list_learning_progress: {
    name: 'list_learning_progress',
    description: 'Retrieves the user\'s active learning roadmap modules and progress from LearnForge.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      const supabase = createClient();
      try {
        // Try user_learning_progress first, fallback to roadmaps
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

        return { progress: data || [] };
      } catch (err: any) {
        console.error('[list_learning_progress] Error:', err.message);
        return { error: `Failed to fetch learning progress: ${err.message}` };
      }
    }
  },

  add_study_topic: {
    name: 'add_study_topic',
    description: 'Generates an educational roadmap and adds a new topic to the user\'s active learning progress.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        topicName: {
          type: SchemaType.STRING,
          description: 'The technology or concept name (e.g., \'Docker\', \'REST API\', \'Redux\')'
        }
      },
      required: ['topicName']
    },
    execute: async ({ topicName }, userId) => {
      if (!topicName) return { error: 'topicName is required' };
      const supabase = createClient();
      try {
        // 1. Try to insert into user_learning_progress or roadmaps
        // We will insert into roadmaps table which exists in public.roadmaps
        const { data, error } = await supabase
          .from('roadmaps')
          .insert({
            user_id: userId,
            title: topicName,
            status: 'active',
            progress: 0,
            syllabus: [`Introduction to ${topicName}`, `Core Concepts of ${topicName}`, `Hands-on Practice with ${topicName}`]
          })
          .select()
          .maybeSingle();

        if (error) {
          // Try user_learning_progress table
          const { data: lpData, error: lpError } = await supabase
            .from('user_learning_progress')
            .insert({
              user_id: userId,
              topic: topicName,
              status: 'active',
              progress: 0
            })
            .select()
            .maybeSingle();

          if (lpError) throw lpError;
          return { success: true, topic: lpData };
        }

        return { success: true, topic: data };
      } catch (err: any) {
        console.error('[add_study_topic] Error:', err.message);
        return { error: `Failed to add study topic: ${err.message}` };
      }
    }
  },

  // ─── JOBFORGE TOOLS ──────────────────────────────────────────────────────
  search_job_market: {
    name: 'search_job_market',
    description: 'Performs a grounded search using Google Search to retrieve actual, live job openings matching the query.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: 'The job title, location, or company to search (e.g., \'Frontend Developer in San Francisco\')'
        }
      },
      required: ['query']
    },
    execute: async ({ query }) => {
      if (!query) return { error: 'query is required' };
      try {
        const jobs = await generateGroundedJobSearch(query);
        return { jobs: jobs || [] };
      } catch (err: any) {
        console.error('[search_job_market] Error:', err.message);
        return { error: `Failed to search job market: ${err.message}` };
      }
    }
  },

  get_job_applications: {
    name: 'get_job_applications',
    description: 'Lists all the user\'s job applications, including their statuses and notes.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select(`
            id,
            status,
            notes,
            created_at,
            jobs (
              title,
              company,
              location
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { applications: data || [] };
      } catch (err: any) {
        console.error('[get_job_applications] Error:', err.message);
        return { error: `Failed to fetch job applications: ${err.message}` };
      }
    }
  },

  // ─── CENTRAL BRAIN MEMORY TOOLS ──────────────────────────────────────────
  update_profile_insights: {
    name: 'update_profile_insights',
    description: 'Updates the user\'s long-term memory metrics (weaknesses, strengths, recommendations, or experience level).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        goals: {
          type: SchemaType.ARRAY,
          description: 'List of target learning or career goals to add',
          items: {
            type: SchemaType.STRING
          }
        },
        weaknesses: {
          type: SchemaType.ARRAY,
          description: 'List of technical weaknesses to log',
          items: {
            type: SchemaType.STRING
          }
        },
        improvements: {
          type: SchemaType.ARRAY,
          description: 'List of specific action items or recommendations to log',
          items: {
            type: SchemaType.STRING
          }
        }
      }
    },
    execute: async ({ goals, weaknesses, improvements }, userId) => {
      const supabase = createClient();
      try {
        const { data: existing } = await supabase
          .from('mentor_memory')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        const newGoals = Array.from(new Set([...(existing?.goals || []), ...(goals || [])]));
        const newWeaknesses = Array.from(new Set([...(existing?.weaknesses || []), ...(weaknesses || [])]));
        const newImprovements = Array.from(new Set([...(existing?.improvements || []), ...(improvements || [])]));

        if (!existing) {
          const { error } = await supabase
            .from('mentor_memory')
            .insert({
              user_id: userId,
              goals: newGoals,
              weaknesses: newWeaknesses,
              improvements: newImprovements
            });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('mentor_memory')
            .update({
              goals: newGoals,
              weaknesses: newWeaknesses,
              improvements: newImprovements,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          if (error) throw error;
        }

        return { success: true, message: 'Long-term insights updated successfully.' };
      } catch (err: any) {
        console.error('[update_profile_insights] Error:', err.message);
        return { error: `Failed to update memory insights: ${err.message}` };
      }
    }
  }
};
