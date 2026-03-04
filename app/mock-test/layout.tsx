import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'AI Mock Interview Practice',
    description: 'Generate 50 role-specific interview questions from any job description. Practice AI mock tests for technical, aptitude, verbal, and behavioral rounds.',
    alternates: { canonical: 'https://resumeforgeai.in/mock-test' },
    openGraph: {
        title: 'AI Mock Interview Practice | ResumeForgeAI',
        description: 'Practice AI-powered mock interviews tailored to any job description.',
        url: 'https://resumeforgeai.in/mock-test',
    },
};

export default function MockTestLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
