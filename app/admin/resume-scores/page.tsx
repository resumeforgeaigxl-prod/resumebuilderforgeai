import { createClient } from '@/lib/supabase/server';

import { Activity, Star, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminResumeScoresPage() {
    const supabase = createClient();

    // Fetch resume scores with associated resume and user data
    const { data: scores } = await supabase
        .from('resume_analysis')
        .select(`
            *,
            resumes(title, user_id),
            users!resume_analysis_user_id_fkey(email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-400" />
                Resume Scores
            </h1>
            <p className="text-slate-400">Track and monitor ATS score checks performed by users.</p>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl text-white">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold">Recent Score Checks</h2>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Resume Title</th>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3 text-center">Score</th>
                                    <th className="px-6 py-3">Keywords</th>
                                    <th className="px-6 py-3">Checked At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {scores?.map((s: any) => {
                                    const averageScore = Math.round(((s.keyword_score || 0) + (s.impact_score || 0) + (s.action_score || 0) + (s.readability_score || 0)) / 4);

                                    return (
                                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-6 py-4 font-medium text-white">
                                                {s.resumes?.title || 'Unknown Resume'}
                                            </td>
                                            <td className="px-6 py-4 text-blue-400">
                                                {/* Fallback to user_id if joining users table failed due to schema changes */}
                                                {s.users?.email || s.resumes?.user_id || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Star className={`w-4 h-4 ${averageScore >= 80 ? 'text-emerald-400' : averageScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`} />
                                                    <span className={`font-bold ${averageScore >= 80 ? 'text-emerald-400' : averageScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{averageScore}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">
                                                    {s.keyword_score || 0}% match
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-slate-500" />
                                                    {s.created_at ? formatDistanceToNow(new Date(s.created_at), { addSuffix: true }) : 'Unknown'}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) || (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center">No scores tracked yet.</td>
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
