/**
 * ResumeForge — Centralized Match Engine Configuration
 * Single source of truth for component weights, score thresholds, recommendation criteria,
 * and role family taxonomies.
 */

export const MATCH_CONFIG = {
  version: 'v1',

  // 1. Component Weights (must sum to 1.0)
  weights: {
    skillsFit: 0.35,        // 35% Skills alignment (mandatory/preferred)
    experienceFit: 0.20,    // 20% Relevant experience vs minimum/maximum
    roleFit: 0.15,          // 15% Role family and title similarity
    locationFit: 0.10,      // 10% Workplace/remote/location preferences
    employmentFit: 0.05,    // 5% Full-time / contract / internship
    salaryFit: 0.05,        // 5% Compensation alignment
    educationFit: 0.05,     // 5% Degree & certifications
    semanticFit: 0.05,      // 5% Responsibilities / domain nuance
  },

  // 2. Sub-weights within Skills Fit
  skillsWeights: {
    mandatory: 0.70,        // 70% of skill score
    preferred: 0.25,        // 25% of skill score
    optional: 0.05,         // 5% of skill score
  },

  // 3. Score Category Ranges (0–100)
  thresholds: {
    excellent: 90,          // 90-100: EXCELLENT
    strong: 80,             // 80-89: STRONG
    possible: 70,           // 70-79: POSSIBLE
    weak: 60,               // 60-69: WEAK
    // < 60: LOW
  },

  // 4. Recommendation Decision Thresholds
  recommendationThresholds: {
    excellentApply: 90,     // EXCELLENT_APPLY (if confidence >= MEDIUM)
    strongApply: 80,        // STRONG_APPLY
    applyIfInterested: 70,  // APPLY_IF_INTERESTED
    lowPriority: 60,        // LOW_PRIORITY
    // < 60: SKIP
  },

  // 5. Broad Role Families for Cross-Title Categorization
  roleFamilies: {
    backend: [
      'backend', 'api', 'server', 'distributed systems', 'node', 'golang', 'java', 'python backend', 'database'
    ],
    frontend: [
      'frontend', 'ui', 'ux engineer', 'react', 'vue', 'angular', 'web developer', 'css', 'javascript engineer'
    ],
    fullstack: [
      'full stack', 'fullstack', 'software engineer', 'software developer', 'sde', 'web application'
    ],
    mobile: [
      'mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'
    ],
    devops_sre: [
      'devops', 'sre', 'site reliability', 'infrastructure', 'platform engineer', 'cloud engineer', 'kubernetes', 'terraform'
    ],
    data_engineering: [
      'data engineer', 'etl', 'data pipeline', 'spark', 'hadoop', 'snowflake', 'databricks', 'dbt'
    ],
    data_science_ai: [
      'data scientist', 'machine learning', 'ml engineer', 'ai engineer', 'nlp', 'computer vision', 'deep learning', 'genai', 'llm'
    ],
    qa_testing: [
      'qa', 'quality assurance', 'test automation', 'sdet', 'software test engineer'
    ],
    product_management: [
      'product manager', 'technical product manager', 'product owner', 'apm', 'group product manager'
    ],
    design: [
      'product designer', 'ui designer', 'ux designer', 'visual designer'
    ],
    cybersecurity: [
      'security', 'cybersecurity', 'infosec', 'appsec', 'penetration tester', 'soc analyst'
    ],
  } as Record<string, string[]>,

  // 6. Hard Blocker Rules Configuration
  blockerRules: {
    maxExperienceGapYears: 5, // Job requires 5+ more years than candidate has
    relocationRequiredWhenOnsite: true,
  },

  // 7. Batch Processing Limits
  batchLimits: {
    maxBatchSize: 100,       // Max candidates/jobs to score in one run
    stage1CandidateLimit: 50, // Top candidates passed from Stage 1 to Stage 2
  },
} as const;

export type MatchConfig = typeof MATCH_CONFIG;
