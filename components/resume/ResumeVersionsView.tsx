'use client';

import React, { useState, useEffect } from 'react';
import {
    RotateCcw,
    Loader2,
    CheckCircle2,
    ExternalLink
} from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Version {
    id: string;
    version_number: number;
    created_at: string;
}

interface ResumeVersionsViewProps {
    initialResumeId?: string;
    locale: string;
}

export function ResumeVersionsView({ initialResumeId, locale }: ResumeVersionsViewProps) {
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>(initialResumeId || '');
    const [versions, setVersions] = useState<Version[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isCloning, setIsCloning] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const fetchResumes = async () => {
            const { data } = await supabase
                .from('resumes')
                .select('id, title, updated_at, version_name')
                .order('updated_at', { ascending: false });
            if (data) {
                setResumes(data);
                if (!selectedResumeId && data.length > 0) {
                    setSelectedResumeId(initialResumeId || data[0].id);
                }
            }
        };
        fetchResumes();
    }, [initialResumeId]);

    const activeResume = resumes.find(r => r.id === selectedResumeId);

    const fetchVersions = async (id: string) => {
        if (!id) return;
        setLoadingVersions(true);
        try {
            const res = await fetch(`/api/resume/${id}/versions`);
            const data = await res.json();
            if (data.success) {
                setVersions(data.versions || []);
            }
        } catch (e) {
            console.error('Error fetching versions:', e);
        } finally {
            setLoadingVersions(false);
        }
    };

    useEffect(() => {
        if (selectedResumeId) {
            fetchVersions(selectedResumeId);
        }
    }, [selectedResumeId]);

    const handleRestore = async (versionId: string) => {
        if (!selectedResumeId) return;
        if (!confirm('Are you sure you want to restore this historical snapshot? Current changes will be overwritten.')) return;

        setRestoringId(versionId);
        setSuccessMsg(null);
        try {
            const res = await fetch(`/api/resume/${selectedResumeId}/versions/${versionId}`);
            const data = await res.json();
            if (data.success && data.version?.data) {
                // Save restored data back to resume
                const saveRes = await fetch(`/api/resume/${selectedResumeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData: data.version.data })
                });
                if (saveRes.ok) {
                    setSuccessMsg('Version snapshot restored successfully.');
                    fetchVersions(selectedResumeId);
                } else {
                    alert('Failed to save restored version data.');
                }
            } else {
                alert('Failed to load version snapshot.');
            }
        } catch (err) {
            console.error('Restore error:', err);
        } finally {
            setRestoringId(null);
        }
    };

    const handleCloneAsVersion = async () => {
        if (!selectedResumeId) return;
        const nickname = prompt('Enter a label for this branch/version (e.g., Google Frontend, Senior ML):');
        if (!nickname) return;

        setIsCloning(true);
        try {
            const res = await fetch(`/api/resumes/${selectedResumeId}/clone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version_name: nickname })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg(`Branch "${nickname}" created successfully.`);
                // Refresh resumes list
                const { data: updated } = await supabase
                    .from('resumes')
                    .select('id, title, updated_at, version_name')
                    .order('updated_at', { ascending: false });
                if (updated) setResumes(updated);
            } else {
                alert('Clone failed: ' + data.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCloning(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-[#F5F5F5]">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="flex items-end gap-3">
                    <img src="/rail/rail-resume.png?v=ice" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">Versions</p>
                        <h2 className="mt-1 text-[28px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Saved copies</h2>
                        <p className="mt-2 text-sm text-[#8b909a]">Go back to an earlier save, or make a copy for another role.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCloneAsVersion}
                        disabled={isCloning || !selectedResumeId}
                        className="h-9 cursor-pointer rounded-full bg-[#f4f5f7] px-4 text-xs font-medium text-[#0c0d10] hover:bg-white"
                    >
                        {isCloning ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-[#050505]" /> : null}
                        {isCloning ? 'Copying' : 'Make a copy'}
                    </Button>
                </div>
            </div>

            {successMsg && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Resume Selector */}
            <div className="space-y-3 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                <h3 className="flex items-center gap-2 text-sm text-[#f4f5f7]">
                    <img src="/rail/rail-resume.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                    Resume
                </h3>
                {resumes.length > 0 ? (
                    <select
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        className="h-11 w-full cursor-pointer rounded-xl border border-[#2a2c33] bg-[#121214] px-4 text-sm text-[#f4f5f7] focus:border-[#3a3d46] focus:outline-none"
                    >
                        {resumes.map(r => (
                            <option key={r.id} value={r.id} className="bg-[#121214]">
                                {r.title || 'Untitled resume'} {r.version_name ? `· ${r.version_name}` : ''}
                            </option>
                        ))}
                    </select>
                ) : (
                    <p className="text-sm text-[#8b909a]">No resumes yet.</p>
                )}
            </div>

            {/* Versions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Snapshot History Column (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm text-[#f4f5f7]">Saves · {versions.length}</h3>
                        <span className="text-xs text-[#8b909a]">Last 10</span>
                    </div>

                    {loadingVersions ? (
                        <div className="p-12 text-center rounded-2xl border border-[#2a2c33] bg-[#0c0d10]">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#9bb4c9]" />
                            <p className="mt-2 text-xs text-[#8b909a]">Loading saves</p>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl border border-[#2a2c33] bg-[#0c0d10]">
                            <img src="/rail/rail-resume.png?v=ice" alt="" width={40} height={40} className="mx-auto h-10 w-10 object-contain" />
                            <h4 className="mt-3 text-2xl font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>No saves yet</h4>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8b909a]">
                                A copy is kept each time you save this resume.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((v) => (
                                <div
                                    key={v.id}
                                    className="p-4 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] flex items-center justify-between hover:border-[#2D2D2D] hover:bg-[#131313] transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center font-mono font-bold text-xs text-[#d7e4f0]">
                                            v{v.version_number}
                                        </div>
                                        <div>
                                            <p className="text-sm text-[#f4f5f7]">
                                                Save {v.version_number}
                                            </p>
                                            <p className="text-xs text-[#8b909a]">
                                                {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleRestore(v.id)}
                                        disabled={restoringId === v.id}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-[#242424] bg-[#151515] hover:bg-[#1D1D1D] text-[#F5F5F5] cursor-pointer"
                                    >
                                        {restoringId === v.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                        ) : (
                                            <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#BDBDBD]" />
                                        )}
                                        Restore
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Named Branches Column (1 col) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm text-[#f4f5f7]">Copies</h3>
                    </div>

                    <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5 space-y-4">
                        <p className="text-sm leading-6 text-[#8b909a]">
                            Keep a separate copy for each role.
                        </p>

                        <div className="space-y-2 pt-2">
                            {resumes
                                .filter(r => r.version_name)
                                .map(r => (
                                    <div key={r.id} className="p-3 bg-[#151515] border border-[#242424] rounded-lg flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-semibold text-[#F5F5F5] block">
                                                {r.version_name}
                                            </span>
                                            <span className="text-[10px] text-[#7E7E7E]">
                                                {r.title}
                                            </span>
                                        </div>
                                        <Link href={`/${locale}/builder/${r.id}`}>
                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold text-[#d7e4f0] hover:text-white hover:bg-[#1F1F1F]">
                                                Open <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}

                            {resumes.filter(r => r.version_name).length === 0 && (
                                <p className="py-2 text-sm text-[#8b909a]">No named copies yet.</p>
                            )}
                        </div>

                        <Button
                            onClick={handleCloneAsVersion}
                            variant="outline"
                            className="w-full text-xs border-[#242424] bg-[#151515] hover:bg-[#1D1D1D] text-[#F5F5F5] mt-2 cursor-pointer"
                        >
                            Make a copy
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
