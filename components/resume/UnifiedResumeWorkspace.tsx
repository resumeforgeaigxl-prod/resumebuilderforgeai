'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ContextualWorkspaceLayout,
    type ContextualNavItem
} from '@/components/layout/ContextualWorkspaceLayout';
import { MyResumeView } from './MyResumeView';
import { EditResumeView } from './EditResumeView';
import { AtsAnalysisView } from './AtsAnalysisView';
import { TailorJobView } from './TailorJobView';
import { TemplatesCatalogView } from './TemplatesCatalogView';
import { ResumeVersionsView } from './ResumeVersionsView';

export type ResumeTab = 'my-resume' | 'edit' | 'ats-analysis' | 'tailor' | 'templates' | 'versions';

interface ResumeListItem {
    id: string;
    title: string;
    updated_at: string;
    version_name?: string | null;
}

interface UnifiedResumeWorkspaceProps {
    resumes: ResumeListItem[];
    primaryResume: ResumeListItem | null;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    locale: string;
    initialTab?: string;
    error?: string | null;
}

const ice = '?v=ice';
const TAB_CONFIG: ContextualNavItem<ResumeTab>[] = [
    { id: 'my-resume', label: 'Resumes', iconSrc: `/rail/rail-resume.png${ice}` },
    { id: 'edit', label: 'Edit', iconSrc: `/rail/rail-resume.png${ice}` },
    { id: 'ats-analysis', label: 'Match', iconSrc: `/rail/rail-jobs.png${ice}` },
    { id: 'tailor', label: 'Tailor', iconSrc: `/rail/rail-jobs.png${ice}` },
    { id: 'templates', label: 'Layouts', iconSrc: `/rail/rail-resume.png${ice}` },
    { id: 'versions', label: 'Copies', iconSrc: `/rail/rail-apps.png${ice}` },
];

function normalizeTab(raw?: string | null): ResumeTab {
    if (!raw) return 'my-resume';
    const clean = raw.toLowerCase().trim();
    if (clean === 'edit') return 'edit';
    if (clean === 'ats' || clean === 'ats-analysis') return 'ats-analysis';
    if (clean === 'tailor' || clean === 'tailor-job' || clean === 'tailor-for-job') return 'tailor';
    if (clean === 'templates' || clean === 'template') return 'templates';
    if (clean === 'versions' || clean === 'version') return 'versions';
    return 'my-resume';
}

export function UnifiedResumeWorkspace({
    resumes,
    primaryResume,
    totalCount,
    currentPage,
    totalPages,
    locale,
    initialTab = 'my-resume',
    error
}: UnifiedResumeWorkspaceProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTabParam = searchParams?.get('tab') || initialTab;

    const [activeTab, setActiveTab] = useState<ResumeTab>(normalizeTab(currentTabParam));

    // Keep activeTab in sync with query parameter
    useEffect(() => {
        const tab = searchParams?.get('tab');
        setActiveTab(normalizeTab(tab));
    }, [searchParams]);

    const handleTabChange = useCallback((tabId: ResumeTab) => {
        setActiveTab(tabId);
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (tabId === 'my-resume') {
            params.delete('tab');
        } else {
            params.set('tab', tabId);
        }
        const query = params.toString();
        const newUrl = `/${locale}/resumes${query ? `?${query}` : ''}`;
        router.push(newUrl, { scroll: false });
    }, [locale, router, searchParams]);

    const primaryResumeId = primaryResume?.id;

    return (
        <ContextualWorkspaceLayout<ResumeTab>
            className="resume-workspace"
            title="Resumes"
            description="Write, check, and keep the versions you send."
            navItems={TAB_CONFIG}
            activeId={activeTab}
            onNavChange={handleTabChange}
            navLabel="Resume"
        >
            {activeTab === 'my-resume' && (
                <MyResumeView
                    resumes={resumes}
                    primaryResume={primaryResume}
                    totalCount={totalCount}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    locale={locale}
                    error={error}
                    onSelectTab={(tab) => handleTabChange(normalizeTab(tab))}
                />
            )}

            {activeTab === 'edit' && (
                <EditResumeView
                    initialResumeId={primaryResumeId}
                    locale={locale}
                    onSelectTab={(tab) => handleTabChange(normalizeTab(tab))}
                />
            )}

            {activeTab === 'ats-analysis' && (
                <AtsAnalysisView
                    initialResumeId={primaryResumeId}
                />
            )}

            {activeTab === 'tailor' && (
                <TailorJobView
                    initialResumeId={primaryResumeId}
                    locale={locale}
                />
            )}

            {activeTab === 'templates' && (
                <TemplatesCatalogView
                    activeResumeId={primaryResumeId}
                    locale={locale}
                />
            )}

            {activeTab === 'versions' && (
                <ResumeVersionsView
                    initialResumeId={primaryResumeId}
                    locale={locale}
                />
            )}
        </ContextualWorkspaceLayout>
    );
}
