'use client';

import React from 'react';
import Link from 'next/link';
import {
    MoreVertical,
    Edit2,
    Download,
    Trash2,
    Copy,
    ArrowRight,
    Target
} from '@/components/icons';
import { formatDistanceToNow } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/Button';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export type ResumeType = 'PRIMARY' | 'TAILORED' | 'DRAFT' | 'MASTER';

export interface ResumeCardProps {
    id: string;
    title: string;
    updatedAt: string;
    createdAt?: string;
    versionName?: string;
    atsScore?: number | null;
    isPrimary?: boolean;
    targetRole?: string;
    onDelete?: (id: string) => void;
    onTailor?: (id: string) => void;
}

export function determineResumeType(opts: {
    isPrimary?: boolean;
    title?: string;
    versionName?: string;
}): ResumeType {
    if (opts.isPrimary) return 'PRIMARY';
    if (opts.versionName || (opts.title && opts.title.toLowerCase().includes('tailor'))) {
        return 'TAILORED';
    }
    if (!opts.title || opts.title.toLowerCase().includes('untitled')) {
        return 'DRAFT';
    }
    return 'MASTER';
}

export function determineAtsStatus(score?: number | null): {
    label: string;
    dotColor: string;
    badgeStyle: string;
} {
    if (typeof score === 'number' && score >= 75) {
        return {
            label: 'ATS Ready',
            dotColor: 'bg-emerald-400',
            badgeStyle: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
        };
    }
    if (typeof score === 'number' && Number.isFinite(score) && score >= 0) {
        return {
            label: 'ATS Needs Review',
            dotColor: 'bg-[#9bb4c9]',
            badgeStyle: 'bg-transparent text-[#d7e4f0] border-[#2a2c33]',
        };
    }
    return {
        label: 'ATS Not Scanned',
        dotColor: 'bg-[#565656]',
        badgeStyle: 'bg-[#151515] text-[#A3A3A3] border-[#242424]',
    };
}

export function determineSupportingContext(opts: {
    isPrimary?: boolean;
    versionName?: string;
    targetRole?: string;
    type: ResumeType;
}): string {
    if (opts.isPrimary) return 'Master Resume';
    if (opts.versionName) return `Tailored for ${opts.versionName}`;
    if (opts.targetRole) return `Target: ${opts.targetRole}`;
    if (opts.type === 'DRAFT') return 'Draft · Incomplete';
    return 'General Application Profile';
}

export function ResumeCard({
    id,
    title,
    updatedAt,
    versionName,
    atsScore,
    isPrimary = false,
    targetRole,
    onDelete,
    onTailor,
}: ResumeCardProps) {
    const params = useParams();
    const locale = params?.locale || 'en';

    const resumeType = determineResumeType({ isPrimary, title, versionName });
    const atsStatus = determineAtsStatus(atsScore);
    const supportingContext = determineSupportingContext({
        isPrimary,
        versionName,
        targetRole,
        type: resumeType,
    });

    const handleClone = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const nickname = prompt('Enter a name for this version (e.g., Google Frontend):');
        if (!nickname) return;

        try {
            const res = await fetch(`/api/resumes/${id}/clone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version_name: nickname })
            });
            const data = await res.json();
            if (data.success) {
                window.location.reload();
            } else {
                alert('Protocol Failure: ' + data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div
            className={cn(
                "rounded-xl p-5 transition-all duration-200 flex flex-col justify-between h-full min-h-[250px] relative group cursor-default",
                isPrimary
                    ? "bg-[#0c0d10] border border-[#3a3d46] hover:border-[#9bb4c9]/40"
                    : "bg-[#0c0d10] border border-[#2a2c33] hover:border-[#3a3d46]"
            )}
        >
            {/* Top Section */}
            <div>
                {/* Header Row: Refined Icon + More Menu */}
                <div className="flex items-center justify-between">
                    <img src="/rail/rail-resume.png?v=ice" alt="" width={36} height={36} className="h-9 w-9 object-contain" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#151515] rounded-lg shrink-0 cursor-pointer"
                                aria-label="More options"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#151515] border border-[#242424] text-[#F5F5F5] shadow-2xl">
                            <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#1F1F1F] focus:bg-[#1F1F1F] text-[#F5F5F5]">
                                <Link href={`/${locale}/builder/${id}`} className="flex items-center gap-2">
                                    <Edit2 className="w-4 h-4 text-[#BDBDBD]" /> Edit in Studio
                                </Link>
                            </DropdownMenuItem>
                            {onTailor && (
                                <DropdownMenuItem
                                    onClick={() => onTailor(id)}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-[#1F1F1F] focus:bg-[#1F1F1F] text-[#F5F5F5]"
                                >
                                    <Target className="w-4 h-4 text-[#9bb4c9]" /> Tailor for Job
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={handleClone}
                                className="flex items-center gap-2 cursor-pointer hover:bg-[#1F1F1F] focus:bg-[#1F1F1F] text-[#F5F5F5]"
                            >
                                <Copy className="w-4 h-4 text-[#BDBDBD]" /> Clone as Version
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#1F1F1F] focus:bg-[#1F1F1F] text-[#F5F5F5]">
                                <Download className="w-4 h-4 text-[#BDBDBD]" /> Export PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#242424] my-1" />
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-rose-400 focus:text-rose-300 focus:bg-rose-950/40 hover:bg-rose-950/40 cursor-pointer"
                                onClick={() => onDelete?.(id)}
                            >
                                <Trash2 className="w-4 h-4" /> Decommission
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Title */}
                <h3
                    className={cn(
                        "font-sans !text-base font-semibold tracking-tight leading-snug line-clamp-1 mt-3.5 mb-2 transition-colors",
                        isPrimary ? "text-[#F5F5F5]" : "text-[#F5F5F5] group-hover:text-white"
                    )}
                    title={title || 'Untitled Resume'}
                >
                    {title || 'Untitled Resume'}
                </h3>

                {/* Status Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    {/* Resume Type Badge */}
                    {resumeType === 'PRIMARY' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono bg-[#151515] text-[#F5F5F5] border border-[#2D2D2D] shadow-2xs">
                            PRIMARY
                        </span>
                    )}
                    {resumeType === 'TAILORED' && (
                        <span className="rounded-full border border-[#2a2c33] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[#d7e4f0]">
                            TAILORED
                        </span>
                    )}
                    {resumeType === 'DRAFT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono bg-[#151515] text-[#A3A3A3] border border-[#242424]">
                            DRAFT
                        </span>
                    )}
                    {resumeType === 'MASTER' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono bg-[#151515] text-[#BDBDBD] border border-[#242424]">
                            MASTER
                        </span>
                    )}

                    {/* ATS Status Badge */}
                    <span
                        className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1",
                            atsStatus.badgeStyle
                        )}
                    >
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", atsStatus.dotColor)} />
                        <span>{atsStatus.label}</span>
                    </span>
                </div>

                {/* Supporting Context (role / master / draft info) */}
                <p className="text-xs text-[#BDBDBD] font-medium truncate mb-1">
                    {supportingContext}
                </p>

                {/* Metadata Row */}
                <div className="text-[11px] text-[#A3A3A3] flex items-center gap-1.5 font-normal">
                    <span>Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}</span>
                    {typeof atsScore === 'number' && atsScore > 0 && (
                        <>
                            <span className="text-[#565656]">·</span>
                            <span className="font-mono text-[#BDBDBD]">Score {atsScore}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Action Row / Footer */}
            <div className="mt-4 pt-3 border-t border-[#242424] flex items-center gap-2">
                <Link href={`/${locale}/builder/${id}`} className="flex-1">
                    <Button
                        className="w-full h-8 px-3 text-xs font-semibold bg-[#151515] hover:bg-[#1D1D1D] text-[#F5F5F5] border border-[#242424] rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3 opacity-70" />
                    </Button>
                </Link>
                <Link href={`/${locale}/builder/${id}`}>
                    <Button
                        variant="outline"
                        className="h-8 px-3 text-xs font-medium border-[#242424] hover:bg-[#151515] text-[#BDBDBD] hover:text-[#F5F5F5] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <Edit2 className="w-3 h-3 text-[#A3A3A3]" />
                        <span>Edit</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
