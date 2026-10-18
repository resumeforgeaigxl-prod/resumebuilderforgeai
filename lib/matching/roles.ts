/**
 * ResumeForge — Role Family Taxonomy & Role Title Similarity
 * Compares candidate target roles and experience against canonical job titles.
 */

import { MATCH_CONFIG } from './config';

/**
 * Determines which role family a job title or role name belongs to.
 */
export function identifyRoleFamily(title: string | null | undefined): string {
  if (!title) return 'general';
  const clean = title.toLowerCase();

  for (const [family, keywords] of Object.entries(MATCH_CONFIG.roleFamilies)) {
    for (const kw of keywords) {
      if (clean.includes(kw)) {
        return family;
      }
    }
  }

  return 'general';
}

// Adjacent role family compatibility matrix (0.0 to 1.0)
const FAMILY_AFFINITY: Record<string, Record<string, number>> = {
  backend: {
    fullstack: 0.85,
    devops_sre: 0.70,
    data_engineering: 0.75,
    general: 0.75,
  },
  frontend: {
    fullstack: 0.85,
    mobile: 0.70,
    design: 0.65,
    general: 0.75,
  },
  fullstack: {
    backend: 0.90,
    frontend: 0.90,
    mobile: 0.75,
    devops_sre: 0.70,
    general: 0.80,
  },
  mobile: {
    frontend: 0.70,
    fullstack: 0.75,
    general: 0.65,
  },
  devops_sre: {
    backend: 0.70,
    cybersecurity: 0.75,
    data_engineering: 0.65,
    general: 0.70,
  },
  data_engineering: {
    backend: 0.75,
    data_science_ai: 0.80,
    general: 0.70,
  },
  data_science_ai: {
    data_engineering: 0.80,
    backend: 0.65,
    general: 0.70,
  },
};

/**
 * Evaluates role similarity between candidate profile and canonical job.
 */
export function evaluateRoleFit(
  candidateTargetRoles: string[],
  candidateCurrentRole?: string,
  jobTitle?: string,
  jobNormalizedTitle?: string
): {
  score: number;
  candidateFamily: string;
  jobFamily: string;
  affinityNote: string;
} {
  const targetTitle = jobNormalizedTitle || jobTitle || '';
  const jobFamily = identifyRoleFamily(targetTitle);

  // Collect candidate candidate role signals
  const candidateRoles = [
    ...(candidateTargetRoles || []),
    ...(candidateCurrentRole ? [candidateCurrentRole] : []),
  ].filter(Boolean);

  if (candidateRoles.length === 0) {
    // If candidate has no target roles specified, baseline neutral score
    return {
      score: 75,
      candidateFamily: 'general',
      jobFamily,
      affinityNote: 'No target role specified, evaluated against technical baseline',
    };
  }

  let bestAffinity = 0;
  let bestCandidateFamily = 'general';

  for (const cRole of candidateRoles) {
    const cFamily = identifyRoleFamily(cRole);

    // Exact role family match
    if (cFamily === jobFamily && jobFamily !== 'general') {
      bestAffinity = 1.0;
      bestCandidateFamily = cFamily;
      break;
    }

    // Check token overlap
    const cTokens = cRole.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const jTokens = targetTitle.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const commonTokens = cTokens.filter(t => jTokens.includes(t));
    if (commonTokens.length > 0) {
      const tokenScore = Math.min(1.0, commonTokens.length * 0.4 + 0.4);
      if (tokenScore > bestAffinity) {
        bestAffinity = tokenScore;
        bestCandidateFamily = cFamily;
      }
    }

    // Check cross-family affinity matrix
    const affinity = FAMILY_AFFINITY[cFamily]?.[jobFamily] || FAMILY_AFFINITY[jobFamily]?.[cFamily] || 0.35;
    if (affinity > bestAffinity) {
      bestAffinity = affinity;
      bestCandidateFamily = cFamily;
    }
  }

  const score = Math.round(Math.min(100, Math.max(25, bestAffinity * 100)));

  return {
    score,
    candidateFamily: bestCandidateFamily,
    jobFamily,
    affinityNote:
      bestAffinity >= 0.9
        ? `Direct alignment with ${jobFamily} role family`
        : bestAffinity >= 0.7
        ? `Adjacent alignment between ${bestCandidateFamily} and ${jobFamily}`
        : `Role family difference (${bestCandidateFamily} vs ${jobFamily})`,
  };
}
