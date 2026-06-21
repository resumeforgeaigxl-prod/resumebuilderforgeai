import { createClient } from '@/lib/supabase/server';
import { consumeCodeExecutionCredit, refundCodeExecutionCredit } from '@/lib/code-execution-credits';
import { generateGroundedJobSearch } from '@/lib/gemini-service';
import { callAI } from '@/lib/ai/router';
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

const DEFAULT_RESUME_JSON: {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: { languages: string[]; frameworks: string[]; tools: string[]; other: string[] };
  experience: { id: string; company: string; role: string; duration: string; points: string[] }[];
  projects: { id: string; name: string; tech: string[]; description: string[] }[];
  education: { id: string; institution: string; degree: string; year: string; score: string }[];
  certifications: { id: string; title: string; issuer: string; year: string }[];
} = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  summary: "",
  skills: { languages: [], frameworks: [], tools: [], other: [] },
  experience: [],
  projects: [],
  education: [],
  certifications: []
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildResumeFromProfile(profile: any): typeof DEFAULT_RESUME_JSON {
  if (!profile) return { ...DEFAULT_RESUME_JSON };

  const profileSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const skills = {
    languages: [] as string[],
    frameworks: [] as string[],
    tools: [] as string[],
    other: profileSkills.length > 0 ? [...profileSkills] : []
  };

  const education: { id: string; institution: string; degree: string; year: string; score: string }[] = [];
  
  if (profile.education_10th_school) {
    education.push({
      id: `edu-10th-${Date.now()}`,
      institution: profile.education_10th_school || '',
      degree: '10th / SSC',
      year: profile.education_10th_year || '',
      score: profile.education_10th_percentage || ''
    });
  }
  if (profile.education_12th_school) {
    education.push({
      id: `edu-12th-${Date.now()}`,
      institution: profile.education_12th_school || '',
      degree: '12th / HSC',
      year: profile.education_12th_year || '',
      score: profile.education_12th_percentage || ''
    });
  }
  if (profile.education_diploma_college) {
    education.push({
      id: `edu-diploma-${Date.now()}`,
      institution: profile.education_diploma_college || '',
      degree: `Diploma in ${profile.education_diploma_branch || 'Engineering'}`,
      year: profile.education_diploma_year || '',
      score: profile.education_diploma_percentage || ''
    });
  }
  if (profile.education_btech_college) {
    education.push({
      id: `edu-btech-${Date.now()}`,
      institution: profile.education_btech_college || '',
      degree: `B.Tech in ${profile.education_btech_branch || 'Computer Science'}`,
      year: profile.education_btech_year || '',
      score: profile.education_btech_cgpa || ''
    });
  }
  if (profile.education_masters_college) {
    education.push({
      id: `edu-masters-${Date.now()}`,
      institution: profile.education_masters_college || '',
      degree: `${profile.education_masters_degree || 'M.Tech'} in ${profile.education_masters_branch || ''}`.trim(),
      year: profile.education_masters_year || '',
      score: profile.education_masters_cgpa || ''
    });
  }

  return {
    name: profile.full_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    linkedin: profile.linkedin_url || '',
    github: profile.github_url || '',
    summary: profile.professional_summary || '',
    skills,
    experience: [],
    projects: [],
    education: education.length > 0 ? education : [],
    certifications: []
  };
}

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
  },

  trigger_resume_generation: {
    name: 'trigger_resume_generation',
    description: 'Spawns a specialized subagent to autonomously compile, enrich, and generate a new ATS-optimized resume for the user using their practice records (coding tests, interviews) and profile data. Returns the generated resume ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        theme: {
          type: SchemaType.STRING,
          description: 'The template theme to select (modern, minimal, executive)',
          enum: ['modern', 'minimal', 'executive']
        }
      }
    },
    execute: async ({ theme }, userId) => {
      const supabase = createClient();
      try {
        // 1. Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (!profile) return { error: 'User profile not found.' };

        // 2. Fetch coding & interview achievements
        const { data: coding } = await supabase
          .from('coding_submissions')
          .select('language, status, score, problem_id')
          .eq('user_id', userId)
          .eq('status', 'success')
          .limit(5);

        const { data: interviews } = await supabase
          .from('mock_interviews')
          .select('role, score, feedback')
          .eq('user_id', userId)
          .order('score', { ascending: false })
          .limit(3);

        // 3. Build baseline resume JSON
        const baseResume = buildResumeFromProfile(profile);

        // 4. Enrich resume with achievements using AI subagent
        let enrichedResume = { ...baseResume };
        
        try {
          const enrichPrompt = `
You are a Resume Writer Subagent.
Your goal is to enrich the candidate's Base Resume JSON with realistic, high-impact bullet points and project descriptions based on their verified practice achievements.

Candidate Base Resume:
${JSON.stringify(baseResume)}

Verified Achievements:
- Solved Coding Tasks: ${JSON.stringify(coding || [])}
- Mock Interviews: ${JSON.stringify(interviews || [])}

Instructions:
1. Translate coding achievements into quantified experience bullet points (e.g. "Optimized data structure logic in JavaScript...") and place them in the experience or projects section.
2. Translate mock interview strengths/feedback into bullet points and place them in experience or skills.
3. Keep name, contact info, and education intact.
4. Output ONLY the complete, enriched Resume JSON matching the input schema.
`;
          const aiResponse = await callAI({
            task: 'resume',
            prompt: enrichPrompt,
            systemPrompt: "You are a professional resume writer.",
            userId,
            responseFormat: 'json'
          });
          const aiResult = JSON.parse(aiResponse.text);
          if (aiResult && typeof aiResult === 'object') {
            enrichedResume = { ...enrichedResume, ...aiResult };
          }
        } catch (aiErr) {
          console.warn('[trigger_resume_generation] AI enrichment failed, saving base resume:', aiErr);
        }

        // 5. Insert into database
        const resumeTitle = profile.target_role ? `${profile.target_role} Resume` : 'Untitled Resume';
        const { data: inserted, error } = await supabase
          .from('resumes')
          .insert({
            user_id: userId,
            title: resumeTitle,
            resume_json: enrichedResume,
            template_selected: theme || 'modern',
            email_sent: false
          })
          .select('id')
          .single();

        if (error) throw error;
        return { success: true, id: inserted.id, title: resumeTitle };
      } catch (err: any) {
        console.error('[trigger_resume_generation] Error:', err.message);
        return { error: `Failed to generate resume: ${err.message}` };
      }
    }
  },

  trigger_coding_challenge: {
    name: 'trigger_coding_challenge',
    description: 'Spawns a coding subagent to retrieve or dynamically generate a custom coding challenge for the user on a specific topic and difficulty, returning the challenge slug.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        topic: {
          type: SchemaType.STRING,
          description: 'The programming topic or concept (e.g. "Arrays", "DP", "React State")'
        },
        difficulty: {
          type: SchemaType.STRING,
          description: 'Difficulty level (Easy, Medium, Hard)',
          enum: ['Easy', 'Medium', 'Hard']
        }
      },
      required: ['topic', 'difficulty']
    },
    execute: async ({ topic, difficulty }, userId) => {
      const supabase = createClient();
      try {
        // First try to find an existing question on the topic/difficulty
        const { data: existing } = await supabase
          .from('coding_questions')
          .select('id, title, slug')
          .eq('difficulty', difficulty)
          .ilike('topic', `%${topic}%`)
          .limit(1)
          .maybeSingle();

        if (existing) {
          return { success: true, id: existing.id, slug: existing.slug, title: existing.title, is_new: false };
        }

        // If none exists, generate one dynamically
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
          systemPrompt: "You are an expert technical interviewer and competitive programmer.",
          userId,
          responseFormat: 'json'
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
            space_complexity: q.space_complexity
          })
          .select()
          .single();

        if (qError) throw qError;

        // Insert test cases
        if (q.test_cases && q.test_cases.length > 0) {
          const testCases = q.test_cases.map((tc: any, idx: number) => ({
            question_id: inserted.id,
            input: tc.input,
            expected_output: tc.output,
            is_hidden: tc.is_hidden || false,
            order_index: idx
          }));
          await supabase.from('coding_test_cases').insert(testCases);
        }

        // Insert solutions
        if (q.solutions) {
          const solutions = Object.entries(q.solutions).map(([lang, code]) => ({
            question_id: inserted.id,
            language: lang,
            code
          }));
          await supabase.from('coding_solutions').insert(solutions);
        }

        return { success: true, id: inserted.id, slug, title: q.title, is_new: true };
      } catch (err: any) {
        console.error('[trigger_coding_challenge] Error:', err.message);
        return { error: `Failed to spawn coding challenge: ${err.message}` };
      }
    }
  },

  trigger_mock_interview: {
    name: 'trigger_mock_interview',
    description: 'Spawns an interview subagent to set up a new mock interview session based on user target role and difficulty. Returns the mock interview session ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        role: {
          type: SchemaType.STRING,
          description: 'The job position/title (e.g. "Frontend Engineer", "DevOps Specialist")'
        },
        difficulty: {
          type: SchemaType.STRING,
          description: 'Interview level (Entry, Mid, Senior)',
          enum: ['Entry', 'Mid', 'Senior']
        }
      },
      required: ['role', 'difficulty']
    },
    execute: async ({ role, difficulty }, userId) => {
      const supabase = createClient();
      try {
        const prompt = `Generate 5 technical interview questions for a ${difficulty} level ${role} position.
Return a JSON array of strings containing only the questions: ["Question 1", "Question 2", ...]`;

        const response = await callAI({
          task: 'interview',
          prompt,
          systemPrompt: "You are an elite technical interviewer. Return valid JSON only.",
          userId,
          responseFormat: 'json'
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
            feedback: 'Awaiting completion'
          })
          .select('id')
          .single();

        if (error) throw error;
        return { success: true, id: session.id, role, num_questions: questions.length };
      } catch (err: any) {
        console.error('[trigger_mock_interview] Error:', err.message);
        return { error: `Failed to spawn mock interview: ${err.message}` };
      }
    }
  },

  trigger_study_plan: {
    name: 'trigger_study_plan',
    description: 'Spawns a study subagent to dynamically create a comprehensive learning syllabus and roadmap for a topic, adding it to the user\'s profile.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        topic: {
          type: SchemaType.STRING,
          description: 'The technology or concept name (e.g. "Kubernetes", "Next.js routing")'
        },
        durationWeeks: {
          type: SchemaType.NUMBER,
          description: 'The duration of the study roadmap in weeks (default: 4)'
        }
      },
      required: ['topic']
    },
    execute: async ({ topic, durationWeeks }, userId) => {
      const supabase = createClient();
      try {
        const weeks = durationWeeks || 4;
        const prompt = `Create a ${weeks}-week structured study syllabus outline for learning "${topic}".
Return ONLY a JSON array of strings representing the weekly milestone titles: ["Week 1: ...", "Week 2: ...", ...]`;

        const response = await callAI({
          task: 'learn',
          prompt,
          systemPrompt: "You are an expert technical curriculum designer. Return valid JSON only.",
          userId,
          responseFormat: 'json'
        });

        const syllabus = JSON.parse(response.text);
        if (!Array.isArray(syllabus)) {
          throw new Error('Syllabus is not a valid array');
        }

        const { data: roadmap, error } = await supabase
          .from('roadmaps')
          .insert({
            user_id: userId,
            title: topic,
            status: 'active',
            progress: 0,
            syllabus: syllabus
          })
          .select('id, title')
          .single();

        if (error) throw error;
        return { success: true, id: roadmap.id, title: roadmap.title, syllabus_steps: syllabus.length };
      } catch (err: any) {
        console.error('[trigger_study_plan] Error:', err.message);
        return { error: `Failed to create study plan: ${err.message}` };
      }
    }
  }
};

