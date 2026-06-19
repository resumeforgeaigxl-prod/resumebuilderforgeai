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
        <div className="h-48 rounded-xl bg-white border border-[#EBEBEB] animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#171717] animate-spin" />
        </div>
    );

    const currentStreak = streak?.current_streak || 0;
    const progress = nextReward ? (currentStreak / nextReward.streak_day) * 100 : 100;

    return (
        <div className="group relative p-6 rounded-xl bg-white border border-[#EBEBEB] overflow-hidden transition-all hover:shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)]">
            <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-[#0070F3] fill-[#0070F3]/10' : 'text-[#8F8F8F]'}`} />
                            <h3 className="text-base font-semibold text-[#171717] tracking-tight">Daily Streak</h3>
                        </div>
                        <p className="text-[#8F8F8F] text-xs font-normal">Keep forging daily to unlock rewards.</p>
                    </div>
                    <div className="text-3xl font-bold text-[#171717] tracking-tight">
                        {currentStreak}<span className="text-[#8F8F8F] text-sm font-normal not-italic ml-1">Days</span>
                    </div>
                </div>

                {nextReward ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#8F8F8F]">
                            <span>Next Reward: {nextReward.streak_day} Days</span>
                            <span className="text-[#0070F3]">{(progress).toFixed(0)}% Complete</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F2F2F2] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#171717] rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, progress)}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB]">
                            <Award className="w-5 h-5 text-[#171717]" />
                            <p className="text-xs font-medium text-[#4D4D4D]">
                                {nextReward.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-100 border-dashed">
                        <Star className="w-5 h-5 text-emerald-600" />
                        <p className="text-xs font-medium text-emerald-600 tracking-tight">
                            You&apos;ve reached the ultimate streak! Legend status.
                        </p>
                    </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${i <= currentStreak ? 'bg-[#171717]' : 'bg-[#F2F2F2]'}`}>
                                <Zap className={`w-3 h-3 ${i <= currentStreak ? 'text-white' : 'text-[#8F8F8F]'}`} />
                            </div>
                        ))}
                    </div>
                    <button className="flex items-center gap-1 text-[11px] font-mono text-[#8F8F8F] hover:text-[#171717] transition-colors">
                        View Rewards <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
