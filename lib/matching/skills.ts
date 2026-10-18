/**
 * ResumeForge — Skills Matching, Taxonomy Normalization & Evidence Strength
 * Distinguishes MATCHED vs UNDERREPRESENTED vs MISSING skills.
 */

import { MATCH_CONFIG } from './config';
import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';
import type { CanonicalJobRecord } from '@/lib/jobs/types';
import type {
  CandidateSkillItem,
  ParsedSkillRequirement,
  RequirementImportance,
  SkillEvidenceStrength,
} from './types';

// Normalized skill alias dictionary
const SKILL_ALIASES: Record<string, { key: string; name: string; category: string }> = {
  // Languages
  node: { key: 'node_js', name: 'Node.js', category: 'Programming Languages' },
  nodejs: { key: 'node_js', name: 'Node.js', category: 'Programming Languages' },
  'node.js': { key: 'node_js', name: 'Node.js', category: 'Programming Languages' },
  javascript: { key: 'javascript', name: 'JavaScript', category: 'Programming Languages' },
  js: { key: 'javascript', name: 'JavaScript', category: 'Programming Languages' },
  typescript: { key: 'typescript', name: 'TypeScript', category: 'Programming Languages' },
  ts: { key: 'typescript', name: 'TypeScript', category: 'Programming Languages' },
  python: { key: 'python', name: 'Python', category: 'Programming Languages' },
  py: { key: 'python', name: 'Python', category: 'Programming Languages' },
  python3: { key: 'python', name: 'Python', category: 'Programming Languages' },
  go: { key: 'go', name: 'Go (Golang)', category: 'Programming Languages' },
  golang: { key: 'go', name: 'Go (Golang)', category: 'Programming Languages' },
  java: { key: 'java', name: 'Java', category: 'Programming Languages' },
  cpp: { key: 'cpp', name: 'C++', category: 'Programming Languages' },
  'c++': { key: 'cpp', name: 'C++', category: 'Programming Languages' },
  csharp: { key: 'csharp', name: 'C#', category: 'Programming Languages' },
  'c#': { key: 'csharp', name: 'C#', category: 'Programming Languages' },
  rust: { key: 'rust', name: 'Rust', category: 'Programming Languages' },

  // Frameworks
  react: { key: 'react', name: 'React', category: 'Frameworks' },
  reactjs: { key: 'react', name: 'React', category: 'Frameworks' },
  'react.js': { key: 'react', name: 'React', category: 'Frameworks' },
  next: { key: 'next_js', name: 'Next.js', category: 'Frameworks' },
  nextjs: { key: 'next_js', name: 'Next.js', category: 'Frameworks' },
  'next.js': { key: 'next_js', name: 'Next.js', category: 'Frameworks' },
  vue: { key: 'vue_js', name: 'Vue.js', category: 'Frameworks' },
  vuejs: { key: 'vue_js', name: 'Vue.js', category: 'Frameworks' },
  angular: { key: 'angular', name: 'Angular', category: 'Frameworks' },
  express: { key: 'express_js', name: 'Express.js', category: 'Frameworks' },
  expressjs: { key: 'express_js', name: 'Express.js', category: 'Frameworks' },
  django: { key: 'django', name: 'Django', category: 'Frameworks' },
  fastapi: { key: 'fastapi', name: 'FastAPI', category: 'Frameworks' },
  spring: { key: 'spring_boot', name: 'Spring Boot', category: 'Frameworks' },
  'spring boot': { key: 'spring_boot', name: 'Spring Boot', category: 'Frameworks' },

  // Databases
  postgres: { key: 'postgresql', name: 'PostgreSQL', category: 'Databases' },
  postgresql: { key: 'postgresql', name: 'PostgreSQL', category: 'Databases' },
  psql: { key: 'postgresql', name: 'PostgreSQL', category: 'Databases' },
  mysql: { key: 'mysql', name: 'MySQL', category: 'Databases' },
  mongodb: { key: 'mongodb', name: 'MongoDB', category: 'Databases' },
  mongo: { key: 'mongodb', name: 'MongoDB', category: 'Databases' },
  redis: { key: 'redis', name: 'Redis', category: 'Databases' },
  dynamodb: { key: 'dynamodb', name: 'DynamoDB', category: 'Databases' },
  kafka: { key: 'kafka', name: 'Apache Kafka', category: 'Databases' },
  'apache kafka': { key: 'kafka', name: 'Apache Kafka', category: 'Databases' },
  elasticsearch: { key: 'elasticsearch', name: 'Elasticsearch', category: 'Databases' },

  // Cloud & DevOps
  aws: { key: 'aws', name: 'AWS', category: 'Cloud & Infrastructure' },
  'amazon web services': { key: 'aws', name: 'AWS', category: 'Cloud & Infrastructure' },
  gcp: { key: 'gcp', name: 'Google Cloud Platform', category: 'Cloud & Infrastructure' },
  'google cloud': { key: 'gcp', name: 'Google Cloud Platform', category: 'Cloud & Infrastructure' },
  azure: { key: 'azure', name: 'Microsoft Azure', category: 'Cloud & Infrastructure' },
  docker: { key: 'docker', name: 'Docker', category: 'DevOps & Tools' },
  k8s: { key: 'kubernetes', name: 'Kubernetes', category: 'DevOps & Tools' },
  kubernetes: { key: 'kubernetes', name: 'Kubernetes', category: 'DevOps & Tools' },
  terraform: { key: 'terraform', name: 'Terraform', category: 'DevOps & Tools' },
  ci_cd: { key: 'ci_cd', name: 'CI/CD Pipelines', category: 'DevOps & Tools' },
  'ci/cd': { key: 'ci_cd', name: 'CI/CD Pipelines', category: 'DevOps & Tools' },
  git: { key: 'git', name: 'Git', category: 'DevOps & Tools' },
  graphql: { key: 'graphql', name: 'GraphQL', category: 'Architecture & APIs' },
  rest: { key: 'rest_api', name: 'REST APIs', category: 'Architecture & APIs' },
  'rest api': { key: 'rest_api', name: 'REST APIs', category: 'Architecture & APIs' },
  microservices: { key: 'microservices', name: 'Microservices', category: 'Architecture & APIs' },
};

/**
 * Normalizes a raw skill string into a canonical key, display name, and category.
 */
export function normalizeSkill(rawSkill: string): { key: string; name: string; category: string } {
  const clean = rawSkill.trim().toLowerCase();
  if (SKILL_ALIASES[clean]) {
    return SKILL_ALIASES[clean];
  }

  // Fallback: sanitized key
  const sanitizedKey = clean.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const capitalized = rawSkill.trim().charAt(0).toUpperCase() + rawSkill.trim().slice(1);
  return {
    key: sanitizedKey || clean,
    name: capitalized,
    category: 'Other Technical',
  };
}

/**
 * Extracts candidate skills with evidence strength from application profile and resume.
 */
export function extractCandidateSkills(
  profileOrSkills: CandidateApplicationProfile | string[],
  resumeJson?: any
): Map<string, CandidateSkillItem> {
  const skillsMap = new Map<string, CandidateSkillItem>();

  const profileSkills: string[] = Array.isArray(profileOrSkills)
    ? profileOrSkills
    : [
        ...((profileOrSkills as CandidateApplicationProfile)?.career?.skills || []),
        ...((profileOrSkills as CandidateApplicationProfile)?.career?.primaryTechStack || []),
      ];

  // 1. Process profile skills (MEDIUM baseline)
  for (const s of profileSkills) {
    if (!s || typeof s !== 'string') continue;
    const norm = normalizeSkill(s);
    skillsMap.set(norm.key, {
      name: norm.name,
      normalizedKey: norm.key,
      category: norm.category,
      strength: 'MEDIUM',
      evidence: ['Profile tech stack declaration'],
    });
  }

  // 2. Process resume JSON if available
  if (resumeJson && typeof resumeJson === 'object') {
    // Work experience bullets (HIGH strength)
    const experienceList = Array.isArray(resumeJson.experience) ? resumeJson.experience : [];
    for (const exp of experienceList) {
      const expText = `${exp.role || ''} ${exp.company || ''} ${(exp.points || []).join(' ')}`.toLowerCase();
      for (const [alias, data] of Object.entries(SKILL_ALIASES)) {
        if (expText.includes(alias)) {
          const existing = skillsMap.get(data.key);
          const evidenceStr = `Used in work experience at ${exp.company || 'role'}`;
          if (existing) {
            existing.strength = 'HIGH';
            if (!existing.evidence.includes(evidenceStr)) existing.evidence.push(evidenceStr);
          } else {
            skillsMap.set(data.key, {
              name: data.name,
              normalizedKey: data.key,
              category: data.category,
              strength: 'HIGH',
              evidence: [evidenceStr],
            });
          }
        }
      }
    }

    // Projects (MEDIUM strength)
    const projectsList = Array.isArray(resumeJson.projects) ? resumeJson.projects : [];
    for (const proj of projectsList) {
      const projText = `${proj.name || ''} ${(proj.tech || []).join(' ')} ${(proj.description || []).join(' ')}`.toLowerCase();
      for (const [alias, data] of Object.entries(SKILL_ALIASES)) {
        if (projText.includes(alias)) {
          const existing = skillsMap.get(data.key);
          const evidenceStr = `Project: ${proj.name || 'Personal Project'}`;
          if (existing) {
            if (!existing.evidence.includes(evidenceStr)) existing.evidence.push(evidenceStr);
          } else {
            skillsMap.set(data.key, {
              name: data.name,
              normalizedKey: data.key,
              category: data.category,
              strength: 'MEDIUM',
              evidence: [evidenceStr],
            });
          }
        }
      }
    }

    // Skills section in resume
    const rSkills = resumeJson.skills;
    if (rSkills) {
      const resumeSkillTokens: string[] = [];
      if (Array.isArray(rSkills)) {
        resumeSkillTokens.push(...rSkills.map((x: any) => typeof x === 'string' ? x : x.name || ''));
      } else if (typeof rSkills === 'object') {
        Object.values(rSkills).forEach((arr: any) => {
          if (Array.isArray(arr)) resumeSkillTokens.push(...arr.map((x: any) => typeof x === 'string' ? x : ''));
        });
      }

      for (const token of resumeSkillTokens) {
        if (!token) continue;
        const norm = normalizeSkill(token);
        if (!skillsMap.has(norm.key)) {
          skillsMap.set(norm.key, {
            name: norm.name,
            normalizedKey: norm.key,
            category: norm.category,
            strength: 'MEDIUM',
            evidence: ['Resume skills section'],
          });
        }
      }
    }
  }

  return skillsMap;
}

/**
 * Parses job requirements and categorizes skills into MANDATORY, PREFERRED, and OPTIONAL.
 */
export function parseJobSkillRequirements(
  jobOrSkills: CanonicalJobRecord | string[],
  jobDescription?: string,
  jobRequirements?: string
): ParsedSkillRequirement[] {
  const reqs: ParsedSkillRequirement[] = [];
  const seenKeys = new Set<string>();

  let jobSkills: string[] = [];
  let desc = jobDescription;
  let reqsText = jobRequirements;

  if (Array.isArray(jobOrSkills)) {
    jobSkills = jobOrSkills;
  } else if (jobOrSkills && typeof jobOrSkills === 'object') {
    jobSkills = (jobOrSkills as CanonicalJobRecord).skills || [];
    desc = desc || (jobOrSkills as CanonicalJobRecord).description || undefined;
    reqsText = reqsText || (jobOrSkills as CanonicalJobRecord).requirements || undefined;
  }

  const textToScan = `${reqsText || ''} \n ${desc || ''}`.toLowerCase();

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

  // 1. Process explicit skills array from job ingestion
  for (const raw of jobSkills) {
    if (!raw) continue;
    const norm = normalizeSkill(raw);
    if (seenKeys.has(norm.key)) continue;
    seenKeys.add(norm.key);

    // Contextual importance check
    let importance: RequirementImportance = 'MANDATORY';
    const escapedKey = escapeRegExp(norm.key);
    const regexPreferred = new RegExp(`(?:preferred|nice to have|plus|bonus|optional)[^.\\n]*\\b${escapedKey}\\b`, 'i');
    if (regexPreferred.test(textToScan)) {
      importance = 'PREFERRED';
    }

    reqs.push({
      name: norm.name,
      normalizedKey: norm.key,
      category: norm.category,
      importance,
    });
  }

  // 2. Discover additional known skills in requirements text
  for (const [alias, data] of Object.entries(SKILL_ALIASES)) {
    if (alias.length < 3) continue; // avoid 2-char false positives in text scan
    if (seenKeys.has(data.key)) continue;

    const escapedAlias = escapeRegExp(alias);
    const aliasRegex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escapedAlias}(?:$|[^a-zA-Z0-9_])`, 'i');
    if (aliasRegex.test(textToScan)) {
      seenKeys.add(data.key);

      let importance: RequirementImportance = 'PREFERRED';
      const mandatoryRegex = new RegExp(`(?:required|must have|strong|proficient in|experience with|minimum)[^.\\n]*${escapedAlias}`, 'i');
      if (mandatoryRegex.test(textToScan)) {
        importance = 'MANDATORY';
      }

      reqs.push({
        name: data.name,
        normalizedKey: data.key,
        category: data.category,
        importance,
      });
    }
  }

  return reqs;
}

/**
 * Evaluates candidate skill fit against job requirements.
 * Returns score (0-100), matched list, underrepresented list, and missing list.
 */
export function evaluateSkillsFit(
  candidateSkillsMap: Map<string, CandidateSkillItem>,
  jobRequirements: ParsedSkillRequirement[],
  resumeJson?: any
) {
  if (jobRequirements.length === 0) {
    // If job specified zero skills, neutral baseline score
    return {
      score: 80,
      matched: [] as string[],
      underrepresented: [] as string[],
      missing: [] as string[],
      details: { mandatoryScore: 80, preferredScore: 80, optionalScore: 80 },
    };
  }

  const matched: string[] = [];
  const underrepresented: string[] = [];
  const missing: string[] = [];

  let mandatoryTotal = 0;
  let mandatoryEarned = 0;
  let preferredTotal = 0;
  let preferredEarned = 0;
  let optionalTotal = 0;
  let optionalEarned = 0;

  // Check which skills are mentioned in the active resume
  const resumeString = JSON.stringify(resumeJson || {}).toLowerCase();

  for (const req of jobRequirements) {
    const candidateSkill = candidateSkillsMap.get(req.normalizedKey);

    if (candidateSkill) {
      // Candidate possesses the skill!
      // Check if resume prominently mentions it:
      const inResume = resumeString.includes(req.normalizedKey) || resumeString.includes(req.name.toLowerCase());

      if (inResume && (candidateSkill.strength === 'HIGH' || candidateSkill.strength === 'MEDIUM')) {
        matched.push(req.name);
      } else {
        // Candidate has evidence in profile/projects, but resume doesn't emphasize it!
        // This is UNDERREPRESENTED (Tailoring Opportunity), NOT missing!
        underrepresented.push(req.name);
      }

      const weightFactor = candidateSkill.strength === 'HIGH' ? 1.0 : candidateSkill.strength === 'MEDIUM' ? 0.85 : 0.65;

      if (req.importance === 'MANDATORY') {
        mandatoryTotal++;
        mandatoryEarned += weightFactor;
      } else if (req.importance === 'PREFERRED') {
        preferredTotal++;
        preferredEarned += weightFactor;
      } else {
        optionalTotal++;
        optionalEarned += weightFactor;
      }
    } else {
      // Candidate genuinely does NOT have the skill
      missing.push(req.name);
      if (req.importance === 'MANDATORY') mandatoryTotal++;
      else if (req.importance === 'PREFERRED') preferredTotal++;
      else optionalTotal++;
    }
  }

  const mandScore = mandatoryTotal > 0 ? (mandatoryEarned / mandatoryTotal) * 100 : 100;
  const prefScore = preferredTotal > 0 ? (preferredEarned / preferredTotal) * 100 : 100;
  const optScore = optionalTotal > 0 ? (optionalEarned / optionalTotal) * 100 : 100;

  const finalScore = Math.round(
    mandScore * MATCH_CONFIG.skillsWeights.mandatory +
    prefScore * MATCH_CONFIG.skillsWeights.preferred +
    optScore * MATCH_CONFIG.skillsWeights.optional
  );

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    matched,
    underrepresented,
    missing,
    details: {
      mandatoryScore: Math.round(mandScore),
      preferredScore: Math.round(prefScore),
      optionalScore: Math.round(optScore),
    },
  };
}
