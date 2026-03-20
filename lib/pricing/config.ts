import { AITask } from '../ai/types';

export type PlanID = 'free' | 'daily' | 'weekly' | 'monthly' | 'pro';

export interface PlanConfig {
    id: PlanID;
    name: string;
    price: number;
    creditsPerDay: number;
    features: {
        forges: Record<AITask, 'locked' | 'basic' | 'full' | 'view-only'>;
        jobLimit?: number;
        portfolioLimit?: number;
        isPriorityRouting?: boolean;
        hasSkillGapDetection?: boolean;
        hasKnowledgeRunner?: boolean;
    };
}

export const PLANS: Record<PlanID, PlanConfig> = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        creditsPerDay: 150,
        features: {
            forges: {
                resume: 'basic',
                career: 'basic',
                learn: 'view-only',
                knowledge: 'view-only',
                job: 'basic',
                code: 'locked',
                interview: 'locked',
                project: 'locked',
                explain: 'locked',
                mentor: 'locked',
                'company-prep': 'locked',
                portfolio: 'locked',
                roadmap: 'basic',
                study: 'locked',
            },
            jobLimit: 5,
        },
    },
    daily: {
        id: 'daily',
        name: 'Daily',
        price: 29,
        creditsPerDay: 300,
        features: {
            forges: {
                resume: 'full',
                code: 'basic',
                interview: 'basic',
                explain: 'basic',
                job: 'basic',
                learn: 'basic',
                'company-prep': 'basic',
                career: 'basic',
                project: 'locked',
                knowledge: 'locked',
                mentor: 'locked',
                portfolio: 'locked',
                roadmap: 'basic',
                study: 'basic',
            },
        },
    },
    weekly: {
        id: 'weekly',
        name: 'Weekly',
        price: 79,
        creditsPerDay: 800,
        features: {
            forges: {
                resume: 'full',
                code: 'full',
                explain: 'full',
                interview: 'full',
                learn: 'full',
                portfolio: 'basic',
                career: 'full',
                job: 'basic',
                project: 'locked',
                knowledge: 'locked',
                mentor: 'locked',
                'company-prep': 'locked',
                roadmap: 'full',
                study: 'full',
            },
            portfolioLimit: 1,
        },
    },
    monthly: {
        id: 'monthly',
        name: 'Monthly',
        price: 199,
        creditsPerDay: 2000,
        features: {
            forges: {
                resume: 'full',
                code: 'full',
                explain: 'full',
                interview: 'full',
                learn: 'full',
                portfolio: 'full',
                career: 'full',
                job: 'full',
                project: 'full',
                knowledge: 'full',
                'company-prep': 'full',
                mentor: 'locked',
                roadmap: 'full',
                study: 'full',
            },
            portfolioLimit: 999,
        },
    },
    pro: {
        id: 'pro',
        name: 'Professional',
        price: 499,
        creditsPerDay: 5000,
        features: {
            forges: {
                resume: 'full',
                code: 'full',
                explain: 'full',
                interview: 'full',
                learn: 'full',
                portfolio: 'full',
                career: 'full',
                job: 'full',
                project: 'full',
                knowledge: 'full',
                'company-prep': 'full',
                mentor: 'full',
                roadmap: 'full',
                study: 'full',
            },
            isPriorityRouting: true,
            hasSkillGapDetection: true,
            hasKnowledgeRunner: true,
        },
    },
};

export const CREDIT_COSTS: Record<AITask, number> = {
    resume: 10,
    code: 15,
    interview: 20,
    explain: 5,
    mentor: 50,
    project: 30,
    career: 10,
    learn: 5,
    knowledge: 20,
    job: 5,
    'company-prep': 15,
    portfolio: 25,
    roadmap: 10,
    study: 10,
};
