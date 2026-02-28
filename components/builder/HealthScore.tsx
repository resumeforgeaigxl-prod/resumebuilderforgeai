'use client';
import { useState } from 'react';
import { Loader2, Activity, CheckCircle, Clock } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface Props {
    resumeId: string;
    resumeData: ResumeData;
}

export function HealthScorePanel({ resumeId, resumeData }: Props) {
    const [metrics, setMetrics] = useState<{ action_score: number; impact_score: number; readability_score: number; recruiter_scan_time: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [scanned, setScanned] = useState(false);

    const scan = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/resume/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId, resumeData })
            });
            const data = await res.json();
            if (data.success) {
                setMetrics(data.analysis);
                setScanned(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!scanned) {
        return (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold flex items-center gap-2 text-slate-200"><Activity className="w-4 h-4 text-emerald-400" /> Resume Health Analysis</h3>
                        <p className="text-xs text-slate-400 mt-1">Scan for impact, action verbs, and readability.</p>
                    </div>
                    <button onClick={scan} disabled={loading} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Scan'}
                    </button>
                </div>
            </div>
        );
    }

    if (!metrics) return null;

    return (
        <div className="p-5 bg-white/5 border border-white/10 rounded-xl mb-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-200"><CheckCircle className="w-4 h-4 text-emerald-400" /> Analysis Complete</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Action Verbs</p>
                    <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, metrics.action_score)}%` }} />
                        </div>
                        <span className="text-sm font-mono text-slate-300">{metrics.action_score}%</span>
                    </div>
                </div>
                <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Impact (Metrics)</p>
                    <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, metrics.impact_score)}%` }} />
                        </div>
                        <span className="text-sm font-mono text-slate-300">{metrics.impact_score}%</span>
                    </div>
                </div>
                <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Readability</p>
                    <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, metrics.readability_score)}%` }} />
                        </div>
                        <span className="text-sm font-mono text-slate-300">{metrics.readability_score}%</span>
                    </div>
                </div>
                <div className="p-3 bg-black/20 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Scan Time</p>
                        <p className="text-lg font-bold text-slate-200 mt-1">{metrics.recruiter_scan_time}s</p>
                    </div>
                    {metrics.recruiter_scan_time > 10 && <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">Too Wordy</span>}
                    {metrics.recruiter_scan_time <= 8 && <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Optimal</span>}
                </div>
            </div>
        </div>
    );
}
