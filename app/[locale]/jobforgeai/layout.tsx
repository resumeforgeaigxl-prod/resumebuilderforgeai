import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'AI Interview Assistant | JobForgeAI',
    description: 'Chat with JobForgeAI — your AI career coach for interview prep, job search strategy, salary negotiation, and career guidance.',
    alternates: { canonical: 'https://resumeforgeai.in/jobforgeai' },
    openGraph: {
        title: 'JobForgeAI — AI Career Coach | ResumeForgeAI',
        description: 'Your always-available AI career assistant. Get instant interview coaching, salary advice, and job search strategies.',
        url: 'https://resumeforgeai.in/jobforgeai',
    },
};

export default function JobForgeAILayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
