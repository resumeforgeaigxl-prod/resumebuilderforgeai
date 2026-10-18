/**
 * ResumeForge — Resume Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Governs all resume creation, auditing, bullet rewrites, and job tailoring.
 * Enforces strictly truthful representation of candidate background.
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext } from './types';

export const RESUME_POLICY_VERSION = '1.0.0';

export const ResumePolicy: DomainPolicy = {
  id: 'resume-policy',
  name: 'Resume Truth & Tailoring Policy',
  version: RESUME_POLICY_VERSION,
  description: 'Guarantees that resumes never fabricate skills, metrics, employers, or experience durations.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { action, proposedChanges, profile } = ctx;

    if (action === 'TAILOR_RESUME' || action === 'REWRITE_BULLET' || action === 'EDIT_RESUME') {
      // 1. Check for fabricated skills
      if (proposedChanges?.addedSkills && Array.isArray(proposedChanges.addedSkills)) {
        const verifiedSkills = new Set(
          (profile?.career?.skills || []).map((s: string) => s.toLowerCase())
        );

        const fabricated = proposedChanges.addedSkills.filter(
          (s: string) => !verifiedSkills.has(s.toLowerCase())
        );

        if (fabricated.length > 0) {
          return {
            allowed: false,
            policyId: 'resume-policy',
            reasonCode: 'FABRICATED_SKILLS_DETECTED',
            humanMessage: `Cannot add skills not present in candidate profile: ${fabricated.join(', ')}. Missing skills must remain missing.`,
            details: { fabricatedSkills: fabricated },
          };
        }
      }

      // 2. Check for altered employment durations
      if (proposedChanges?.alteredDurations) {
        return {
          allowed: false,
          policyId: 'resume-policy',
          reasonCode: 'EMPLOYMENT_DURATION_TAMPERING',
          humanMessage: 'Altering verified employment start/end dates or durations is strictly forbidden.',
        };
      }

      // 3. Check for invented metrics
      if (proposedChanges?.inventedMetrics) {
        return {
          allowed: false,
          policyId: 'resume-policy',
          reasonCode: 'INVENTED_METRICS_DETECTED',
          humanMessage: 'AI-generated metrics, revenue numbers, or percentage increases without candidate evidence are strictly forbidden.',
        };
      }
    }

    return {
      allowed: true,
      policyId: 'resume-policy',
      reasonCode: 'RESUME_POLICY_COMPLIANT',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: RESUME_POLICY v${RESUME_POLICY_VERSION}]
- YOU MAY: Reorder truthful information, rewrite phrasing for clarity, emphasize verified relevant experience, surface relevant projects, adjust summary framing, use accurate industry terminology, remove irrelevant content.
- YOU MUST NEVER: Invent experience, invent metrics, alter employment duration, invent certifications, invent employers, invent job titles, add missing skills as possessed, fabricate education, or fabricate projects.
- EVIDENCE RULE: If candidate evidence does not exist for a requirement, it must remain classified as MISSING. Never add it.`;
  },
};
