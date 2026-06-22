export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import { Activity, Star, Calendar, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminResumeScoresPage() {
    const supabase = createAdminClient();

    // Fetch latest ATS score checks from resume_scores table (logged by admin-logger)
    const { data: scores } = await supabase
        .from('resume_scores')
        .select(`
            *,
            users ( email, full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    const totalChecks = scores?.length ?? 0;
    const avgScore = totalChecks > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? Math.round((scores as any[]).reduce((sum: number, s: any) => sum + (s.score ?? 0), 0) / totalChecks)
        : 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const highScores = (scores as any[] ?? []).filter((s: any) => (s.score ?? 0) >= 80).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                    ATS Score Checks
                </h1>
                <p className="text-[#8F8F8F] text-sm mt-1">
                    Track all ATS score checks performed by users
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-white border border-[#EBEBEB] rounded-2xl">
                    <div className="inline-flex p-3 rounded-xl bg-blue-50 mb-4">
                        <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#171717] mb-1">{totalChecks}</div>
                    <div className="text-sm text-[#8F8F8F]">Total ATS Checks</div>
                </div>
                <div className="p-6 bg-white border border-[#EBEBEB] rounded-2xl">
                    <div className="inline-flex p-3 rounded-xl bg-amber-50 mb-4">
                        <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#171717] mb-1">{avgScore}%</div>
                    <div className="text-sm text-[#8F8F8F]">Average Score</div>
                </div>
                <div className="p-6 bg-white border border-[#EBEBEB] rounded-2xl">
                    <div className="inline-flex p-3 rounded-xl bg-emerald-50 mb-4">
                        <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-bold text-[#171717] mb-1">{highScores}</div>
                    <div className="text-sm text-[#8F8F8F]">High Scores (≥80%)</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-[#EBEBEB] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#EBEBEB]">
                    <h2 className="font-semibold text-sm">Recent ATS Score Checks</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#EBEBEB] text-xs text-[#8F8F8F] uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 text-left font-bold">User</th>
                                <th className="px-6 py-3 text-center font-bold">ATS Score</th>
                                <th className="px-6 py-3 text-center font-bold">Keywords</th>
                                <th className="px-6 py-3 text-center font-bold">Skills</th>
                                <th className="px-6 py-3 text-left font-bold">Checked At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(scores as any[] ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#8F8F8F]">
                                        No ATS checks recorded yet. Events will appear here once users check their resume score.
                                    </td>
                                </tr>
                            )}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(scores as any[] ?? []).map((s: any) => {
                                const userObj = Array.isArray(s.users) ? s.users[0] : s.users;
                                const score = s.score ?? 0;
                                const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
                                const scoreBg = score >= 80 ? 'bg-emerald-50 border-emerald-500/20' : score >= 60 ? 'bg-amber-50 border-yellow-500/20' : 'bg-red-50 border-red-500/20';

                                return (
                                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-blue-300 shrink-0">
                                                    {(userObj?.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    {userObj?.full_name && (
                                                        <p className="text-[#171717] font-semibold text-xs">{userObj.full_name}</p>
                                                    )}
                                                    <p className="text-[#8F8F8F] text-[11px]">{userObj?.email || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${scoreBg} ${scoreColor}`}>
                                                <Star className="w-3 h-3" /> {score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-center text-[#8F8F8F] text-xs">
                                            {s.keyword_match ?? 0}%
                                        </td>
                                        <td className="px-6 py-3 text-center text-[#8F8F8F] text-xs">
                                            {s.skill_match ?? 0}%
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2 text-[#8F8F8F] text-xs">
                                                <Calendar className="w-3 h-3" />
                                                {s.created_at
                                                    ? formatDistanceToNow(new Date(s.created_at), { addSuffix: true })
                                                    : 'Unknown'
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
