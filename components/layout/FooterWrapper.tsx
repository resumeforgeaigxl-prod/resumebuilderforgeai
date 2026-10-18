'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const HIDDEN_SECTION_ROOTS: readonly string[] = [
    // Dashboard & workspace apps
    'applications',
    'dashboard',
    'account',
    'resumes',
    'resumeforge',
    'jobs',
    'dashboard-jobs',
    'omni',
    'mentorforge',
    'billing',
    'invoices',
    'interview-prep',
    'support',
    'project-services',
    'codingforge',
    'prepforge',
    'learnforge',
    'knowledgeforge',
    'explainforge',
    'jobforge',
    'jobforge-app',
    'jobforgeai',
    'careerforge',
    'interview-intelligence',
    'interviewforge',
    'mock-interview',
    'salaryforge',
    'studyforge',
    'tools',
    'ats-live',
    'portfolio',
    'portfolioforge',
    'recruiter',
    'roadmap',
    'job-alerts',
    'api-keys',
    'api-platform',
    'company-prep-interview',
    'company-prep',
    'complete-profile',
    'setup-username',
    'builder',
    'mock-test',
    'resume',
    'job',

    // Admin
    'admin',

    // Auth
    'login',
    'signup',
    'forgot-password',
    'reset-password',

    // Legal (has own FooterSection in LegalLayout)
    'privacy-policy',
    'terms-of-service',
    'cookie-policy',
    'data-deletion',
    'privacy',
    'terms',

    // Dedicated marketing layouts (has own FooterSection)
    'pricing',
];

function shouldHideFooter(pathname: string | null): boolean {
    if (!pathname) return true;

    // Check if landing page (e.g. "/" or "/en-in" or "/en-in/")
    // LandingPage renders its own FooterSection
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return true;

    // Check if single segment is a locale (e.g. "/en-in")
    const isLocaleOnly = segments.length === 1 && /^[a-z]{2}(-[a-z]{2})?$/i.test(segments[0]);
    if (isLocaleOnly) return true;

    // Get the route section (e.g. "applications" from "/en-in/applications")
    const isFirstLocale = /^[a-z]{2}(-[a-z]{2})?$/i.test(segments[0]);
    const section = isFirstLocale ? (segments[1] || '').toLowerCase() : segments[0].toLowerCase();

    if (!section || HIDDEN_SECTION_ROOTS.includes(section)) {
        return true;
    }

    // Substring fallback check
    const lower = pathname.toLowerCase();
    return HIDDEN_SECTION_ROOTS.some((root) => lower.includes(`/${root}`));
}

export default function FooterWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    if (shouldHideFooter(pathname)) {
        return null;
    }

    return <>{children}</>;
}
