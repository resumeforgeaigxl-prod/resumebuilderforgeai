'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { JobsDiscoverView } from './JobsDiscoverView';
import { JobsRecommendedView } from './JobsRecommendedView';
import { JobsSavedView } from './JobsSavedView';
import { JobsActivityView } from './JobsActivityView';
import { PaymentSuccessBanner } from '@/components/dashboard/payment-success-banner';

export type JobsTab = 'discover' | 'recommended' | 'saved' | 'activity';

const TAB_CONFIG: { id: JobsTab; label: string }[] = [
    { id: 'discover', label: 'Discover' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'saved', label: 'Saved' },
    { id: 'activity', label: 'Activity' },
];

export function UnifiedJobsWorkspace() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const locale = (params?.locale as string) || 'en-in';

    const currentTabParam = (searchParams?.get('tab') as JobsTab) || 'discover';

    const [activeTab, setActiveTab] = useState<JobsTab>(
        TAB_CONFIG.some(t => t.id === currentTabParam) ? currentTabParam : 'discover'
    );

    // Keep activeTab in sync with query parameter
    useEffect(() => {
        const tab = searchParams?.get('tab') as JobsTab;
        if (tab && TAB_CONFIG.some(t => t.id === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tabId: JobsTab) => {
        setActiveTab(tabId);
        const urlParams = new URLSearchParams(searchParams?.toString() || '');
        if (tabId === 'discover') {
            urlParams.delete('tab');
        } else {
            urlParams.set('tab', tabId);
        }
        const newUrl = `/${locale}/jobs${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
        router.push(newUrl, { scroll: false });
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-fade-in text-[#F5F5F5]">
            <PaymentSuccessBanner />

            {/* Top Jobs Header */}
            <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="flex items-end gap-4">
                    <img src="/rail/rail-jobs.png?v=ice" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b909a]">Career</p>
                        <h1 className="mt-2 !text-[40px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Jobs</h1>
                        <p className="mt-3 max-w-xl text-sm text-[#8b909a]">
                            Roles ranked for your profile.
                        </p>
                    </div>
                </div>
            </header>

            {/* Clean Sub-Navigation Tab Bar */}
            <nav className="flex items-center gap-1 overflow-x-auto">
                {TAB_CONFIG.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                                isActive
                                    ? 'bg-[#16171b] text-[#f4f5f7]'
                                    : 'text-[#8b909a] hover:text-[#f4f5f7]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            {/* Tab Panels */}
            <main>
                {activeTab === 'discover' && <JobsDiscoverView />}
                {activeTab === 'recommended' && <JobsRecommendedView />}
                {activeTab === 'saved' && <JobsSavedView />}
                {activeTab === 'activity' && <JobsActivityView />}
            </main>
        </div>
    );
}
