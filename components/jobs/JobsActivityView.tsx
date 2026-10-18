'use client';

import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    Clock,
    Star,
    XCircle,
    Save,
    Loader2,
    Briefcase
} from '@/components/icons';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ActivityApplication {
    id: string;
    job_id: string;
    status: string;
    updated_at: string;
    job_title?: string;
    company?: string;
    jobs?: {
        company_name?: string;
        role_title?: string;
        company?: string;
        title?: string;
        location?: string;
    };
}

export function JobsActivityView() {
    const params = useParams();
    const locale = (params?.locale as string) || 'en-in';

    const [applications, setApplications] = useState<ActivityApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/jobs/tracking');
                const data = await res.json();
                if (data.success && data.applications) {
                    setApplications(data.applications);
                }
            } catch (err) {
                console.error('Error fetching activity:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, []);

    const countByStatus = {
        Saved: applications.filter(a => a.status === 'Saved').length,
        Applied: applications.filter(a => a.status === 'Applied').length,
        Interview: applications.filter(a => a.status === 'Interview').length,
        Offer: applications.filter(a => a.status === 'Offer').length,
        Rejected: applications.filter(a => a.status === 'Rejected').length,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Applied':
                return { text: 'Applied', bg: 'border-[#2a2c33] text-[#d7e4f0]' };
            case 'Interview':
                return { text: 'Interviewing', bg: 'border-[#2a2c33] text-[#d7e4f0]' };
            case 'Offer':
                return { text: 'Offered', bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' };
            case 'Rejected':
                return { text: 'Archived', bg: 'bg-rose-950/40 text-rose-400 border-rose-800/40' };
            case 'Saved':
            default:
                return { text: 'Saved', bg: 'bg-[#151515] text-[#BDBDBD] border-[#242424]' };
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-[#F5F5F5]">
            {/* Header with link to full Applications page */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h2 className="text-[28px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Activity</h2>
                    <p className="mt-2 text-sm text-[#8b909a]">What you saved and applied to.</p>
                </div>
                <Link href={`/${locale}/applications`} className="inline-flex h-9 items-center rounded-full bg-[#f4f5f7] px-4 text-xs font-medium text-[#0c0d10] hover:bg-white">
                    Open applications
                </Link>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-4 text-center">
                    <span className="block text-3xl leading-none text-[#d7e4f0]" style={{ fontFamily: 'var(--font-display)' }}>{countByStatus.Saved}</span>
                    <span className="mt-2 block text-xs text-[#8b909a]">Saved</span>
                </div>
                <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-4 text-center">
                    <span className="block text-3xl leading-none text-[#d7e4f0]" style={{ fontFamily: 'var(--font-display)' }}>{countByStatus.Applied}</span>
                    <span className="mt-2 block text-xs text-[#8b909a]">Applied</span>
                </div>
                <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-4 text-center">
                    <span className="block text-3xl leading-none text-[#d7e4f0]" style={{ fontFamily: 'var(--font-display)' }}>{countByStatus.Interview}</span>
                    <span className="mt-2 block text-xs text-[#8b909a]">Interviewing</span>
                </div>
                <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-4 text-center">
                    <span className="block text-3xl leading-none text-[#d7e4f0]" style={{ fontFamily: 'var(--font-display)' }}>{countByStatus.Offer}</span>
                    <span className="mt-2 block text-xs text-[#8b909a]">Offered</span>
                </div>
                <div className="col-span-2 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-4 text-center sm:col-span-1">
                    <span className="block text-3xl leading-none text-[#8b909a]" style={{ fontFamily: 'var(--font-display)' }}>{countByStatus.Rejected}</span>
                    <span className="mt-2 block text-xs text-[#8b909a]">Archived</span>
                </div>
            </div>

            {/* Activity Stream */}
            <div className="space-y-4 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                <div className="flex items-center justify-between border-b border-[#2a2c33] pb-3">
                    <h3 className="text-sm text-[#f4f5f7]">Recent</h3>
                    <span className="text-xs text-[#8b909a]">{applications.length}</span>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#9bb4c9]" />
                        <p className="mt-2 text-sm text-[#8b909a]">Loading activity</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="py-12 text-center">
                        <h4 className="text-2xl font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Nothing yet</h4>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8b909a]">
                            Saved roles and applications show up here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {applications.slice(0, 10).map((app) => {
                            const badge = getStatusBadge(app.status);
                            const title = app.job_title || app.jobs?.role_title || app.jobs?.title || 'Tracked Opportunity';
                            const company = app.company || app.jobs?.company_name || app.jobs?.company || 'Company';

                            return (
                                <div
                                    key={app.id}
                                    className="p-3.5 bg-[#151515] border border-[#242424] rounded-lg flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#101010] border border-[#242424] flex items-center justify-center font-bold text-xs text-[#F5F5F5]">
                                            {company[0] || 'J'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#F5F5F5]">
                                                {title} <span className="text-[#7E7E7E] font-normal">at {company}</span>
                                            </p>
                                            <p className="text-[10px] text-[#7E7E7E] font-mono">
                                                {formatDistanceToNow(new Date(app.updated_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>

                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}>
                                        {badge.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
