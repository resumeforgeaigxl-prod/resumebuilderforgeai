'use client';

import { useEffect, useState } from 'react';
import { MessageSquareWarning } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AIUsageUser {
    email: string;
}

export interface AIUsageLog {
    id: string;
    user_id: string;
    tokens_used: number;
    module: string;
    created_at: string;
    users?: AIUsageUser | AIUsageUser[] | null;
}

function getUsageEmail(users: AIUsageLog['users']) {
    return Array.isArray(users) ? users[0]?.email : users?.email;
}

export default function LiveAIMonitor({ initialData }: { initialData: AIUsageLog[] }) {
    const [recentUsage, setRecentUsage] = useState<AIUsageLog[]>(initialData);

    useEffect(() => {
        const supabase = createClient();

        const usageSub = supabase.channel('dashboard-monitor')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'ai_usage_logs' },
                async (payload) => {
                    const { data: user } = await supabase
                        .from('users')
                        .select('email')
                        .eq('id', payload.new.user_id)
                        .single();

                    const newLog = {
                        ...payload.new,
                        users: user,
                    } as AIUsageLog;

                    setRecentUsage((prev) => [newLog, ...prev].slice(0, 5));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(usageSub);
        };
    }, []);

    return (
        <div className="space-y-4">
            {recentUsage.length === 0 ? (
                <div className="p-10 text-center text-slate-500 bg-white/[0.01] rounded-2xl border border-dashed border-white/5 font-medium">
                    No recent AI signals detected.
                </div>
            ) : (
                recentUsage.map((log) => (
                    <div key={log.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-colors group animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <MessageSquareWarning className={`w-5 h-5 ${log.tokens_used > 1000 ? 'text-orange-400' : 'text-indigo-400'}`} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[200px]">
                                    {getUsageEmail(log.users) || 'Anonymous Signal'}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-tighter">
                                    {log.module || 'JobForgeAI'} - {log.tokens_used || 0} Tokens
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                {new Date(log.created_at).toLocaleTimeString()}
                            </div>
                            <div className="text-[9px] text-emerald-500 font-mono mt-1 px-1.5 py-0.5 bg-emerald-500/10 rounded-full inline-block">
                                SGNL_OK
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
