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
    { label: 'Total Base Users', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-100' },
    { label: 'Active Subscriptions', value: activeSubs, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-100' },
    { label: 'Platform Resumes', value: totalResumes, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 border border-purple-100' },
    { label: 'AI Success Roadmaps', value: totalRoadmaps, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50 border border-orange-100' },
  ];

  const secondaryStats = [
    { label: 'Intelligence Calls Today', value: aiUsageToday, icon: Activity, color: 'text-indigo-600' },
    { label: 'Resume Analyses', value: totalResumeAnalyses, icon: Zap, color: 'text-purple-600' },
    { label: 'Recent Applications', value: totalJobApps, icon: Briefcase, color: 'text-emerald-600' },
    { label: 'AI Chat Sessions', value: chatSessionsToday, icon: MessageSquare, color: 'text-blue-600' },
    { label: 'Enterprise Forges', value: 4, icon: ShieldCheck, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-12 pb-20">
      <header>
        <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[11px] font-mono uppercase mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Core Governance
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#171717]">
          Platform Overview
        </h1>
        <p className="text-[#666666] mt-2 text-lg">Real-time governance metrics and system integrity monitor.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          stat.label === 'Enterprise Forges' ? (
            <Link key={stat.label} href={`/${locale}/admin/forges`} className="bg-white border border-[#EBEBEB] p-6 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] group hover:border-neutral-300 transition-all flex flex-col justify-between">
              <div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg || 'bg-orange-50 border border-orange-100'} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-[#171717] mb-1">{stat.value.toLocaleString()}</div>
              </div>
              <div className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider font-mono flex items-center gap-1.5 mt-2">
                {stat.label} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ) : (
            <div key={stat.label} className="bg-white border border-[#EBEBEB] p-6 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] group hover:border-neutral-300 transition-all">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-[#171717] mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider font-mono">{stat.label}</div>
            </div>
          )
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-[#EBEBEB] p-6 md:p-8 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#171717] flex items-center gap-3">
              <Activity className="w-5 h-5 text-indigo-600" />
              AI Neural Engine Monitor
            </h2>
            <Link href={`/${locale}/admin/ai-monitoring`} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              Command Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {secondaryStats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-neutral-50/50 border border-[#EBEBEB]">
                <div className="text-[9px] text-[#8F8F8F] font-bold uppercase tracking-widest font-mono mb-1">{stat.label}</div>
                <div className="text-base font-bold text-[#171717] flex items-center gap-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  {stat.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <LiveAIMonitor initialData={recentUsage} />
        </div>

        <div className="bg-white border border-[#EBEBEB] p-6 md:p-8 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#171717] mb-6 flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-600" />
              Instance Health
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#EBEBEB] pb-3">
                <span className="text-sm text-[#666666]">Database Engine</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider font-mono">PHASE 4 ACTIVE</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#EBEBEB] pb-3">
                <span className="text-sm text-[#666666]">Admin Actions</span>
                <span className="text-sm font-mono text-[#171717] font-semibold">{totalLogs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666666]">Server Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Production Stable</span>
                </div>
              </div>
              {topCompanies.length > 0 && (
                <div className="pt-4 border-t border-[#EBEBEB]">
                  <div className="text-[9px] text-[#8F8F8F] font-bold uppercase tracking-widest font-mono mb-3">Top Applied Companies</div>
                  <div className="space-y-2">
                    {topCompanies.map((name, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#666666] font-medium">
                        <span className="text-indigo-600 font-bold font-mono">#{i+1}</span>
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EBEBEB]">
            <div className="text-[9px] text-[#8F8F8F] font-bold uppercase tracking-widest font-mono mb-2">Timestamp Node</div>
            <div className="text-xs font-mono text-[#666666] truncate">{new Date().toISOString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
