/**
 * ResumeForge — Level 16: Omni Autopilot Discovery & Hard Constraints Service
 * Implements deterministic-first job discovery, hard blocker enforcement,
 * and Level 10 explainable match ranking.
 */

import { createClient } from '@/lib/supabase/server';
import { getCandidateApplicationProfile } from '@/lib/capabilities/profile';
import { matchCandidateToJob } from '@/lib/matching/engine';
import type { CanonicalJobRecord } from '@/lib/jobs/types';
import type { CandidateJobMatchResult } from '@/lib/matching/types';
import type { AutopilotPolicy, AutopilotJobDecision, AutopilotDecisionType } from './types';

// In-memory job fixtures for test runner isolation
let inMemoryJobFixtures: CanonicalJobRecord[] | null = null;
let inMemoryAppliedJobIds: Set<string> | null = null;
let inMemoryProfileFixture: any | null = null;
let inMemoryCustomMatcher: ((userId: string, job: CanonicalJobRecord) => Promise<CandidateJobMatchResult>) | null = null;

export interface DiscoveryResult {
  eligibleJobs: Array<{
    job: CanonicalJobRecord;
    match: CandidateJobMatchResult;
  }>;
  decisions: AutopilotJobDecision[];
  totalEvaluated: number;
  totalEligible: number;
}

export class AutopilotDiscoveryService {
  /**
   * Sets in-memory test fixtures (strictly for unit and fault-injection tests).
   */
  static _setTestFixtures(
    jobs: CanonicalJobRecord[],
    appliedIds: string[] = [],
    profileFixture?: any | null,
    customMatcher?: ((userId: string, job: CanonicalJobRecord) => Promise<CandidateJobMatchResult>) | null
  ): void {
    inMemoryJobFixtures = jobs;
    inMemoryAppliedJobIds = new Set(appliedIds);
    inMemoryProfileFixture = profileFixture || null;
    inMemoryCustomMatcher = customMatcher || null;
  }

  static _clearTestFixtures(): void {
    inMemoryJobFixtures = null;
    inMemoryAppliedJobIds = null;
    inMemoryProfileFixture = null;
    inMemoryCustomMatcher = null;
  }

  /**
   * Discovers and evaluates candidate jobs against candidate hard constraints
   * and Level 10 explainable matching rules.
   */
  static async discoverAndFilterJobs(
    userId: string,
    policy: AutopilotPolicy
  ): Promise<DiscoveryResult> {
    const now = new Date().toISOString();
    const decisions: AutopilotJobDecision[] = [];

    // 1. Fetch Candidate Application Profile
    const profile = inMemoryProfileFixture || (await getCandidateApplicationProfile(userId));
    const candidateAnswers = profile.answers || {};

    // 2. Fetch Previously Applied / Prepared Job IDs
    const appliedJobIds = new Set<string>();
    if (inMemoryAppliedJobIds) {
      for (const id of Array.from(inMemoryAppliedJobIds)) {
        appliedJobIds.add(id);
      }
    } else {
      try {
        const supabase = createClient();
        const { data: existingApps } = await supabase
          .from('job_applications')
          .select('job_id')
          .eq('user_id', userId);

        if (existingApps) {
          for (const row of existingApps) {
            if (row.job_id) appliedJobIds.add(String(row.job_id));
          }
        }
      } catch {
        // Fallback
      }
    }

    // 3. Retrieve Candidate Job Pool
    let candidateJobs: CanonicalJobRecord[] = [];
    if (inMemoryJobFixtures) {
      candidateJobs = inMemoryJobFixtures;
    } else {
      try {
        const supabase = createClient();
        let query = supabase
          .from('jobs')
          .select('*')
          .neq('status', 'CLOSED')
          .order('discovered_at', { ascending: false })
          .limit(100);

        const { data, error } = await query;
        if (data && !error) {
          candidateJobs = data as CanonicalJobRecord[];
        }
      } catch {
        candidateJobs = [];
      }
    }

    const eligibleJobs: Array<{ job: CanonicalJobRecord; match: CandidateJobMatchResult }> = [];

    // 4. Process Each Job Through Deterministic Hard Constraints Before Matching
    for (const job of candidateJobs) {
      const jobTitle = job.title || 'Untitled Role';
      const company = job.company || 'Unknown Employer';

      // Constraint 1: Job Status Check
      if (job.status === 'CLOSED') {
        decisions.push({
          jobId: job.id,
          jobTitle,
          company,
          decision: 'BLOCKED',
          reason: 'Job opening has been closed or cancelled by employer.',
          evaluatedAt: now,
        });
        continue;
      }

      // Constraint 2: Already Applied Check (Deduplication)
      if (appliedJobIds.has(job.id)) {
        decisions.push({
          jobId: job.id,
          jobTitle,
          company,
          decision: 'ALREADY_APPLIED',
          reason: 'Candidate has already submitted or prepared an application for this vacancy.',
          evaluatedAt: now,
        });
        continue;
      }

      // Constraint 3: Excluded Companies Filter
      if (
        policy.excludedCompanies.length > 0 &&
        policy.excludedCompanies.some(
          (exc) => exc.toLowerCase().trim() === company.toLowerCase().trim()
        )
      ) {
        decisions.push({
          jobId: job.id,
          jobTitle,
          company,
          decision: 'BLOCKED',
          reason: `Employer "${company}" is on candidate's excluded companies list.`,
          evaluatedAt: now,
        });
        continue;
      }

      // Constraint 4: Remote & Workplace Preferences
      if (policy.remotePreference === 'REMOTE' && job.remote_type === 'ONSITE') {
        const candidateLoc = (profile.identity?.currentCity || '').toLowerCase();
        const jobLoc = (job.location || '').toLowerCase();
        if (candidateLoc && jobLoc && !jobLoc.includes(candidateLoc)) {
          decisions.push({
            jobId: job.id,
            jobTitle,
            company,
            decision: 'BLOCKED',
            reason: `Job requires onsite presence in ${job.location}, conflicting with candidate's Remote policy.`,
            evaluatedAt: now,
          });
          continue;
        }
      }

      // Constraint 5: Work Authorization & Visa Sponsorship (Never invent answers)
      const requiresSponsorshipAnswer = candidateAnswers['requires_visa_sponsorship']?.value;
      const jobRequiresAuthorizedOnly =
        (job.description && /must be legally authorized to work|no visa sponsorship|us citizenship required/i.test(job.description)) ||
        (job as any).requires_us_citizenship;

      if (jobRequiresAuthorizedOnly && requiresSponsorshipAnswer === true) {
        decisions.push({
          jobId: job.id,
          jobTitle,
          company,
          decision: 'BLOCKED',
          reason: 'Candidate requires visa sponsorship, but employer explicitly specifies no sponsorship provided.',
          evaluatedAt: now,
        });
        continue;
      }

      // Constraint 6: Candidate Experience Range
      if (
        policy.experienceRange?.minimum !== undefined &&
        job.experience_min !== undefined &&
        job.experience_min !== null
      ) {
        const candidateYears = profile.career?.totalExperienceYears ?? 0;
        if (job.experience_min > candidateYears + 3) {
          decisions.push({
            jobId: job.id,
            jobTitle,
            company,
            decision: 'BLOCKED',
            reason: `Role requires minimum ${job.experience_min} years experience, significantly exceeding candidate's ${candidateYears} years.`,
            evaluatedAt: now,
          });
          continue;
        }
      }

      // Constraint 7: Candidate Minimum Salary Threshold
      if (policy.minSalary && job.salary_max && job.salary_max > 0) {
        if (job.salary_max < policy.minSalary) {
          decisions.push({
            jobId: job.id,
            jobTitle,
            company,
            decision: 'BLOCKED',
            reason: `Maximum offered salary (${job.salary_max} ${job.salary_currency || 'INR'}) is below candidate policy minimum (${policy.minSalary}).`,
            evaluatedAt: now,
          });
          continue;
        }
      }

      // ─────────────────────────────────────────────────────────────
      // STAGE 2: Level 10 Explainable Matching
      // ─────────────────────────────────────────────────────────────
      let matchResult: CandidateJobMatchResult;
      try {
        if (inMemoryCustomMatcher) {
          matchResult = await inMemoryCustomMatcher(userId, job);
        } else {
          matchResult = await matchCandidateToJob({
            userId,
            jobId: job.id,
            job: job as any,
          });
        }
      } catch (matchErr: any) {
        decisions.push({
          jobId: job.id,
          jobTitle,
          company,
          decision: 'SKIPPED',
          reason: `Match evaluation failed: ${matchErr.message}`,
          evaluatedAt: now,
        });
        continue;
      }

      // Check Hard Blockers from Match Engine
      if (matchResult.isBlocked) {
        const blockerReasons = matchResult.explanation?.blockers?.join('; ') || 'Hard requirements mismatch';
        decisions.push({
          jobId: job.id,
          jobTitle,
          company,
          decision: 'BLOCKED',
          reason: blockerReasons,
          matchScore: matchResult.score,
          blockers: matchResult.explanation?.blockers,
          confidence: matchResult.confidence,
          evaluatedAt: now,
        });
        continue;
      }

      // Match Score Threshold Check
      if (matchResult.score < policy.minMatchScore) {
        decisions.push({
          jobId: job.id,
          jobTitle,
          company,
          decision: 'SKIPPED',
          reason: `Match score ${matchResult.score}% is below candidate threshold of ${policy.minMatchScore}%.`,
          matchScore: matchResult.score,
          confidence: matchResult.confidence,
          evaluatedAt: now,
        });
        continue;
      }

      // Eligible Candidate Opportunity
      decisions.push({
        jobId: job.id,
        jobTitle,
        company,
        decision: 'ELIGIBLE',
        reason: `Meets all hard constraints. Match score ${matchResult.score}% (${matchResult.recommendation}).`,
        matchScore: matchResult.score,
        confidence: matchResult.confidence,
        evaluatedAt: now,
      });

      eligibleJobs.push({
        job,
        match: matchResult,
      });
    }

    // Rank Eligible Jobs: Sort by Match Score descending
    eligibleJobs.sort((a, b) => b.match.score - a.match.score);

    return {
      eligibleJobs,
      decisions,
      totalEvaluated: candidateJobs.length,
      totalEligible: eligibleJobs.length,
    };
  }
}
