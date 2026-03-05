import { createAdminClient } from '@/lib/supabase/admin';
import { Users, FileText, Activity, CreditCard, LayoutTemplate, CopyCheck, Coins } from 'lucide-react';
import { startOfDay, endOfDay } from 'date-fns';

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();

  const [
    profilesRes,
    resumesRes,
    logsRes,
    subsRes,
    portfoliosRes,
    mocksRes,
    usageRes
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from('users').select('id, is_blocked', { count: 'exact' }) as any,
    supabase.from('resumes').select('id', { count: 'exact' }),
    supabase.from('admin_logs').select('id', { count: 'exact' }),
    supabase.from('subscriptions').select('plan').eq('status', 'active'),
    supabase.from('portfolios').select('id', { count: 'exact' }),
    supabase.from('mock_tests').select('id', { count: 'exact' }),
    supabase.from('usage_logs').select('id', { count: 'exact' }).gte('created_at', todayStart).lte('created_at', todayEnd),
  ]);

  const totalUsers = profilesRes.count ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blockedUsers = (profilesRes.data ?? []).filter((p: any) => p.is_blocked).length;
  const totalResumes = resumesRes.count ?? 0;
  const totalLogs = logsRes.count ?? 0;

  const activeSubs = subsRes.data?.length ?? 0;
  const totalPortfolios = portfoliosRes.count ?? 0;
  const totalMocks = mocksRes.count ?? 0;
  const aiUsageToday = usageRes.count ?? 0;

  // Assuming $9/mo for Pro plan for pure analytical visualization purposes
  const estRevenue = activeSubs * 9;

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Subs', value: activeSubs, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Resumes', value: totalResumes, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Portfolios', value: totalPortfolios, icon: LayoutTemplate, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Mock Tests', value: totalMocks, icon: CopyCheck, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'MRR (Est.)', value: `$${estRevenue}`, icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'AI Calls Today', value: aiUsageToday, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Blocked Users', value: blockedUsers, icon: Users, color: 'text-red-400', bg: 'bg-red-500/10' }
  ];

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-1">Admin Overview</h1>
      <p className="text-slate-500 text-sm mb-8">System metrics and platform health</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`inline-flex p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm font-medium text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl">
        <h2 className="font-semibold text-white mb-4">System Information</h2>
        <div className="text-sm text-slate-400 space-y-2">
          <p className="flex justify-between border-b border-white/5 pb-2"><span>Total Admin Actions Logged:</span> <span className="text-white font-mono">{totalLogs}</span></p>
          <p className="flex justify-between border-b border-white/5 pb-2 pt-2"><span>Database Version:</span> <span className="text-white font-mono">Phase 4 Active</span></p>
          <p className="flex justify-between pt-2"><span>Current Server Time:</span> <span className="text-emerald-400 font-mono">{new Date().toISOString()}</span></p>
        </div>
      </div>
    </div>
  );
}
