import { Shield, TrendingUp } from 'lucide-react';

interface QuestionCardProps {
    question: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    frequency: number;
    verified?: boolean;
    date?: string;
}

export function QuestionCard({ question, difficulty, frequency, verified, date }: QuestionCardProps) {
    const diffColor = (d: string) => {
        switch (d) {
            case 'Easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300">
            <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${diffColor(difficulty)}`}>
                        {difficulty}
                    </span>
                    {verified && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Shield className="w-3 h-3" /> Verified Question
                        </span>
                    )}
                </div>
                {frequency > 1 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1.5 rounded-full border border-indigo-400/20">
                        <TrendingUp className="w-3.5 h-3.5" /> Checked {frequency}x
                    </div>
                )}
            </div>

            <p className="text-slate-200 text-lg font-medium leading-relaxed group-hover:text-white transition-colors">
                {question}
            </p>

            {date && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <span className="text-[10px] text-slate-500 font-medium">Added on {date}</span>
                </div>
            )}
        </div>
    );
}
