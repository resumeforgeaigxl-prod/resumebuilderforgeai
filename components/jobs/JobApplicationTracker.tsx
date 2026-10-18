'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Star, Save, Loader2, ListChecks, ChevronDown } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

const STATUSES = [
    { id: 'Applied', icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'Interview', icon: Clock, color: 'text-[#d7e4f0]', bg: 'bg-[#16171b]' },
    { id: 'Offer', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'Saved', icon: Save, color: 'text-slate-400', bg: 'bg-slate-400/10' },
];

interface JobApplicationTrackerProps {
    jobId: string;
    compact?: boolean;
}

export function JobApplicationTracker({ jobId, compact = false }: JobApplicationTrackerProps) {
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/jobs/tracking?jobId=${jobId}`);
                const data = await res.json();
                if (data.success && data.application) {
                    setStatus(data.application.status);
                }
            } catch (err) {
                console.error('Failed to fetch tracking status', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [jobId]);

    const handleUpdateStatus = async (newStatus: string) => {
        setUpdating(true);
        setShowMenu(false);
        try {
            const res = await fetch('/api/jobs/tracking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus(newStatus);
            }
        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="w-10 h-10 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-slate-500" /></div>;

    const currentStatus = STATUSES.find(s => s.id === status) || { id: 'Track Application', icon: ListChecks, color: 'text-slate-400', bg: 'bg-white/5' };
    const StatusIcon = currentStatus.icon;

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={updating}
                aria-label={status || 'Save'}
                className={compact
                    ? 'flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2c33] text-[#9bb4c9] hover:border-[#3a3d46]'
                    : 'flex items-center gap-2 rounded-full border border-[#2a2c33] px-3.5 py-1.5 text-[#b4b8c2] hover:text-[#f4f5f7]'}
            >
                {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9bb4c9]" /> : <StatusIcon className={`h-3.5 w-3.5 ${compact ? 'text-[#9bb4c9]' : currentStatus.color}`} />}
                {!compact && (
                    <>
                        <span className="text-xs">{status || 'Save'}</span>
                        <ChevronDown className="h-3 w-3 text-[#8b909a]" />
                    </>
                )}
            </button>

            <AnimatePresence>
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full right-0 z-50 mb-3 w-48 rounded-xl border border-[#2a2c33] bg-[#0c0d10] p-2"
                        >
                            <p className="mb-1 border-b border-[#2a2c33] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#8b909a]">Status</p>
                            {STATUSES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleUpdateStatus(s.id)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-[#202020] ${status === s.id ? 'text-[#F5F5F5] bg-[#202020]' : 'text-[#7E7E7E] hover:text-[#F5F5F5]'}`}
                                >
                                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                                    {s.id}
                                    {status === s.id && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d7e4f0]" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
