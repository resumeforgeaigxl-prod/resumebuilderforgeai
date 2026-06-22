'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, Cpu, ShieldAlert, DollarSign, Database, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ModelStat {
  name: string;
  usage: string;
}

interface Stats {
  totalTokens: number;
  estimatedCost: number;
  activeUsers: number;
  errorRate: string;
  models: ModelStat[];
}

interface LogEntry {
  id: number;
  user: string;
  module: string;
  tokens: number;
  status: 'success' | 'error';
  time: string;
}

export default function AIMonitoringClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // In production, fetch from /api/admin/ai-monitoring/stats
    setStats({
      totalTokens: 1254000,
      estimatedCost: 24.50,
      activeUsers: 84,
      errorRate: "0.2%",
      models: [
        { name: 'Gemini 2.0 Flash', usage: '85%' },
        { name: 'ElevenLabs v2', usage: '12%' },
        { name: 'GPT-4o (Legacy)', usage: '3%' }
      ]
    });

    setLogs([
      { id: 1, user: 'user_982', module: 'MentorForge', tokens: 1540, status: 'success', time: '2 mins ago' },
      { id: 2, user: 'user_121', module: 'DemoStudio', tokens: 8200, status: 'success', time: '5 mins ago' },
      { id: 3, user: 'user_443', module: 'VoiceGen', tokens: 0, status: 'error', time: '12 mins ago' },
    ]);
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[10px] uppercase mb-4">
            <Activity className="w-3.5 h-3.5" /> NEURAL MONITOR
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-[#171717]">AI Systems Health</h1>
          <p className="text-[#8F8F8F] mt-2 text-lg">Real-time oversight of ResumeForgeAI AI infrastructure.</p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full text-xs animate-pulse">
          Systems Operational
        </Badge>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white/[0.02] border-[#EBEBEB] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-widest">Total Token Usage</p>
            <h3 className="text-2xl font-bold text-[#171717] mt-1">1.25M</h3>
          </div>
        </Card>
        <Card className="p-6 bg-white/[0.02] border-[#EBEBEB] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-widest">Estimated Cost</p>
            <h3 className="text-2xl font-bold text-[#171717] mt-1">$24.50</h3>
          </div>
        </Card>
        <Card className="p-6 bg-white/[0.02] border-[#EBEBEB] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-widest">Model Distribution</p>
            <h3 className="text-2xl font-bold text-[#171717] mt-1">Gemini 2.0</h3>
          </div>
        </Card>
        <Card className="p-6 bg-white/[0.02] border-[#EBEBEB] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-widest">Security Anomalies</p>
            <h3 className="text-2xl font-bold text-[#171717] mt-1">0</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Model Performance */}
        <Card className="p-6 bg-white/[0.02] border-[#EBEBEB] space-y-6">
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" /> Model Efficiency
          </h2>
          <div className="space-y-4">
            {stats?.models.map((m) => (
              <div key={m.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-[#8F8F8F]">{m.name}</span>
                  <span className="text-[#171717]">{m.usage}</span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: m.usage }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Logs */}
        <Card className="lg:col-span-2 p-6 bg-white/[0.02] border-[#EBEBEB] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" /> Live AI Interaction Log
            </h2>
            <button className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-widest hover:text-[#171717] transition-colors">
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EBEBEB] text-[10px] font-bold text-[#8F8F8F] uppercase tracking-widest">
                  <th className="pb-4">Module</th>
                  <th className="pb-4">User</th>
                  <th className="pb-4">Tokens</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-white/[0.01]">
                    <td className="py-4 font-bold text-[#171717]">{log.module}</td>
                    <td className="py-4 text-[#8F8F8F]">{log.user}</td>
                    <td className="py-4 font-mono text-indigo-600">{log.tokens.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 text-[#8F8F8F] text-xs">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Alerts Channel */}
      <Card className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-[#171717]">System Advisory</h4>
          <p className="text-sm text-[#8F8F8F]">ElevenLabs API key #3 is approaching rate limit (92%). Rotation engaged.</p>
        </div>
      </Card>
    </div>
  );
}
