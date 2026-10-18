'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Loader2, ArrowRight } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateResumeButton } from '@/components/dashboard/create-resume-button';

interface EditResumeViewProps {
    initialResumeId?: string;
    locale: string;
    onSelectTab?: (tab: string) => void;
}

export function EditResumeView({ initialResumeId, locale, onSelectTab }: EditResumeViewProps) {
    const router = useRouter();
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>(initialResumeId || '');
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchResumes = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('resumes')
                .select('id, title, updated_at, version_name, resume_json, score')
                .order('updated_at', { ascending: false });
            if (data) {
                setResumes(data);
                if (!selectedResumeId && data.length > 0) {
                    setSelectedResumeId(initialResumeId || data[0].id);
                }
            }
            setLoading(false);
        };
        fetchResumes();
    }, [initialResumeId]);

    const activeResume = resumes.find(r => r.id === selectedResumeId) || resumes[0];
    const resumeData = activeResume?.resume_json || {};

    const expCount = resumeData.experience?.length || 0;
    const eduCount = resumeData.education?.length || 0;
    const projCount = resumeData.projects?.length || 0;
    const skillsCount = Array.isArray(resumeData.skills) ? resumeData.skills.length : 0;

    return (
        <div className="space-y-8 animate-fade-in text-[#F5F5F5]">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="flex items-end gap-3">
                    <img src="/rail/rail-resume.png?v=ice" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">Edit</p>
                        <h2 className="mt-1 text-[28px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Open the editor</h2>
                        <p className="mt-2 text-sm text-[#8b909a]">Change sections, bullets, and formatting.</p>
                    </div>
                </div>
                {activeResume && (
                    <Link href={`/${locale}/builder/${activeResume.id}`}>
                        <Button className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-[#f4f5f7] px-4 text-xs font-medium text-[#0c0d10] hover:bg-white">
                            Open editor <ExternalLink className="ml-0.5 h-3 w-3 opacity-60" />
                        </Button>
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#9bb4c9]" />
                    <p className="mt-2 text-xs text-[#8b909a]">Loading resumes</p>
                </div>
            ) : resumes.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-[#2a2c33] bg-[#0c0d10] px-8 py-16 text-center">
                    <img src="/rail/rail-resume.png?v=ice" alt="" width={56} height={56} className="h-14 w-14 object-contain" />
                    <h3 className="mt-4 text-3xl font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>No resume yet</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-[#8b909a]">Create one to open the editor.</p>
                    <div className="mt-6"><CreateResumeButton /></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Active Document Profile & Quick Launch */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Selector */}
                        <div className="p-6 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-sm text-[#f4f5f7]">
                                    <img src="/rail/rail-resume.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                                    Resume
                                </h3>
                                <span className="text-xs text-[#8b909a]">{resumes.length}</span>
                            </div>
                            <select
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                                className="h-11 w-full cursor-pointer rounded-xl border border-[#2a2c33] bg-[#121214] px-4 text-sm text-[#f4f5f7] focus:border-[#3a3d46] focus:outline-none"
                            >
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id} className="bg-[#151515] text-[#F5F5F5]">
                                        {r.title || 'Untitled Resume'} {r.version_name ? `[${r.version_name}]` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Active Overview Card */}
                        {activeResume && (
                            <div className="p-6 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] shadow-xs space-y-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>
                                                {activeResume.title || 'Untitled resume'}
                                            </h3>
                                            {activeResume.version_name && (
                                                <Badge variant="outline" className="border-[#242424] text-[#BDBDBD] text-[10px] bg-[#151515]">
                                                    {activeResume.version_name}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-[#8b909a]">
                                            Updated {formatDistanceToNow(new Date(activeResume.updated_at), { addSuffix: true })}
                                        </p>
                                    </div>

                                    {activeResume.score ? (
                                        <div className="text-right">
                                            <span className="block text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">Score</span>
                                            <span className="text-3xl text-[#d7e4f0]" style={{ fontFamily: 'var(--font-display)' }}>{activeResume.score}</span>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Section Matrix */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                    <div className="p-3 bg-[#151515] border border-[#242424] rounded-lg text-center">
                                        <span className="text-lg font-bold text-[#F5F5F5] block">{expCount}</span>
                                        <span className="text-xs text-[#8b909a]">Experience</span>
                                    </div>
                                    <div className="p-3 bg-[#151515] border border-[#242424] rounded-lg text-center">
                                        <span className="text-lg font-bold text-[#F5F5F5] block">{eduCount}</span>
                                        <span className="text-xs text-[#8b909a]">Education</span>
                                    </div>
                                    <div className="p-3 bg-[#151515] border border-[#242424] rounded-lg text-center">
                                        <span className="text-lg font-bold text-[#F5F5F5] block">{projCount}</span>
                                        <span className="text-xs text-[#8b909a]">Projects</span>
                                    </div>
                                    <div className="p-3 bg-[#151515] border border-[#242424] rounded-lg text-center">
                                        <span className="text-lg font-bold text-[#F5F5F5] block">{skillsCount}</span>
                                        <span className="text-xs text-[#8b909a]">Skills</span>
                                    </div>
                                </div>

                                {/* Primary Call to Action */}
                                <div className="pt-4 border-t border-[#242424] flex flex-col sm:flex-row gap-3 items-center justify-between">
                                    <p className="text-sm text-[#8b909a]">
                                        Sections, bullets, and formatting.
                                    </p>
                                    <Link href={`/${locale}/builder/${activeResume.id}`} className="w-full sm:w-auto">
                                        <Button className="h-9 w-full cursor-pointer rounded-full bg-[#f4f5f7] px-5 text-xs font-medium text-[#0c0d10] hover:bg-white sm:w-auto">
                                            Open editor <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Workflow Shortcuts */}
                    <div className="space-y-4">
                        <div className="space-y-3 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                            <h3 className="text-sm text-[#f4f5f7]">Also</h3>
                            <div className="space-y-1">
                                {[
                                    ['ats-analysis', 'Check the match'],
                                    ['tailor', 'Fit a job'],
                                    ['templates', 'Choose a layout'],
                                    ['versions', 'Saved copies'],
                                ].map(([tab, label]) => (
                                    <button
                                        key={tab}
                                        onClick={() => onSelectTab?.(tab)}
                                        className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-[#b4b8c2] hover:bg-[#16171b] hover:text-[#f4f5f7]"
                                    >
                                        <span>{label}</span>
                                        <ArrowRight className="h-3.5 w-3.5 text-[#8b909a]" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
