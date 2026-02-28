'use client';
import { useState } from 'react';
import { Loader2, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface Props {
    resumeId: string;
    resumeData: ResumeData;
}

export function JdMatcher({ resumeId, resumeData }: Props) {
    const [jdText, setJdText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ match_percentage: number; missing_keywords: string[]; present_keywords: string[] } | null>(null);
    const [error, setError] = useState('');

    const matchJd = async () => {
        if (jdText.trim().length < 50) {
            setError('Please paste a longer job description (at least 50 chars)');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/resume/match-jd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId, resumeData, jdText })
            });
            const data = await res.json();
            if (data.success) {
                setResult(data.analysis);
            } else {
                setError(data.error || 'Failed to analyze JD');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 bg-white/5 border border-white/10 rounded-xl mb-6">
            <h3 className="font-bold flex items-center gap-2 text-slate-200 mb-3"><Target className="w-4 h-4 text-purple-400" /> ATS Job Description Matcher</h3>

            {!result ? (
                <div className="space-y-3">
                    <p className="text-xs text-slate-400">Paste the job description you are applying for to see how well your resume matches the required skills and keywords.</p>
                    <textarea
                        value={jdText}
                        onChange={e => setJdText(e.target.value)}
                        placeholder="Paste Job Description here..."
                        className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-purple-500/50 outline-none resize-none"
                    />
                    {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
                    <button
                        onClick={matchJd}
                        disabled={loading || jdText.trim().length < 10}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Compare Resume vs JD'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-purple-500/20">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">ATS Match Score</p>
                            <p className="text-sm text-slate-500 mt-1">Based on extracted skills</p>
                        </div>
                        <div className="text-3xl font-bold flex items-center gap-2">
                            <span className={result.match_percentage >= 75 ? 'text-emerald-400' : result.match_percentage >= 50 ? 'text-amber-400' : 'text-red-400'}>
                                {result.match_percentage}%
                            </span>
                        </div>
                    </div>

                    {result.missing_keywords?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Missing Keywords</p>
                            <div className="flex flex-wrap gap-1.5">
                                {result.missing_keywords.map((kw: string, i: number) => (
                                    <span key={i} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-md">{kw}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.present_keywords?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Present Keywords</p>
                            <div className="flex flex-wrap gap-1.5">
                                {result.present_keywords.map((kw: string, i: number) => (
                                    <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-md">{kw}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => { setResult(null); setJdText(''); }}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm transition-all mt-4"
                    >
                        Analyze Another JD
                    </button>
                </div>
            )}
        </div>
    );
}
