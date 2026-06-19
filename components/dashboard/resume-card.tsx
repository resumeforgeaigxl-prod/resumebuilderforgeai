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
import { useParams } from 'next/navigation'


interface ResumeCardProps {
    id: string
    title: string
    updatedAt: string
    versionName?: string
    onDelete?: (id: string) => void
}

export function ResumeCard({ id, title, updatedAt, versionName, onDelete }: ResumeCardProps) {
    const params = useParams();
    const locale = params?.locale || 'en';

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
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 group hover:shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)] hover:border-[#171717]/25 transition-all flex flex-col h-full relative cursor-default">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center text-[#171717] group-hover:border-[#171717] transition-all">
                    <FileText className="w-6 h-6" />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8F8F8F] hover:text-[#171717] hover:bg-[#171717]/5 rounded-md">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border border-[#EBEBEB] text-[#171717] shadow-xl">
                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#FAFAFA] focus:bg-[#FAFAFA] text-[#171717]">
                            <Link href={`/${locale}/builder/${id}`} className="flex items-center gap-2">
                                <Edit2 className="w-4 h-4 text-[#4D4D4D]" /> Edit Profile
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={handleClone} className="flex items-center gap-2 cursor-pointer hover:bg-[#FAFAFA] focus:bg-[#FAFAFA] text-[#171717]">
                            <Copy className="w-4 h-4 text-[#4D4D4D]" /> Clone as Version
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#FAFAFA] focus:bg-[#FAFAFA] text-[#171717]">
                            <Download className="w-4 h-4 text-[#4D4D4D]" /> Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#EBEBEB] my-1" />
                        <DropdownMenuItem 
                            className="flex items-center gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer hover:bg-rose-50"
                            onClick={() => onDelete?.(id)}
                        >
                            <Trash2 className="w-4 h-4" /> Decommission
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-3 flex-1">
                <h3 className="text-lg font-semibold text-[#171717] leading-tight line-clamp-2 group-hover:text-[#0070F3] transition-colors">
                    {title}
                </h3>
                
                <div className="flex flex-wrap gap-2 items-center">
                    {versionName && (
                        <span className="text-[10px] font-semibold border border-[#EBEBEB] bg-[#FAFAFA] text-[#4D4D4D] py-0.5 px-2 rounded-full">
                            {versionName}
                        </span>
                    )}
                    <span className="text-[10px] font-semibold border border-emerald-100 bg-emerald-50 text-emerald-600 py-0.5 px-2 rounded-full">
                        ATS READY
                    </span>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#EBEBEB] flex items-center justify-between">
                <div className="text-[11px] text-[#8F8F8F] font-mono">
                    Last sync: {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                </div>
                <Link href={`/${locale}/builder/${id}`}>
                    <Button variant="ghost" size="sm" className="h-7 px-0 text-xs font-semibold text-[#8F8F8F] hover:text-[#0070F3] hover:bg-transparent transition-colors">
                        Enter <Edit2 className="ml-1.5 w-3 h-3" />
                    </Button>
                </Link>

            </div>
        </div>
    );
}
