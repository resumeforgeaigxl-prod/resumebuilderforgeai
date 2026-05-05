export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Users, FileText, Activity, CreditCard, ShieldCheck, Zap, Clock, ArrowRight, MessageSquare, Briefcase } from 'lucide-react';
import { startOfDay, endOfDay } from 'date-fns';
import LiveAIMonitor, { type AIUsageLog } from './LiveAIMonitor';

export default async function AdminDashboard({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const supabase = createAdminClient();
  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();

  const [
    profilesRes,
    resumesRes,
    logsRes,
    subsRes,
    usageRes,
    roadmapsRes,
    recentUsageRes,
    chatSessionsRes,
    resumeAnalysisRes,
    jobAppsRes,
    jobStatsRes
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }),
    supabase.from('resumes').select('id', { count: 'exact' }),
    supabase.from('admin_logs').select('id', { count: 'exact' }),
    supabase.from('subscriptions').select('plan', { count: 'exact' }).eq('status', 'active'),
    supabase.from('ai_usage_logs').select('id', { count: 'exact' }).gte('created_at', todayStart).lte('created_at', todayEnd),
    supabase.from('roadmaps').select('id', { count: 'exact' }),
    supabase.from('ai_usage_logs').select('*, users(email)').order('created_at', { ascending: false }).limit(5),
    supabase.from('chat_sessions').select('id', { count: 'exact' }).gte('started_at', todayStart).lte('started_at', todayEnd),
    supabase.from('resume_analysis').select('id', { count: 'exact' }),
    supabase.from('job_applications').select('id', { count: 'exact' }),
    supabase.from('admin_job_stats_view').select('company_name').order('created_at', { ascending: false }).limit(20)
  ]);

  const totalUsers = profilesRes.count ?? 0;
  const totalResumes = resumesRes.count ?? 0;
  const totalLogs = logsRes.count ?? 0;
  const activeSubs = subsRes.count ?? 0;
  const aiUsageToday = usageRes.count ?? 0;
  const totalRoadmaps = roadmapsRes.count ?? 0;
  const recentUsage = (recentUsageRes.data ?? []) as AIUsageLog[];
  const chatSessionsToday = chatSessionsRes.count ?? 0;
  const totalResumeAnalyses = resumeAnalysisRes.count ?? 0;
  const totalJobApps = jobAppsRes.count ?? 0;
  const recentJobStats = (jobStatsRes.data ?? []) as Array<{ company_name: string | null }>;

  // Calculate top companies
  const companyCounts = recentJobStats.reduce<Record<string, number>>((acc, curr) => {
    if (!curr.company_name) {
      return acc;
    }

    acc[curr.company_name] = (acc[curr.company_name] || 0) + 1;
    return acc;
  }, {});
  const topCompanies = Object.entries(companyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);

  const stats = [
    { label: 'Total Base Users', value: totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Subscriptions', value: activeSubs, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Platform Resumes', value: totalResumes, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'AI Success Roadmaps', value: totalRoadmaps, icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  const secondaryStats = [
    { label: 'Intelligence Calls Today', value: aiUsageToday, icon: Activity, color: 'text-indigo-400' },
    { label: 'Resume Analyses', value: totalResumeAnalyses, icon: Zap, color: 'text-purple-400' },
    { label: 'Recent Applications', value: totalJobApps, icon: Briefcase, color: 'text-emerald-400' },
    { label: 'AI Chat Sessions', value: chatSessionsToday, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Enterprise Forges', value: 4, icon: ShieldCheck, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-12 pb-20">
      <header>
        <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Core Governance
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
          Platform Overview
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Real-time governance metrics and system integrity monitor.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          stat.label === 'Enterprise Forges' ? (
            <Link key={stat.label} href={`/${locale}/admin/forges`} className="glass-card p-8 group hover:border-orange-500/30 transition-all">
              <div className={`w-12 h-12 rounded-xl ${stat.bg || 'bg-orange-500/10'} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                {stat.label} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ) : (
            <div key={stat.label} className="glass-card p-8 group">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-sm font-medium text-slate-500">{stat.label}</div>
            </div>
          )
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Activity className="w-5 h-5 text-indigo-400" />
              AI Neural Engine Monitor
            </h2>
            <Link href={`/${locale}/admin/ai-monitoring`} className="text-xs font-bold text-indigo-400 hover:text-white transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
              Command Center <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {secondaryStats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  {stat.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <LiveAIMonitor initialData={recentUsage} />
        </div>

        <div className="glass-card p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400" />
              Instance Health
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-sm text-slate-400">Database Engine</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">PHASE 4 ACTIVE</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-sm text-slate-400">Admin Actions</span>
                <span className="text-sm font-mono text-white">{totalLogs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Server Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-500 uppercase">Production Stable</span>
                </div>
              </div>
              {topCompanies.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Top Applied Companies</div>
                  <div className="space-y-2">
                    {topCompanies.map((name, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-indigo-400 font-bold">#{i+1}</span>
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-white/5">
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Timestamp Node</div>
            <div className="text-xs font-mono text-slate-400 truncate">{new Date().toISOString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
