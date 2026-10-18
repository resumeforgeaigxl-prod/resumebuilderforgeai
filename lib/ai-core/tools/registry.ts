import { SchemaType } from '@google/generative-ai';
import {
  listResumes,
  getResumeDetails,
  auditResumeATS,
  tailorResumeForJob,
  generateResume,
} from '@/lib/capabilities/resume';
import { updateCareerProfileInsights } from '@/lib/capabilities/career';
import { negotiateSalaryOffer } from '@/lib/capabilities/salary';
import { createLearningPlan, addStudyTopic, getLearningProgress } from '@/lib/capabilities/learning';
import { generateProjectBlueprint } from '@/lib/capabilities/projects';
import { listMockInterviews, triggerMockInterview, evaluateInterviewAnswer } from '@/lib/capabilities/interview';
import { listCodingSubmissions, listCodingProblems, runCodeSandbox, triggerCodingChallenge } from '@/lib/capabilities/coding';
import {
  searchJobMarket,
  getJobApplications,
  getCanonicalJobById,
  verifyJobFreshness,
  findReplacementOpportunities,
  checkJobApplicationEligibility,
  matchCandidateToJob,
  rankJobsForCandidate,
} from '@/lib/capabilities/jobs';
import {
  getCandidateApplicationProfile,
  upsertApplicationAnswer,
  SENSITIVE_PROTECTED_FIELDS,
} from '@/lib/capabilities/profile';
import { ApplicationPreparationEngine } from '@/lib/application-engine';

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

export const toolsRegistry: Record<string, ToolDefinition> = {
  // ─── RESUME CAPABILITIES ──────────────────────────────────────────────────
  list_resumes: {
    name: 'list_resumes',
    description: 'Lists all professional resumes created by the user, including details like scores and last updated timestamps.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      try {
        const resumes = await listResumes(userId);
        return { resumes };
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
      try {
        const resume = await getResumeDetails(resumeId, userId);
        if (!resume) return { error: 'Resume not found' };
        return { resume };
      } catch (err: any) {
        console.error('[get_resume_details] Error:', err.message);
        return { error: `Failed to fetch resume details: ${err.message}` };
      }
    }
  },

  audit_resume_ats: {
    name: 'audit_resume_ats',
    description: 'Performs a deep ATS compatibility analysis on the candidate resume. Computes ATS score (0-100), extracts matched keywords, identifies missing requirements, and flags critical improvements.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        resumeId: {
          type: SchemaType.STRING,
          description: 'The UUID of the resume to audit (optional, defaults to latest resume)'
        },
        targetRole: {
          type: SchemaType.STRING,
          description: 'The target role or title to benchmark against (e.g. "Senior Full-Stack Engineer")'
        },
        jobDescription: {
          type: SchemaType.STRING,
          description: 'The job posting description text to match against (optional)'
        }
      }
    },
    execute: async ({ resumeId, targetRole, jobDescription }, userId) => {
      try {
        return await auditResumeATS({ resumeId, targetRole, jobDescription }, userId);
      } catch (err: any) {
        console.error('[audit_resume_ats] Error:', err.message);
        return { error: `Failed to audit resume: ${err.message}` };
      }
    }
  },

  tailor_resume_for_job: {
    name: 'tailor_resume_for_job',
    description: 'Autonomously tailors the candidate resume specifically for a target role or job description. Rewrites bullet points to maximize ATS keyword match and persists a new tailored resume version.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        resumeId: {
          type: SchemaType.STRING,
          description: 'The UUID of the base resume to tailor (optional, defaults to most recent)'
        },
        targetRole: {
          type: SchemaType.STRING,
          description: 'The target role (e.g. "Senior Backend Engineer", "AI Product Engineer")'
        },
        jobDescription: {
          type: SchemaType.STRING,
          description: 'The job posting description or key requirements to optimize for'
        }
      },
      required: ['targetRole']
    },
    execute: async ({ resumeId, targetRole, jobDescription }, userId) => {
      try {
        return await tailorResumeForJob({ resumeId, targetRole, jobDescription }, userId);
      } catch (err: any) {
        console.error('[tailor_resume_for_job] Error:', err.message);
        return { error: `Failed to tailor resume: ${err.message}` };
      }
    }
  },

  trigger_resume_generation: {
    name: 'trigger_resume_generation',
    description: 'Generates a complete new professional resume tailored for a specific target role or title, optimizes it for ATS systems, and stores it in the database.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        targetRole: {
          type: SchemaType.STRING,
          description: 'Target job title (e.g. "Senior React Developer", "AI Engineer", "Product Manager")'
        },
        title: {
          type: SchemaType.STRING,
          description: 'A custom title for this resume (optional)'
        },
        experienceSummary: {
          type: SchemaType.STRING,
          description: 'Candidate background or key career summary (optional)'
        },
        skills: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Specific technical skills or tools to emphasize'
        }
      },
      required: ['targetRole']
    },
    execute: async ({ targetRole, title, experienceSummary, skills: inputSkills }, userId) => {
      try {
        return await generateResume({ targetRole, title, experienceSummary, skills: inputSkills }, userId);
      } catch (err: any) {
        console.error('[trigger_resume_generation] Error:', err.message);
        return { error: `Failed to generate resume: ${err.message}` };
      }
    }
  },

  // ─── CODING CAPABILITIES ─────────────────────────────────────────────────
  list_coding_submissions: {
    name: 'list_coding_submissions',
    description: 'Lists the user\'s recent coding challenge submissions, showing programming languages, pass/fail status, and scores.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      try {
        const submissions = await listCodingSubmissions(userId);
        return { submissions };
      } catch (err: any) {
        console.error('[list_coding_submissions] Error:', err.message);
        return { error: `Failed to fetch submissions: ${err.message}` };
      }
    }
  },

  list_coding_problems: {
    name: 'list_coding_problems',
    description: 'Lists the available coding challenges, including their titles, difficulty levels, and slugs.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async () => {
      try {
        const problems = await listCodingProblems();
        return { problems };
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
          description: 'The UUID of the coding challenge to run test cases against (optional)'
        }
      },
      required: ['language', 'code']
    },
    execute: async ({ language, code, stdin, problemId }, userId) => {
      try {
        return await runCodeSandbox({ language, code, stdin, problemId }, userId);
      } catch (err: any) {
        console.error('[run_code_sandbox] Execution failed:', err.message);
        return { error: `Execution sandbox error: ${err.message}` };
      }
    }
  },

  // ─── INTERVIEW CAPABILITIES ─────────────────────────────────────────────
  list_mock_interviews: {
    name: 'list_mock_interviews',
    description: 'Lists all mock interviews taken by the user, including overall scores, performance feedback, and interview types.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      try {
        const interviews = await listMockInterviews(userId);
        return { interviews };
      } catch (err: any) {
        console.error('[list_mock_interviews] Error:', err.message);
        return { error: `Failed to fetch interviews: ${err.message}` };
      }
    }
  },

  // ─── LEARNING CAPABILITIES ──────────────────────────────────────────────
  list_learning_progress: {
    name: 'list_learning_progress',
    description: 'Retrieves the user\'s active learning roadmap modules and progress.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      try {
        const progress = await getLearningProgress(userId);
        return { progress };
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
      try {
        return await addStudyTopic(topicName, userId);
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
      try {
        return await searchJobMarket(query);
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
      try {
        const applications = await getJobApplications(userId);
        return { applications };
      } catch (err: any) {
        console.error('[get_job_applications] Error:', err.message);
        return { error: `Failed to fetch job applications: ${err.message}` };
      }
    }
  },

  get_canonical_job: {
    name: 'get_canonical_job',
    description: 'Retrieves complete canonical job details, requirements, compensation, live status, and source provenance by canonical job UUID. If the vacancy has closed, automatically includes top similar active replacements.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        jobId: {
          type: SchemaType.STRING,
          description: 'The canonical UUID of the job opening to inspect'
        }
      },
      required: ['jobId']
    },
    execute: async ({ jobId }, userId) => {
      if (!jobId) return { error: 'jobId is required' };
      try {
        const job = await getCanonicalJobById(jobId, userId);
        return {
          job,
          isClosed: job.status === 'CLOSED',
          replacements: job.replacements || [],
        };
      } catch (err: any) {
        console.error('[get_canonical_job] Error:', err.message);
        return { error: `Failed to fetch canonical job: ${err.message}` };
      }
    }
  },

  verify_job_freshness: {
    name: 'verify_job_freshness',
    description: 'Verifies the live availability and application status of a vacancy. Detects HTTP 404/410, explicit closure phrasing, or active form state. Returns current status (ACTIVE, UNKNOWN, CLOSED) and closure reason.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        jobId: {
          type: SchemaType.STRING,
          description: 'The canonical UUID of the job to reverify'
        }
      },
      required: ['jobId']
    },
    execute: async ({ jobId }) => {
      if (!jobId) return { error: 'jobId is required' };
      try {
        const verification = await verifyJobFreshness(jobId, { force: true });
        return { verification };
      } catch (err: any) {
        console.error('[verify_job_freshness] Error:', err.message);
        return { error: `Failed to verify job: ${err.message}` };
      }
    }
  },

  find_job_replacements: {
    name: 'find_job_replacements',
    description: 'Discovers 3 to 5 similar ACTIVE replacement opportunities when a job vacancy is closed or expired. Ranks results by title similarity, skills overlap, location, experience fit, and candidate profile match.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        jobId: {
          type: SchemaType.STRING,
          description: 'The UUID of the closed vacancy to replace'
        }
      },
      required: ['jobId']
    },
    execute: async ({ jobId }, userId) => {
      if (!jobId) return { error: 'jobId is required' };
      try {
        const result = await findReplacementOpportunities(jobId, userId, 3);
        return {
          originalJob: {
            id: result.originalJobId,
            title: result.originalJobTitle,
            company: result.originalCompany,
            status: result.originalStatus,
          },
          replacements: result.replacements,
          count: result.count,
        };
      } catch (err: any) {
        console.error('[find_job_replacements] Error:', err.message);
        return { error: `Failed to find replacements: ${err.message}` };
      }
    }
  },

  get_job_match: {
    name: 'get_job_match',
    description: 'Calculates or retrieves the explainable match score between the candidate application profile and a canonical active job. Evaluates skills fit, experience fit, role family, location, compensation, hard blockers, and data confidence.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        jobId: {
          type: SchemaType.STRING,
          description: 'The canonical UUID of the job opening to evaluate against'
        },
        forceRecalculate: {
          type: SchemaType.BOOLEAN,
          description: 'Set to true to bypass cache and recompute from latest profile and resume'
        }
      },
      required: ['jobId']
    },
    execute: async ({ jobId, forceRecalculate }, userId) => {
      if (!jobId) return { error: 'jobId is required' };
      try {
        const match = await matchCandidateToJob({
          userId,
          jobId,
          forceRecalculate: Boolean(forceRecalculate),
        });
        return {
          success: true,
          tool: 'get_job_match',
          jobId,
          jobTitle: match.job?.title,
          company: match.job?.company,
          score: match.score,
          category: match.category,
          recommendation: match.recommendation,
          confidence: match.confidence,
          isBlocked: match.isBlocked,
          summary: match.explanation?.summary,
          strongMatches: match.explanation?.strongMatches,
          missingRequirements: match.explanation?.missingRequirements,
          underrepresentedSkills: match.explanation?.underrepresentedSkills,
          blockers: match.explanation?.blockers,
          evidence: match.evidence,
        };
      } catch (err: any) {
        console.error('[get_job_match] Error:', err.message);
        return { error: `Failed to evaluate candidate job match: ${err.message}` };
      }
    }
  },

  explain_job_match: {
    name: 'explain_job_match',
    description: 'Provides deep, evidence-based explainability for why a candidate received a specific match score and recommendation. Outlines strong matches, partial matches, underrepresented skills (resume tailoring opportunities), strictly missing requirements, blockers, and unknown data points.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        jobId: {
          type: SchemaType.STRING,
          description: 'The canonical UUID of the job opening to explain'
        }
      },
      required: ['jobId']
    },
    execute: async ({ jobId }, userId) => {
      if (!jobId) return { error: 'jobId is required' };
      try {
        const match = await matchCandidateToJob({ userId, jobId });
        return {
          success: true,
          tool: 'explain_job_match',
          jobId,
          jobTitle: match.job?.title,
          company: match.job?.company,
          score: match.score,
          category: match.category,
          recommendation: match.recommendation,
          confidence: match.confidence,
          isBlocked: match.isBlocked,
          summary: match.explanation?.summary,
          strongMatches: match.explanation?.strongMatches,
          missingRequirements: match.explanation?.missingRequirements,
          underrepresentedSkills: match.explanation?.underrepresentedSkills,
          blockers: match.explanation?.blockers,
          evidence: match.evidence,
        };
      } catch (err: any) {
        console.error('[explain_job_match] Error:', err.message);
        return { error: `Failed to explain job match: ${err.message}` };
      }
    }
  },

  rank_candidate_jobs: {
    name: 'rank_candidate_jobs',
    description: 'Ranks canonical active job vacancies against the candidate\'s profile using a high-performance 2-stage matching pipeline. Returns top opportunities sorted by fit score, unblocked status, and confidence.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        limit: {
          type: SchemaType.NUMBER,
          description: 'Maximum number of ranked job matches to return (default 10)'
        },
        minScore: {
          type: SchemaType.NUMBER,
          description: 'Minimum match score filter from 0 to 100 (default 60)'
        },
        excludeBlocked: {
          type: SchemaType.BOOLEAN,
          description: 'Whether to exclude blocked or incompatible jobs (default true)'
        }
      }
    },
    execute: async ({ limit = 10, minScore = 60, excludeBlocked = true }, userId) => {
      try {
        const matches = await rankJobsForCandidate({
          userId,
          limit,
          minScore,
          excludeBlocked,
        });
        return {
          success: true,
          tool: 'rank_candidate_jobs',
          count: matches.length,
          matches: matches.map(m => ({
            jobId: m.jobId,
            jobTitle: m.job?.title,
            company: m.job?.company,
            score: m.score,
            category: m.category,
            recommendation: m.recommendation,
            confidence: m.confidence,
            summary: m.explanation.summary,
            strongMatches: m.explanation.strongMatches,
            missingRequirements: m.explanation.missingRequirements,
            underrepresentedSkills: m.explanation.underrepresentedSkills,
            isBlocked: m.isBlocked,
          })),
        };
      } catch (err: any) {
        console.error('[rank_candidate_jobs] Error:', err.message);
        return { error: `Failed to rank candidate jobs: ${err.message}` };
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
      try {
        return await updateCareerProfileInsights({ goals, weaknesses, improvements }, userId);
      } catch (err: any) {
        console.error('[update_profile_insights] Error:', err.message);
        return { error: `Failed to update memory insights: ${err.message}` };
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
      try {
        return await triggerCodingChallenge({ topic, difficulty }, userId);
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
      try {
        return await triggerMockInterview({ role, difficulty }, userId);
      } catch (err: any) {
        console.error('[trigger_mock_interview] Error:', err.message);
        return { error: `Failed to spawn mock interview: ${err.message}` };
      }
    }
  },

  evaluate_interview_answer: {
    name: 'evaluate_interview_answer',
    description: 'Evaluates candidate response to an interview question using the STAR framework, computes score (0-100), assesses communication depth, and provides a polished model answer.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        role: {
          type: SchemaType.STRING,
          description: 'The job title/role (e.g. "Senior Backend Engineer", "Product Manager")'
        },
        question: {
          type: SchemaType.STRING,
          description: 'The interview question that was asked'
        },
        userAnswer: {
          type: SchemaType.STRING,
          description: 'The candidate answer text or transcript'
        }
      },
      required: ['question', 'userAnswer']
    },
    execute: async ({ role, question, userAnswer }, userId) => {
      try {
        return await evaluateInterviewAnswer({ role, question, userAnswer }, userId);
      } catch (err: any) {
        console.error('[evaluate_interview_answer] Error:', err.message);
        return { error: `Evaluation failed: ${err.message}` };
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
      try {
        return await createLearningPlan({ topic, durationWeeks }, userId);
      } catch (err: any) {
        console.error('[trigger_study_plan] Error:', err.message);
        return { error: `Failed to create study plan: ${err.message}` };
      }
    }
  },

  // ─── PROJECTFORGE TOOLS ──────────────────────────────────────────────────
  generate_project_blueprint: {
    name: 'generate_project_blueprint',
    description: 'Generates a full-stack portfolio project architecture, folder structure, starter code files, and key milestones to showcase on a resume or GitHub.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        idea: {
          type: SchemaType.STRING,
          description: 'The project concept or domain (e.g., "AI Resume Scanner with Next.js", "Distributed Cache in Go")'
        }
      },
      required: ['idea']
    },
    execute: async ({ idea }, userId) => {
      if (!idea) return { error: 'idea is required' };
      try {
        return await generateProjectBlueprint({ idea }, userId);
      } catch (err: any) {
        console.error('[generate_project_blueprint] Error:', err.message);
        return { error: `Failed to generate project blueprint: ${err.message}` };
      }
    }
  },

  // ─── SALARYFORGE TOOLS ───────────────────────────────────────────────────
  negotiate_salary_offer: {
    name: 'negotiate_salary_offer',
    description: 'Generates an executive salary negotiation strategy, market benchmarks, and customized scripts to negotiate higher compensation.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        role: {
          type: SchemaType.STRING,
          description: 'The job title (e.g. "Senior Frontend Engineer", "Staff Backend Lead")'
        },
        currentOffer: {
          type: SchemaType.STRING,
          description: 'The offered compensation or baseline (e.g. "$120,000", "₹18 LPA")'
        },
        targetSalary: {
          type: SchemaType.STRING,
          description: 'The candidate target compensation (e.g. "$145,000", "₹24 LPA")'
        }
      },
      required: ['role', 'currentOffer', 'targetSalary']
    },
    execute: async ({ role, currentOffer, targetSalary }, userId) => {
      try {
        return await negotiateSalaryOffer({ role, currentOffer, targetSalary }, userId);
      } catch (err: any) {
        console.error('[negotiate_salary_offer] Error:', err.message);
        return { error: `Failed to negotiate salary: ${err.message}` };
      }
    }
  },

  // ─── CANDIDATE APPLICATION PROFILE TOOLS ──────────────────────────────────
  get_candidate_profile: {
    name: 'get_candidate_profile',
    description: 'Retrieves the candidate canonical application profile including verified application answers, career facts, target preferences, readiness state, and any application blockers. Call this to check facts before answering questions or preparing job applications.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      try {
        const profile = await getCandidateApplicationProfile(userId);
        return {
          success: true,
          tool: 'get_candidate_profile',
          fullName: profile.identity.fullName,
          email: profile.identity.email,
          phone: profile.identity.phoneNumber,
          location: profile.identity.currentCity,
          skills: profile.career.skills,
          targetRoles: profile.preferences.targetRoles,
          preferredLocations: profile.preferences.preferredLocations,
          remotePreference: profile.preferences.remotePreference,
          salaryRange: {
            min: profile.preferences.preferredSalaryMin,
            max: profile.preferences.preferredSalaryMax,
            currency: profile.preferences.salaryCurrency,
          },
          readinessStatus: profile.readiness.status,
          readinessSummary: profile.readiness.summary,
          completenessPercentage: profile.completeness.percentage,
          blockers: profile.readiness.blockers,
          verifiedAnswers: Object.fromEntries(
            Object.entries(profile.answers).map(([k, v]) => [
              k,
              { value: v.value, status: v.status, verified: v.verified, source: v.source }
            ])
          ),
        };
      } catch (err: any) {
        console.error('[get_candidate_profile] Error:', err.message);
        return { error: `Failed to retrieve candidate profile: ${err.message}` };
      }
    }
  },

  update_candidate_application_answer: {
    name: 'update_candidate_application_answer',
    description: 'Updates or records a verified reusable application answer (e.g. notice_period, expected_salary, willing_to_relocate, or explicit work authorization confirmation). NEVER guess or infer sensitive answers (visa, citizenship, work authorization) unless explicitly confirmed by the user in this conversation.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        field: {
          type: SchemaType.STRING,
          description: 'The answer field name (e.g. "notice_period", "expected_salary", "work_authorization", "willing_to_relocate", "available_start_date")'
        },
        value: {
          type: SchemaType.STRING,
          description: 'The answer value provided or confirmed by the candidate'
        },
        userConfirmed: {
          type: SchemaType.BOOLEAN,
          description: 'Whether the candidate explicitly confirmed this answer in conversation (must be true for sensitive items)'
        }
      },
      required: ['field', 'value', 'userConfirmed']
    },
    execute: async ({ field, value, userConfirmed }, userId) => {
      try {
        if (!userConfirmed) {
          return {
            error: 'User confirmation is required to update candidate application answers.',
            needsConfirmation: true,
          };
        }

        const isSensitive = SENSITIVE_PROTECTED_FIELDS.includes(field as any);
        const answer = await upsertApplicationAnswer(userId, field, value, {
          status: 'VERIFIED',
          verified: true,
          source: 'user',
          valueType: typeof value === 'number' ? 'number' : 'string',
        });

        return {
          success: true,
          tool: 'update_candidate_application_answer',
          message: `Recorded ${field} as verified answer: "${value}".`,
          answer,
          isSensitive,
        };
      } catch (err: any) {
        console.error('[update_candidate_application_answer] Error:', err.message);
        return { error: `Failed to update application answer: ${err.message}` };
      }
    }
  },

  check_application_readiness: {
    name: 'check_application_readiness',
    description: 'Evaluates whether the candidate profile has verified all essential application facts (work authorization, expected salary, notice period, contact info, core skills). Returns readiness status (NOT_READY, READY_WITH_CONFIRMATION, READY), missing blockers, and a link to complete the profile.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    },
    execute: async (_, userId) => {
      try {
        const profile = await getCandidateApplicationProfile(userId);
        return {
          success: true,
          tool: 'check_application_readiness',
          status: profile.readiness.status,
          summary: profile.readiness.summary,
          completeness: `${profile.completeness.percentage}%`,
          blockers: profile.readiness.blockers,
          missingCritical: profile.completeness.missingCritical,
          missingRecommended: profile.completeness.missingRecommended,
          actionLink: '/account?tab=application-profile',
          shortcutPrompt: profile.readiness.blockers.length > 0
            ? `${profile.readiness.blockers.length} details are missing before applications can be prepared automatically. Please visit your Application Profile to complete them.`
            : 'Your Application Profile is ready for agent applications!',
        };
      } catch (err: any) {
        console.error('[check_application_readiness] Error:', err.message);
        return { error: `Failed to check application readiness: ${err.message}` };
      }
    }
  },

  // ─── APPLICATION PREPARATION ENGINE (LEVEL 12) ──────────────────────────
  prepare_job_application_package: {
    name: 'prepare_job_application_package',
    description: 'Prepares a complete, structured, truthful application package for a target canonical job before browser automation. Validates job freshness, checks Level 10 match blockers, selects/tailors truthful resume, derives safe facts, and compiles missing unknown questions into READY, NEEDS_USER, or BLOCKED status.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        jobId: {
          type: SchemaType.STRING,
          description: 'The UUID of the canonical job to prepare an application package for.',
        },
        userOverride: {
          type: SchemaType.BOOLEAN,
          description: 'Set to true if user explicitly requests preparing for a low priority/skip job without hard blockers.',
        },
      },
      required: ['jobId'],
    },
    execute: async ({ jobId, userOverride = false }, userId) => {
      try {
        const pkg = await ApplicationPreparationEngine.preparePackage({
          userId,
          jobId,
          userOverride,
        });

        if (pkg.status === 'BLOCKED') {
          return {
            success: true,
            tool: 'prepare_job_application_package',
            status: 'BLOCKED',
            packageId: pkg.id,
            jobId,
            jobTitle: pkg.jobSnapshot?.title,
            company: pkg.jobSnapshot?.company,
            readinessScore: '0%',
            reason: pkg.blockedReason,
            evidence: pkg.blockedEvidence,
            message: `Cannot prepare application for ${pkg.jobSnapshot?.company || 'Company'} - ${pkg.jobSnapshot?.title || 'Role'}: ${pkg.blockedEvidence || pkg.blockedReason}`,
          };
        }

        if (pkg.status === 'NEEDS_USER') {
          const missingFormatted = pkg.unknownQuestions
            .filter((q) => q.required)
            .map((q, idx) => `${idx + 1}. ${q.question} (${q.reason})`)
            .join('\n');

          return {
            success: true,
            tool: 'prepare_job_application_package',
            status: 'NEEDS_USER',
            packageId: pkg.id,
            readinessScore: `${pkg.readinessScore}%`,
            jobTitle: pkg.jobSnapshot.title,
            company: pkg.jobSnapshot.company,
            resumeUsed: pkg.documents.find((d) => d.type === 'RESUME')?.title,
            tailoringStatus: pkg.tailoringStatus,
            missingQuestionsCount: pkg.unknownQuestions.filter((q) => q.required).length,
            missingQuestions: pkg.unknownQuestions,
            message: `Application for ${pkg.jobSnapshot.company} is ${pkg.readinessScore}% ready, but requires your input on ${pkg.unknownQuestions.filter((q) => q.required).length} question(s):\n\n${missingFormatted}\n\nPlease reply with your answers so I can finalize your package.`,
          };
        }

        return {
          success: true,
          tool: 'prepare_job_application_package',
          status: 'READY',
          packageId: pkg.id,
          readinessScore: '100%',
          jobTitle: pkg.jobSnapshot.title,
          company: pkg.jobSnapshot.company,
          resumeUsed: pkg.documents.find((d) => d.type === 'RESUME')?.title,
          tailoringStatus: pkg.tailoringStatus,
          message: `Application package for ${pkg.jobSnapshot.company} — ${pkg.jobSnapshot.title} is verified and 100% READY!\n\n✓ Job active & verified\n✓ Resume tailored & verified\n✓ Contact & career answers resolved\n✓ Documents attached\n\nYour package is ready for future submission review.`,
        };
      } catch (err: any) {
        console.error('[prepare_job_application_package] Error:', err.message);
        return { error: `Failed to prepare application package: ${err.message}` };
      }
    },
  },

  answer_application_questions: {
    name: 'answer_application_questions',
    description: 'Submits user answers to unresolved questions in an application package. Reusable answers (salary, notice period, work authorization) update the candidate profile, while job-specific answers update the package, transitioning it to READY.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        packageId: {
          type: SchemaType.STRING,
          description: 'The UUID of the application package to update.',
        },
        answersJson: {
          type: SchemaType.STRING,
          description: 'JSON object containing key-value pairs of answers (e.g., {"expected_salary": "15 LPA", "work_authorization": true}).',
        },
      },
      required: ['packageId', 'answersJson'],
    },
    execute: async ({ packageId, answersJson }, userId) => {
      try {
        let answersObj: Record<string, any> = {};
        try {
          answersObj = typeof answersJson === 'string' ? JSON.parse(answersJson) : answersJson;
        } catch (pErr) {
          return { error: 'Invalid answers format. Please provide valid JSON.' };
        }

        const updatedPkg = await ApplicationPreparationEngine.answerMissingQuestions({
          packageId,
          userId,
          answers: answersObj,
        });

        return {
          success: true,
          tool: 'answer_application_questions',
          status: updatedPkg.status,
          readinessScore: `${updatedPkg.readinessScore}%`,
          remainingQuestionsCount: updatedPkg.unknownQuestions.filter((q) => q.required).length,
          message: updatedPkg.status === 'READY'
            ? `All questions resolved! Application package for ${updatedPkg.jobSnapshot.company} is now 100% READY.`
            : `Answers recorded. ${updatedPkg.unknownQuestions.filter((q) => q.required).length} required question(s) remaining.`,
        };
      } catch (err: any) {
        console.error('[answer_application_questions] Error:', err.message);
        return { error: `Failed to answer application questions: ${err.message}` };
      }
    },
  },

  // ─── BROWSER APPLICATION AGENT (LEVEL 13: APPROVAL MODE) ─────────────────
  start_browser_application: {
    name: 'start_browser_application',
    description: 'Launches the Browser Application Agent in APPROVAL MODE for a READY application package. Opens the employer career portal, maps verified candidate details, uploads the approved resume, validates the form, and halts at the submission boundary (AWAITING_APPROVAL) for candidate review. NEVER submits automatically.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        packageId: {
          type: SchemaType.STRING,
          description: 'The UUID of the READY application package to execute.',
        },
      },
      required: ['packageId'],
    },
    execute: async ({ packageId }, userId) => {
      try {
        const { BrowserApplicationAgentService } = await import('@/lib/browser-agent');
        const run = await BrowserApplicationAgentService.startRun({
          userId,
          packageId,
        });

        if (run.status === 'AWAITING_APPROVAL') {
          return {
            success: true,
            tool: 'start_browser_application',
            status: 'AWAITING_APPROVAL',
            runId: run.id,
            packageId,
            company: run.handoffPayload?.company || 'Employer',
            jobTitle: run.handoffPayload?.jobTitle || 'Role',
            provider: run.provider,
            filledFieldsCount: run.handoffPayload?.filledFieldsCount || 0,
            resumeUploaded: run.handoffPayload?.resumeUploaded || false,
            resumeFileName: run.handoffPayload?.resumeFileName,
            readyToSubmit: true,
            message: `Application for ${run.handoffPayload?.company || 'Employer'} — ${run.handoffPayload?.jobTitle || 'Role'} is filled and validated!\n\n✓ ${run.handoffPayload?.filledFieldsCount || 0} fields verified\n✓ Resume uploaded (${run.handoffPayload?.resumeFileName || 'approved resume'})\n✓ 0 unresolved required questions\n\nReady for your approval. Please review and approve to submit.`,
          };
        }

        if (run.status === 'NEEDS_USER') {
          return {
            success: true,
            tool: 'start_browser_application',
            status: 'NEEDS_USER',
            runId: run.id,
            packageId,
            provider: run.provider,
            handoffReason: run.handoffReason,
            handoffPayload: run.handoffPayload,
            message: run.handoffPayload?.message || `Your input is required to continue applying to ${run.provider}: ${run.handoffReason}`,
          };
        }

        if (run.status === 'UNSUPPORTED') {
          return {
            success: true,
            tool: 'start_browser_application',
            status: 'UNSUPPORTED',
            runId: run.id,
            packageId,
            applyUrl: run.handoffPayload?.applyUrl,
            message: run.handoffPayload?.message || 'This application portal uses a format not automated yet. Your application package is ready for manual application.',
          };
        }

        return {
          success: run.status === 'SUBMITTED',
          tool: 'start_browser_application',
          status: run.status,
          runId: run.id,
          message: run.errorMessage || `Browser application status: ${run.status}`,
        };
      } catch (err: any) {
        console.error('[start_browser_application] Error:', err.message);
        return { error: `Failed to launch browser application agent: ${err.message}` };
      }
    },
  },

  approve_and_submit_job_application: {
    name: 'approve_and_submit_job_application',
    description: 'Explicitly approves and finalizes submission of a verified employer application previously paused in AWAITING_APPROVAL status. Submits the application once, checks confirmation, settles 8 credits, and records application tracking evidence.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        runId: {
          type: SchemaType.STRING,
          description: 'The UUID of the browser application run to approve and submit.',
        },
        packageId: {
          type: SchemaType.STRING,
          description: 'The UUID of the associated application package.',
        },
        userApprovalConfirmed: {
          type: SchemaType.BOOLEAN,
          description: 'Explicit candidate confirmation to submit the application.',
        },
      },
      required: ['runId', 'packageId', 'userApprovalConfirmed'],
    },
    execute: async ({ runId, packageId, userApprovalConfirmed }, userId) => {
      try {
        if (!userApprovalConfirmed) {
          return {
            error: 'Explicit user approval is required before submitting.',
            status: 'POLICY_BLOCKED',
          };
        }

        const { BrowserApplicationAgentService } = await import('@/lib/browser-agent');
        const run = await BrowserApplicationAgentService.approveAndSubmit({
          userId,
          runId,
          packageId,
          explicitUserConsent: true,
        });

        if (run.status === 'SUBMITTED') {
          return {
            success: true,
            tool: 'approve_and_submit_job_application',
            status: 'SUBMITTED',
            runId: run.id,
            submittedAt: run.submittedAt,
            confirmationUrl: run.confirmationUrl,
            confirmationText: run.confirmationText,
            message: `Application submitted successfully!\n\n✓ Confirmation received\n✓ Timestamp: ${run.submittedAt}\n✓ Tracked in your Applications dashboard.`,
          };
        }

        return {
          success: false,
          tool: 'approve_and_submit_job_application',
          status: run.status,
          runId: run.id,
          error: run.errorMessage || 'Submission could not be confirmed.',
          message: run.status === 'SUBMISSION_UNKNOWN'
            ? 'Submission was triggered, but confirmation text could not be verified automatically. Halting retry to avoid duplicate application.'
            : run.errorMessage,
        };
      } catch (err: any) {
        console.error('[approve_and_submit_job_application] Error:', err.message);
        return { error: `Failed to submit application: ${err.message}` };
      }
    },
  },
};

