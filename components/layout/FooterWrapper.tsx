"use client";

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function FooterWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = /^\/[a-z]{2}-[a-z]{2}\/?$/.test(pathname ?? '');

    // Hide main footer on all internal dashboard and app routes
    const isInternalApp = 
        pathname?.includes('/dashboard') || 
        pathname?.includes('/admin') || 
        pathname?.includes('/resumes') || 
        pathname?.includes('/resumeforge') || 
        pathname?.includes('/prepforge') || 
        pathname?.includes('/learnforge') || 
        pathname?.includes('/knowledgeforge') || 
        pathname?.includes('/explainforge') || 
        pathname?.includes('/mentorforge') || 
        pathname?.includes('/jobforge') || 
        pathname?.includes('/careerforge') || 
        pathname?.includes('/codingforge') || 
        pathname?.includes('/projectforge') || 
        pathname?.includes('/studyforge') || 
        pathname?.includes('/company-prep') || 
        pathname?.includes('/api-keys') || 
        pathname?.includes('/api-platform') || 
        pathname?.includes('/mock-interview') || 
        pathname?.includes('/interviewforge') || 
        pathname?.includes('/jobs') || 
        pathname?.includes('/jobforgeai') || 
        pathname?.includes('/tools') ||
        pathname?.includes('/billing') ||
        pathname?.includes('/account') ||
        pathname?.includes('/companies') ||
        pathname?.includes('/salaryforge') ||
        pathname?.includes('/networkforge') ||
        pathname?.includes('/ats-live') ||
        pathname?.includes('/builder') ||
        pathname?.includes('/mock-test');

    if (isInternalApp || isLandingPage) {
        return null;
    }

    return <>{children}</>;
}
