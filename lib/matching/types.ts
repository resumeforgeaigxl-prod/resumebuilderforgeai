/**
 * ResumeForge — Candidate ↔ Job Matching Engine Types
 */

import type { CanonicalJobRecord } from '@/lib/jobs/types';
import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';

export type MatchCategory =
  | 'EXCELLENT'
  | 'STRONG'
  | 'POSSIBLE'
  | 'WEAK'
  | 'LOW';

export type MatchRecommendation =
  | 'EXCELLENT_APPLY'
  | 'STRONG_APPLY'
  | 'APPLY_IF_INTERESTED'
  | 'LOW_PRIORITY'
  | 'SKIP'
  | 'BLOCKED';

export type MatchConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type SkillEvidenceStrength = 'HIGH' | 'MEDIUM' | 'LOW';

export type SkillMatchStatus = 'MATCHED' | 'UNDERREPRESENTED' | 'MISSING';

export type RequirementImportance = 'MANDATORY' | 'PREFERRED' | 'OPTIONAL';

export interface ParsedSkillRequirement {
  name: string;
  normalizedKey: string;
  category: string;
  importance: RequirementImportance;
  rawText?: string;
}

export interface CandidateSkillItem {
  name: string;
  normalizedKey: string;
  category: string;
  strength: SkillEvidenceStrength;
  evidence: string[];
}

export interface ComponentScores {
  skillsFit: number;       // 0-100
  experienceFit: number;   // 0-100
  roleFit: number;         // 0-100
  locationFit: number;     // 0-100
  employmentFit: number;   // 0-100
  salaryFit: number;       // 0-100
  educationFit: number;    // 0-100
  semanticFit: number;     // 0-100
}

export interface HardBlocker {
  code:
    | 'JOB_CLOSED'
    | 'EXCLUDED_COMPANY'
    | 'LOCATION_INCOMPATIBLE'
    | 'EMPLOYMENT_TYPE_INCOMPATIBLE'
    | 'SALARY_BELOW_MINIMUM'
    | 'WORK_AUTHORIZATION_INCOMPATIBLE'
    | 'EXPERIENCE_GAP_MASSIVE'
    | 'MANDATORY_DEGREE_MISSING'
    | 'OTHER';
  reason: string;
  evidence?: string;
}

export interface MatchEvidenceItem {
  requirement: string;
  candidateEvidence: string;
  jobEvidence: string;
  status: 'MATCHED' | 'UNDERREPRESENTED' | 'MISSING' | 'BLOCKED';
}

export interface MatchExplanation {
  summary: string;
  strongMatches: string[];
  partialMatches: string[];
  missingRequirements: string[];
  underrepresentedSkills: string[];
  unknowns: string[];
  blockers: string[];
}

export interface CandidateJobMatchResult {
  id?: string;
  userId: string;
  jobId: string;
  job?: CanonicalJobRecord;
  score: number;                   // 0-100
  category: MatchCategory;
  recommendation: MatchRecommendation;
  confidence: MatchConfidence;
  componentScores: ComponentScores;
  blockers: HardBlocker[];
  isBlocked: boolean;
  explanation: MatchExplanation;
  evidence: MatchEvidenceItem[];
  metadata: {
    candidateProfileVersion?: string;
    resumeVersion?: string;
    jobUpdatedAt?: string;
    matchAlgorithmVersion: string;
    evaluatedAt: string;
  };
}

export interface MatchCandidateOptions {
  userId: string;
  jobId: string;
  job?: CanonicalJobRecord;
  forceRecalculate?: boolean;
}

export interface RankJobsOptions {
  userId: string;
  jobIds?: string[];
  limit?: number;
  minScore?: number;
  excludeBlocked?: boolean;
}
