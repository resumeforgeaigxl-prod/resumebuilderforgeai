'use client';
import { useState, useEffect } from 'react';
import {
    LifeBuoy, Send, Loader2, CheckCircle2, AlertCircle,
    Ticket, Clock, MessageSquare, ChevronDown, ChevronUp,
    CreditCard, FileText, Bug, User, HelpCircle, ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
    { value: 'payment_issue', label: 'Payment Issue', icon: CreditCard, color: 'text-emerald-400' },
    { value: 'resume_error', label: 'Resume Error', icon: FileText, color: 'text-blue-400' },
    { value: 'account_issue', label: 'Account Issue', icon: User, color: 'text-amber-400' },
    { value: 'bug_report', label: 'Bug Report', icon: Bug, color: 'text-rose-400' },
    { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-slate-400' },
];

interface Ticket {
    id: string; ticket_id: string; category: string; message: string;
    status: string; admin_reply: string | null; created_at: string;
}

function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { color: string; label: string }> = {
        open: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', label: 'Open' },
        in_progress: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/20', label: 'In Progress' },
        resolved: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: 'Resolved' },
    };
    const c = cfg[status] ?? cfg.open;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${c.color}`}>
            {c.label}
        </span>
    );
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadTickets = async () => {
        setTicketsLoading(true);
        try {
            const r = await fetch('/api/support');
            const d = await r.json();
            if (d.success) setTickets(d.tickets);
        } finally { setTicketsLoading(false); }
    };

    useEffect(() => {
        // Pre-fill email from session if available
        fetch('/api/user/profile').then(r => r.json()).then(d => {
            if (d?.email) setEmail(d.email);
            if (d?.name) setName(d.name);
        }).catch(() => { });
        loadTickets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!category) { setError('Please select a category'); return; }
        if (message.trim().length < 20) { setError('Message must be at least 20 characters'); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, category, message }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(`Ticket ${data.ticketId} submitted! Check your email for confirmation.`);
                setCategory(''); setMessage('');
                await loadTickets();
            } else {
                setError(data.error ?? 'Failed to submit ticket');
            }
        } catch { setError('Network error. Please try again.'); }
        finally { setSubmitting(false); }
    };

    const catLabel = (value: string) =>
        CATEGORIES.find(c => c.value === value)?.label ?? value.replace(/_/g, ' ');

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                    <LifeBuoy className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Support</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Have an issue? Submit a ticket and we&apos;ll reply within 24–48 hours.
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-400" /> Submit a Ticket
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Your Name</label>
                            <input
                                value={name} onChange={e => setName(e.target.value)}
                                placeholder="Sai Varshith"
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email <span className="text-rose-400">*</span></label>
                            <input
                                required value={email} onChange={e => setEmail(e.target.value)}
                                type="email" placeholder="you@example.com"
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">Issue Category <span className="text-rose-400">*</span></label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                const isSelected = category === cat.value;
                                return (
                                    <button
                                        type="button" key={cat.value}
                                        onClick={() => setCategory(cat.value)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${isSelected
                                            ? 'bg-indigo-500/20 border-indigo-500/40 text-white'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : cat.color}`} />
                                        <span className="text-center leading-tight">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                            Message <span className="text-rose-400">*</span>
                            <span className="ml-1 text-slate-600 font-normal">(min 20 chars)</span>
                        </label>
                        <textarea
                            required value={message} onChange={e => setMessage(e.target.value)}
                            rows={5} placeholder="Describe your issue in detail…"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                        />
                        <div className="text-right text-[11px] text-slate-600 mt-0.5">{message.length} chars</div>
                    </div>

                    {/* Screenshot hint */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ImageIcon className="w-3.5 h-3.5" />
                        To attach a screenshot, upload it to
                        <a href="https://imgur.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">imgur.com</a>
                        and paste the link in your message.
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                        </div>
                    )}

                    <button
                        type="submit" disabled={submitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Ticket</>}
                    </button>
                </form>
            </div>

            {/* Previous Tickets */}
            <div>
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-slate-400" /> My Tickets
                </h2>

                {ticketsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-500" /></div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">No tickets yet.</div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map(t => {
                            const isExpanded = expandedId === t.id;
                            return (
                                <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                    <button
                                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : t.id)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="font-mono text-xs font-bold text-indigo-300 shrink-0">{t.ticket_id}</span>
                                            <span className="text-slate-300 text-sm truncate">{catLabel(t.category)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-3">
                                            <StatusBadge status={t.status} />
                                            <span className="text-slate-600 text-xs hidden sm:block">
                                                {format(new Date(t.created_at), 'MMM dd')}
                                            </span>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="px-5 pb-5 border-t border-white/5 space-y-4 pt-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Your Message</p>
                                                <p className="text-sm text-slate-300 leading-relaxed">{t.message}</p>
                                            </div>

                                            {t.admin_reply ? (
                                                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" /> Support Reply
                                                    </p>
                                                    <p className="text-sm text-slate-200 leading-relaxed">{t.admin_reply}</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Awaiting reply — typically within 24–48 hours
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
