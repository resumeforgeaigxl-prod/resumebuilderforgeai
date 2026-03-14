'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Star, Save, Loader2, ListChecks, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUSES = [
    { id: 'Applied', icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'Interview', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'Offer', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'Saved', icon: Save, color: 'text-slate-400', bg: 'bg-slate-400/10' },
];

interface JobApplicationTrackerProps {
    jobId: string;
}

export function JobApplicationTracker({ jobId }: JobApplicationTrackerProps) {
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 ${currentStatus.bg} transition-all hover:bg-white/10 group active:scale-95`}
            >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <StatusIcon className={`w-4 h-4 ${currentStatus.color}`} />}
                <span className={`text-xs font-bold uppercase tracking-wider ${currentStatus.id === 'Track Application' ? 'text-slate-400 group-hover:text-white' : 'text-white'}`}>
                    {status || 'Track Application'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-all" />
            </button>

            <AnimatePresence>
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full mb-3 right-0 w-48 bg-[#0a0a0f] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-xl"
                        >
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-1">Set Status</p>
                            {STATUSES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleUpdateStatus(s.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5 ${status === s.id ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <s.icon className={`w-4 h-4 ${s.color}`} />
                                    {s.id}
                                    {status === s.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
