/**
 * ResumeForge — Central Billing, Plan, Top-Up & Credit Action Configuration
 * Single source of truth for all commercial pricing, credit quotas, and action costs.
 * Never hardcode or scatter prices through components and APIs.
 */

export type PlanId = 'STARTER' | 'SEARCH' | 'PRO' | 'AGENT' | 'AUTOPILOT';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  priceInr: number;
  credits: number;
  durationDays: number;
  description: string;
  entitlements: string[];
}

export interface TopUpPackDefinition {
  id: string;
  name: string;
  priceInr: number;
  credits: number;
  description: string;
}

export const BILLING_CONFIG = {
  currency: 'INR',
  lowCreditThreshold: 15,
  welcomeCredits: 15, // Configurable trial grant per verified new account

  // 1. Canonical Plan Catalogue
  plans: {
    STARTER: {
      id: 'STARTER',
      name: 'Starter',
      priceInr: 299,
      credits: 100,
      durationDays: 30,
      description: 'Core resume tools, ATS scanning, and job discovery matching.',
      entitlements: [
        'RESUME_BASE',
        'ATS_SCAN',
        'OMNI_BASIC',
        'JOBS_SEARCH',
        'MATCHING_BASE',
        'RESUME_TAILOR',
      ],
    },
    SEARCH: {
      id: 'SEARCH',
      name: 'Search',
      priceInr: 599,
      credits: 250,
      durationDays: 30,
      description: 'Everything in Starter plus agent-assisted application preparation.',
      entitlements: [
        'RESUME_BASE',
        'ATS_SCAN',
        'OMNI_BASIC',
        'JOBS_SEARCH',
        'MATCHING_BASE',
        'RESUME_TAILOR',
        'APPLICATION_PREPARATION',
      ],
    },
    PRO: {
      id: 'PRO',
      name: 'Pro',
      priceInr: 999,
      credits: 500,
      durationDays: 30,
      description: 'Everything in Search plus scheduled agent discovery & notifications.',
      entitlements: [
        'RESUME_BASE',
        'ATS_SCAN',
        'OMNI_BASIC',
        'JOBS_SEARCH',
        'MATCHING_BASE',
        'RESUME_TAILOR',
        'APPLICATION_PREPARATION',
        'SCHEDULED_AGENT',
      ],
    },
    AGENT: {
      id: 'AGENT',
      name: 'Agent',
      priceInr: 1499,
      credits: 850,
      durationDays: 30,
      description: 'Everything in Pro plus higher autonomy allowance for future agent tasks.',
      entitlements: [
        'RESUME_BASE',
        'ATS_SCAN',
        'OMNI_BASIC',
        'JOBS_SEARCH',
        'MATCHING_BASE',
        'RESUME_TAILOR',
        'APPLICATION_PREPARATION',
        'SCHEDULED_AGENT',
        'APPLICATION_AGENT',
      ],
    },
    AUTOPILOT: {
      id: 'AUTOPILOT',
      name: 'Autopilot',
      priceInr: 1999,
      credits: 1200,
      durationDays: 30,
      description: 'Everything in Agent plus full Autopilot execution entitlement.',
      entitlements: [
        'RESUME_BASE',
        'ATS_SCAN',
        'OMNI_BASIC',
        'JOBS_SEARCH',
        'MATCHING_BASE',
        'RESUME_TAILOR',
        'APPLICATION_PREPARATION',
        'SCHEDULED_AGENT',
        'APPLICATION_AGENT',
        'AUTOPILOT',
      ],
    },
  } as Record<PlanId, PlanDefinition>,

  // 2. Canonical Top-Up Packs Catalogue
  topUpPacks: {
    TOPUP_75: {
      id: 'TOPUP_75',
      name: '75 Credits Pack',
      priceInr: 199,
      credits: 75,
      description: 'Instant top-up of 75 action credits.',
    },
    TOPUP_175: {
      id: 'TOPUP_175',
      name: '175 Credits Pack',
      priceInr: 399,
      credits: 175,
      description: 'Instant top-up of 175 action credits.',
    },
    TOPUP_350: {
      id: 'TOPUP_350',
      name: '350 Credits Pack',
      priceInr: 699,
      credits: 350,
      description: 'Instant top-up of 350 action credits.',
    },
    TOPUP_550: {
      id: 'TOPUP_550',
      name: '550 Credits Pack',
      priceInr: 999,
      credits: 550,
      description: 'Instant top-up of 550 action credits.',
    },
  } as Record<string, TopUpPackDefinition>,

  // 3. Central Credit Action Costs Catalogue
  actionCosts: {
    JOB_MATCH_BASIC: 1,
    JOB_MATCH_DEEP: 2,
    ATS_ANALYSIS: 3,
    RESUME_BULLET_REWRITE: 1,
    RESUME_FULL_IMPROVEMENT: 5,
    RESUME_TAILOR_FOR_JOB: 6,
    COVER_LETTER: 3,
    INTERVIEW_PREP: 5,
    MOCK_INTERVIEW: 10,
    MOCK_INTERVIEW_EVALUATION: 5,
    LEARNING_PLAN: 5,
    PROJECT_BLUEPRINT: 8,
    SALARY_ANALYSIS: 4,
    APPLICATION_PREPARE: 4,
    // Note: APPLICATION_SUBMIT prepared for future auto-apply levels; must remain unused until browser execution exists
    APPLICATION_SUBMIT: 8,
  } as Record<string, number>,

  // 4. Free Platform Actions (Never credit-charged)
  freeActions: [
    'PUBLIC_JOB_VIEW',
    'JOB_SEARCH',
    'MANUAL_APPLY',
    'JOB_SAVE',
    'APPLICATION_TRACKING',
    'PROFILE_COMPLETION',
    'ACCOUNT_MANAGEMENT',
    'BACKGROUND_RANKING',
    'FRESHNESS_VERIFICATION',
    'INGESTION_CRAWL',
    'OMNI_CONVERSATION',
  ],

  // 5. Estimated Token Costs for Real COGS Accounting (in INR per 1,000 tokens)
  modelRates: {
    'gemini-3.8-flash': { inputCostPer1k: 0.008, outputCostPer1k: 0.032 },
    'gemini-flash-latest': { inputCostPer1k: 0.008, outputCostPer1k: 0.032 },
    'gemini-1.5-flash': { inputCostPer1k: 0.006, outputCostPer1k: 0.024 },
    'gemini-2.0-flash': { inputCostPer1k: 0.008, outputCostPer1k: 0.032 },
    'gemini-1.5-pro': { inputCostPer1k: 0.10, outputCostPer1k: 0.40 },
    'gpt-4o': { inputCostPer1k: 0.22, outputCostPer1k: 0.88 },
    'gpt-4o-mini': { inputCostPer1k: 0.015, outputCostPer1k: 0.06 },
    default: { inputCostPer1k: 0.01, outputCostPer1k: 0.03 },
  } as Record<string, { inputCostPer1k: number; outputCostPer1k: number }>,
} as const;

export type BillableAction = keyof typeof BILLING_CONFIG.actionCosts;

export function getPlanConfig(planId: string): PlanDefinition | undefined {
  return (BILLING_CONFIG.plans as Record<string, PlanDefinition>)[planId];
}

export function getTopUpConfig(packId: string): TopUpPackDefinition | undefined {
  return (BILLING_CONFIG.topUpPacks as Record<string, TopUpPackDefinition>)[packId];
}

export function getActionCost(actionKey: string): number {
  return BILLING_CONFIG.actionCosts[actionKey] ?? 0;
}

export function isActionFree(actionKey: string): boolean {
  return (BILLING_CONFIG.freeActions as readonly string[]).includes(actionKey);
}
