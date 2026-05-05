export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { 
    ShieldCheck, 
    Zap, 
    ArrowLeft, 
    Wallet, 
    Network, 
    Zap as AtsIcon, 
    Search,
    TrendingUp,
    Activity,
    Settings,
    Database,
    Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function AdminForgeHub({ params }: { params: { locale: string } }) {
    const { locale } = params;
    
    try {
        const supabase = createAdminClient();

        // Fetch Forge-specific metrics
        const [
            negotiationsRes,
            scansRes,
            networkRes,
            jobsRes
        ] = await Promise.all([
            supabase.from('ai_usage_logs').select('id', { count: 'exact' }).ilike('feature', '%salaryforge%'),
            supabase.from('ai_usage_logs').select('id', { count: 'exact' }).ilike('feature', '%ats-live%'),
            supabase.from('ai_usage_logs').select('id', { count: 'exact' }).ilike('feature', '%networkforge%'),
            supabase.from('ai_usage_logs').select('id', { count: 'exact' }).ilike('feature', '%jobforge%')
        ]);

        const forgeStats = [
            // ... (rest of the stats)
        { 
            name: 'SalaryForge', 
            icon: Wallet, 
            count: negotiationsRes.count || 0, 
            status: 'Operational', 
            signal: 'LIVE',
            color: 'text-[#00D4A0]',
            desc: 'Offer negotiation & market intelligence'
        },
        { 
            name: 'AtsLive', 
            icon: AtsIcon, 
            count: scansRes.count || 0, 
            status: 'Operational', 
            signal: 'SCANNING',
            color: 'text-purple-400',
            desc: 'Real-time semantic JD analysis'
        },
        { 
            name: 'NetworkForge', 
            icon: Network, 
            count: networkRes.count || 0, 
            status: 'Maintenance', 
            signal: 'SYNCING',
            color: 'text-blue-400',
            desc: 'Outreach automation & networking'
        },
        { 
            name: 'JobForge', 
            icon: Search, 
            count: jobsRes.count || 0, 
            status: 'Operational', 
            signal: 'INDEXED',
            color: 'text-emerald-400',
            desc: 'Semantic job discovery engine'
        }
    ];

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link href={`/${locale}/admin`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-6 group">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Governance
                    </Link>
                    <div className="flex items-center gap-2 text-orange-400 font-bold tracking-widest text-[10px] uppercase mb-4">
                        <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Control Node
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                        Forge Management
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Centralized governance for platform-wide AI career modules.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button className="bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-12 text-sm font-bold">
                        <Settings className="w-4 h-4 mr-2" /> Global Config
                    </Button>
                </div>
            </header>

            {/* Forge Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {forgeStats.map((stat) => (
                    <div key={stat.name} className="glass-card p-8 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                             <Badge variant="outline" className="border-[#00D4A0]/20 bg-[#00D4A0]/5 text-[#00D4A0] text-[8px] font-black uppercase tracking-tighter">
                                {stat.signal}
                             </Badge>
                        </div>
                        
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 group-hover:border-[#00D4A0]/30 transition-all">
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{stat.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">{stat.desc}</p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.15em] mb-1">Lifetime Calls</div>
                                <div className="text-2xl font-bold text-white tracking-tighter">{stat.count.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.15em] mb-1">State</div>
                                <div className={`text-xs font-bold ${stat.status === 'Operational' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {stat.status}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Deployment Control */}
                <div className="lg:col-span-2 glass-card p-10">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <Database className="w-5 h-5 text-indigo-400" />
                            Model Governance
                        </h2>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-none font-bold uppercase text-[10px]">Neural v4.2 Active</Badge>
                    </div>

                    <div className="space-y-6">
                        {['SalaryForge', 'AtsLive', 'JobForge'].map((forge) => (
                            <div key={forge} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-white/5 text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{forge} Engine</h4>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Route: /api/{forge.toLowerCase()}/negotiate</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="border-white/5 text-slate-500 text-[10px] font-bold">GPT-4o</Badge>
                                    <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase border-white/5 hover:bg-white/5">Configure</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Signal */}
                <div className="glass-card p-10">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Live Latency
                    </h2>
                    
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inference Speed</span>
                                <span className="text-xs font-mono text-emerald-400">240ms</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-emerald-500/50 rounded-full" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Memory Load</span>
                                <span className="text-xs font-mono text-indigo-400">12%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[12%] bg-indigo-500/50 rounded-full" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">API Reliability</span>
                                <span className="text-xs font-mono text-white">99.9%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[99.9%] bg-white/30 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-5 rounded-xl bg-[#00D4A0]/5 border border-[#00D4A0]/10">
                        <div className="flex items-center gap-2 text-[#00D4A0] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                             <TrendingUp className="w-3.5 h-3.5" /> Growth Vector
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Forge modules are currently experiencing a <span className="text-white font-bold">24% MoM increase</span> in high-ticket usage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
    } catch (error) {
        console.error('Forge Hub Error:', error);
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050508', color: 'white', fontFamily: 'sans-serif' }}>
                <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Governance Failure</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
                        The neural link to Forge metrics has been interrupted.
                    </p>
                    <a href={`/${locale}/admin`} style={{ display: 'block', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 'bold' }}>
                        Return to Safe Zone
                    </a>
                </div>
            </div>
        );
    }
}
