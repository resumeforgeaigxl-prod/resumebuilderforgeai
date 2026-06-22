export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import { Download, Calendar, FileText, Shield, RefreshCw } from 'lucide-react';

interface DownloadLog {
    id: string;
    user_id: string;
    resume_name: string;
    template: string;
    watermarked: boolean;
    downloaded_at: string;
}

export default async function AdminDownloadsPage() {
    const supabase = createAdminClient();

    // Query from the new pdf_downloads table
    const { data: logs } = await supabase
        .from('pdf_downloads')
        .select('*')
        .order('downloaded_at', { ascending: false })
        .limit(100);

    const totalDownloads = logs?.length || 0;
    const watermarked = (logs || []).filter((l: DownloadLog) => l.watermarked).length;
    const paidDownloads = totalDownloads - watermarked;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Download className="w-6 h-6 text-emerald-600" />
                        PDF Downloads
                    </h1>
                    <p className="text-[#8F8F8F] text-sm mt-1">Track all resume PDF export events</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-white border border-[#EBEBEB] rounded-2xl">
                    <div className="inline-flex p-3 rounded-xl bg-emerald-50 mb-4">
                        <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#171717] mb-1">{totalDownloads}</div>
                    <div className="text-sm text-[#8F8F8F]">Total Downloads</div>
                </div>
                <div className="p-6 bg-white border border-[#EBEBEB] rounded-2xl">
                    <div className="inline-flex p-3 rounded-xl bg-blue-50 mb-4">
                        <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#171717] mb-1">{paidDownloads}</div>
                    <div className="text-sm text-[#8F8F8F]">Paid (No Watermark)</div>
                </div>
                <div className="p-6 bg-white border border-[#EBEBEB] rounded-2xl">
                    <div className="inline-flex p-3 rounded-xl bg-amber-50 mb-4">
                        <RefreshCw className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#171717] mb-1">{watermarked}</div>
                    <div className="text-sm text-[#8F8F8F]">Watermarked (Free)</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-[#EBEBEB] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#EBEBEB]">
                    <h2 className="font-semibold text-sm">Recent Download Activity</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#EBEBEB] text-xs text-[#8F8F8F] uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 text-left font-bold">User ID</th>
                                <th className="px-6 py-3 text-left font-bold">Resume Name</th>
                                <th className="px-6 py-3 text-left font-bold">Template</th>
                                <th className="px-6 py-3 text-left font-bold">Watermarked</th>
                                <th className="px-6 py-3 text-left font-bold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {logs?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#8F8F8F]">
                                        No download events yet. Events will appear here once users download PDFs.
                                    </td>
                                </tr>
                            )}
                            {(logs as DownloadLog[] || []).map(l => (
                                <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3 font-mono text-xs text-[#8F8F8F]">{l.user_id?.slice(0, 8)}…</td>
                                    <td className="px-6 py-3 text-[#171717] font-medium">{l.resume_name || 'Untitled'}</td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-500/20 text-indigo-600 rounded-md text-[11px] font-bold uppercase">
                                            {l.template || 'unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        {l.watermarked
                                            ? <span className="text-amber-600 text-[11px] font-bold">FREE</span>
                                            : <span className="text-emerald-600 text-[11px] font-bold">PAID</span>
                                        }
                                    </td>
                                    <td className="px-6 py-3 text-[#8F8F8F] text-xs flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(l.downloaded_at).toLocaleString('en-IN', {
                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
