'use client'

import Link from 'next/link'
import { FileText, MoreVertical, Edit2, Download, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ResumeCardProps {
    id: string
    title: string
    updatedAt: string
    versionName?: string
    onDelete?: (id: string) => void
}

export function ResumeCard({ id, title, updatedAt, versionName, onDelete }: ResumeCardProps) {
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
                alert('Failed to clone: ' + data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg shadow-black/20">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                    <FileText className="w-6 h-6" />
                </div>

                <div className="relative inline-block text-left group/menu">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-slate-900 border border-slate-800 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 transition-all">
                        <div className="p-1 min-w-[170px]">
                            <Link
                                href={`/builder/${id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </Link>
                            <button
                                onClick={handleClone}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <FileText className="w-4 h-4 text-indigo-400" />
                                Clone as Version
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    // Trigger download 
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                            <div className="h-px bg-slate-800 my-1"></div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (onDelete) onDelete(id)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                    {title}
                </h3>
                {versionName && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">
                        {versionName}
                    </span>
                )}
                <p className="text-sm text-slate-500">
                    Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                </p>
            </div>

            <Link href={`/builder/${id}`} className="absolute inset-0 z-0">
                <span className="sr-only">View Resume</span>
            </Link>
        </div>
    )
}
