"use client";

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function FooterWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Hide main footer on all internal dashboard and app routes
    const isInternalApp = 
        pathname?.includes('/dashboard') || 
        pathname?.includes('/admin') || 
        pathname?.includes('/resumes') || 
        pathname?.includes('/codingforge') || 
        pathname?.includes('/projectforge') || 
        pathname?.includes('/mock-interview') || 
        pathname?.includes('/studyforge') || 
        pathname?.includes('/careerforge') || 
        pathname?.includes('/jobs') || 
        pathname?.includes('/jobforgeai') || 
        pathname?.includes('/tools') ||
        pathname?.includes('/billing') ||
        pathname?.includes('/account') ||
        pathname?.includes('/companies') ||
        pathname?.includes('/mock-test');

    if (isInternalApp) {
        return null;
    }

    return <>{children}</>;
}
