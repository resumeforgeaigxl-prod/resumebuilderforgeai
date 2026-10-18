/**
 * ResumeForge — Semantic & Responsibilities Alignment Module
 * Evaluates nuance between candidate background (summary, projects, achievements)
 * and job description responsibilities without incurring LLM token costs.
 */

import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';
import type { CanonicalJobRecord } from '@/lib/jobs/types';

const DOMAIN_TERMS = [
  'microservices', 'distributed systems', 'high availability', 'scalability',
  'ci/cd', 'devops', 'event driven', 'rest api', 'graphql', 'system design',
  'cloud native', 'agile', 'scrum', 'data modeling', 'security', 'compliance',
  'fintech', 'ecommerce', 'saas', 'b2b', 'ai', 'machine learning', 'real time',
  'concurrency', 'multithreading', 'performance optimization', 'testing',
  'unit tests', 'integration tests', 'cross functional', 'leadership', 'mentorship'
];

export interface SemanticFitResult {
  score: number;
  sharedKeywords: string[];
  domainNote: string;
}

export function evaluateSemanticFit(
  profile: CandidateApplicationProfile,
  job: CanonicalJobRecord,
  resumeJson?: any
): SemanticFitResult {
  // Candidate corpus
  const candidateSummary = profile.career?.professionalSummary || '';
  const candidateProjects = JSON.stringify(profile.career?.projects || []);
  const resumeText = JSON.stringify(resumeJson || '');
  const candidateCorpus = `${candidateSummary} ${candidateProjects} ${resumeText}`.toLowerCase();

  // Job corpus
  const jobCorpus = `${job.description || ''} ${job.requirements || ''}`.toLowerCase();

  if (!job.description && !job.requirements) {
    return {
      score: 80,
      sharedKeywords: [],
      domainNote: 'Job responsibilities unspecified (neutral evaluation)',
    };
  }

  const sharedKeywords: string[] = [];

  for (const term of DOMAIN_TERMS) {
    if (jobCorpus.includes(term) && candidateCorpus.includes(term)) {
      sharedKeywords.push(term);
    }
  }

  // Count job domain terms present
  const jobDomainTerms = DOMAIN_TERMS.filter(t => jobCorpus.includes(t));
  const expectedTerms = Math.min(6, Math.max(2, jobDomainTerms.length));

  const ratio = sharedKeywords.length / expectedTerms;
  const rawScore = Math.min(100, Math.round(50 + ratio * 50));

  let domainNote = '';
  if (sharedKeywords.length >= 4) {
    domainNote = `Strong architectural & domain overlap (${sharedKeywords.slice(0, 4).join(', ')})`;
  } else if (sharedKeywords.length >= 1) {
    domainNote = `Shared engineering methodologies (${sharedKeywords.join(', ')})`;
  } else {
    domainNote = 'General engineering responsibilities alignment';
  }

  return {
    score: Math.max(50, Math.min(100, rawScore)),
    sharedKeywords,
    domainNote,
  };
}
