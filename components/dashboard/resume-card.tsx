'use client'

import Link from 'next/link'
import { FileText, MoreVertical, Edit2, Download, Trash2, Copy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/DropdownMenu'
import { Button } from '@/components/ui/Button'

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
                alert('Protocol Failure: ' + data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Card glass className="p-6 group hover:border-indigo-500/30 transition-all flex flex-col h-full relative cursor-default">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all shadow-lg">
                    <FileText className="w-6 h-6" />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[#0c0c1b] border-white/5">
                        <DropdownMenuItem asChild>
                            <Link href={`/builder/${id}`} className="flex items-center gap-2 cursor-pointer">
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleClone} className="flex items-center gap-2 cursor-pointer">
                            <Copy className="w-4 h-4" /> Clone as Version
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Download className="w-4 h-4" /> Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem 
                            className="flex items-center gap-2 text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer"
                            onClick={() => onDelete?.(id)}
                        >
                            <Trash2 className="w-4 h-4" /> Decommission
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-3 flex-1">
                <h3 className="text-lg font-black text-white leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {title}
                </h3>
                
                <div className="flex flex-wrap gap-2 items-center">
                    {versionName && (
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-white/5 bg-white/5 text-slate-500 py-0.5 px-1.5">
                            {versionName}
                        </Badge>
                    )}
                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-none py-0.5 px-1.5">
                        ATS READY
                    </Badge>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    Last sync: {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                </div>
                <Link href={`/builder/${id}`}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 hover:bg-transparent p-0">
                        Enter <Edit2 className="ml-1.5 w-3 h-3" />
                    </Button>
                </Link>
            </div>
        </Card>
    )
}
