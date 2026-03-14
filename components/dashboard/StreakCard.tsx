'use client';

import { useState, useEffect } from 'react';
import { Flame, Star, Award, ChevronRight, Zap, Loader2 } from 'lucide-react';

interface StreakInfo {
    current_streak: number;
    longest_streak: number;
    last_active_date: string;
}

interface Reward {
    streak_day: number;
    description: string;
    reward_type: string;
}

export default function StreakCard() {
    const [streak, setStreak] = useState<StreakInfo | null>(null);
    const [nextReward, setNextReward] = useState<Reward | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStreak();
    }, []);

    const fetchStreak = async () => {
        try {
            const res = await fetch('/api/user/streak');
            const data = await res.json();
            if (data.success) {
                setStreak(data.streak);
                setNextReward(data.nextReward);
            }
        } catch (err) {
            console.error('Failed to fetch streak', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-48 rounded-[2rem] bg-[#0a0a16] border border-white/5 animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
    );

    const currentStreak = streak?.current_streak || 0;
    const progress = nextReward ? (currentStreak / nextReward.streak_day) * 100 : 100;

    return (
        <div className="group relative p-8 rounded-[2rem] bg-[#0a0a16] border border-white/5 overflow-hidden transition-all hover:border-indigo-500/30">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] group-hover:bg-indigo-500/10 transition-all duration-1000"></div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-700'}`} />
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Daily Streak</h3>
                        </div>
                        <p className="text-slate-500 text-xs font-medium">Keep forging daily to unlock rewards.</p>
                    </div>
                    <div className="text-4xl font-black text-white italic tracking-tighter">
                        {currentStreak}<span className="text-indigo-500 text-lg not-italic ml-1">Days</span>
                    </div>
                </div>

                {nextReward ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Next Reward: {nextReward.streak_day} Days</span>
                            <span className="text-indigo-400">{(progress).toFixed(0)}% Complete</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, progress)}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                            <Award className="w-5 h-5 text-indigo-400" />
                            <p className="text-xs font-bold text-slate-300">
                                {nextReward.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 border-dashed">
                        <Star className="w-5 h-5 text-emerald-400" />
                        <p className="text-xs font-bold text-emerald-400 lowercase tracking-tight">
                            You&apos;ve reached the ultimate streak! Legend status.
                        </p>
                    </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0a0a16] flex items-center justify-center ${i <= currentStreak ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                                <Zap className={`w-3 h-3 ${i <= currentStreak ? 'text-white' : 'text-slate-600'}`} />
                            </div>
                        ))}
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                        View Rewards <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
