import { createClient } from '@/lib/supabase/server';
import { Download, Calendar, User, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDownloadsPage() {
    const supabase = createClient();

    // Fetch download logs
    const { data: logs } = await supabase
        .from('usage_logs')
        .select(`
            *,
            users(email)
        `)
        .eq('action', 'download_pdf')
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-3">
                        <Download className="w-8 h-8 text-emerald-400" />
                        PDF Downloads
                    </h1>
                    <p className="text-slate-400 mt-1">Monitor how many resumes are being exported or parsed.</p>
                </div>
                <div className="bg-slate-900/50 px-6 py-4 rounded-xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Exports (Last 100)</p>
                        <p className="text-2xl font-bold text-white">{logs?.length || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl text-white">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold">Recent Expor Activity</h2>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">User Email</th>
                                    <th className="px-6 py-3">IP Address</th>
                                    <th className="px-6 py-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {logs?.map((l: any) => (
                                    <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-6 py-4 font-medium text-emerald-400 flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-500" />
                                            {l.users?.email || 'Unknown User'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {l.ip_address || '---.---.---.---'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-slate-500" />
                                                {l.created_at ? formatDistanceToNow(new Date(l.created_at), { addSuffix: true }) : 'Unknown'}
                                            </div>
                                        </td>
                                    </tr>
                                )) || (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center">No download activity found.</td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
