"use client"

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Collaborator {
    presence_ref: string;
    user_id: string;
    name: string;
    color: string;
}

export function Collaborators({ resumeId, currentUserId }: { resumeId: string; currentUserId: string | null }) {
    const [onlineUsers, setOnlineUsers] = useState<Collaborator[]>([]);
    const supabase = createClient();

    useEffect(() => {
        if (!resumeId || !currentUserId) return;

        const channel = supabase.channel(`resume_collab:${resumeId}`, {
            config: {
                presence: {
                    key: currentUserId,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users: Collaborator[] = [];
                
                Object.keys(state).forEach((key) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (state[key] as any).forEach((presence: any) => {
                        users.push({
                            presence_ref: presence.presence_ref,
                            user_id: key,
                            name: presence.name || 'Anonymous Editor',
                            color: presence.color || '#00D4A0'
                        });
                    });
                });
                
                setOnlineUsers(users);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        online_at: new Date().toISOString(),
                        name: `Editor_${currentUserId.slice(0, 4)}`,
                        color: ['#00D4A0', '#7C5CFC', '#F5A623', '#3B82F6'][Math.floor(Math.random() * 4)]
                    });
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [resumeId, currentUserId, supabase]);

    if (onlineUsers.length <= 1) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex -space-x-2 overflow-hidden">
                {onlineUsers.map((user) => (
                    <div
                        key={user.presence_ref}
                        className={cn(
                            "inline-block h-6 w-6 rounded-full ring-2 ring-[#080B16] flex items-center justify-center text-[10px] font-bold text-white uppercase",
                        )}
                        style={{ backgroundColor: user.color }}
                        title={user.name}
                    >
                        {user.name.charAt(0)}
                    </div>
                ))}
            </div>
            <div className="text-[10px] font-bold text-[#7A8BA8] uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                {onlineUsers.length} Active Editors
            </div>
        </div>
    );
}
