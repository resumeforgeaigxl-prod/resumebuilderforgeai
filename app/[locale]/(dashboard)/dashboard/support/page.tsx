'use client'
export const dynamic = 'force-dynamic';
;
import { useState, useEffect } from 'react';
import {
    LifeBuoy, Send, Loader2, CheckCircle2, AlertCircle,
    Ticket, Clock, MessageSquare, ChevronDown, ChevronUp,
    CreditCard, FileText, Bug, User, HelpCircle, ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
    { value: 'payment_issue', label: 'Payment Issue', icon: CreditCard, color: 'text-emerald-600' },
    { value: 'resume_error', label: 'Resume Error', icon: FileText, color: 'text-blue-600' },
    { value: 'account_issue', label: 'Account Issue', icon: User, color: 'text-amber-600' },
    { value: 'bug_report', label: 'Bug Report', icon: Bug, color: 'text-rose-600' },
    { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-[#8F8F8F]' },
];

interface Ticket {
    id: string; ticket_id: string; category: string; message: string;
    status: string; admin_reply: string | null; created_at: string;
}

function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { color: string; label: string }> = {
        open: { color: 'bg-amber-50 border-amber-200 text-amber-800', label: 'Open' },
        in_progress: { color: 'bg-blue-50 border-blue-200 text-blue-800', label: 'In Progress' },
        resolved: { color: 'bg-emerald-50 border-emerald-200 text-emerald-800', label: 'Resolved' },
    };
    const c = cfg[status] ?? cfg.open;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.color}`}>
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
            if (d?.user?.email) setEmail(d.user.email);
            if (d?.user?.name) setName(d.user.name);
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
        <div className="max-w-3xl mx-auto space-y-10 pb-24 text-[#171717] animate-premium-in">
            {/* Header */}
            <header className="flex items-start gap-4 border-b border-[#EBEBEB] pb-6 mb-10">
                <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#EBEBEB] flex items-center justify-center shadow-sm shrink-0">
                    <LifeBuoy className="w-5 h-5 text-[#171717]" />
                </div>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-[#171717]">Support</h1>
                    <p className="text-[#4D4D4D] text-xs mt-1">
                        Have an issue? Submit a ticket and we&apos;ll reply within 24–48 hours.
                    </p>
                </div>
            </header>

            {/* Form Card */}
            <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-base font-semibold text-[#171717] mb-6 flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#171717]" /> Submit a Ticket
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">Your Name</label>
                            <input
                                value={name} onChange={e => setName(e.target.value)}
                                placeholder="Sai Varshith"
                                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-xs text-[#171717] placeholder-[#8F8F8F] focus:outline-none focus:border-[#171717] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">Email <span className="text-rose-600">*</span></label>
                            <input
                                required value={email} onChange={e => setEmail(e.target.value)}
                                type="email" placeholder="you@example.com"
                                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-xs text-[#171717] placeholder-[#8F8F8F] focus:outline-none focus:border-[#171717] transition-all"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-2 font-mono">Issue Category <span className="text-rose-600">*</span></label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                const isSelected = category === cat.value;
                                return (
                                    <button
                                        type="button" key={cat.value}
                                        onClick={() => setCategory(cat.value)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-semibold transition-all shadow-sm ${isSelected
                                            ? 'bg-[#171717] border-[#171717] text-white'
                                            : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : cat.color}`} />
                                        <span className="text-center leading-tight">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">
                            Message <span className="text-rose-600">*</span>
                            <span className="ml-1 text-[#8F8F8F] font-normal uppercase tracking-normal">(min 20 chars)</span>
                        </label>
                        <textarea
                            required value={message} onChange={e => setMessage(e.target.value)}
                            rows={5} placeholder="Describe your issue in detail…"
                            className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] text-xs text-[#171717] placeholder-[#8F8F8F] rounded-md focus:outline-none focus:border-[#171717] transition-all resize-none"
                        />
                        <div className="text-right text-[10px] text-[#8F8F8F] mt-0.5">{message.length} chars</div>
                    </div>

                    {/* Screenshot hint */}
                    <div className="flex items-center gap-2 text-[10px] text-[#8F8F8F]">
                        <ImageIcon className="w-3.5 h-3.5 text-[#171717]" />
                        To attach a screenshot, upload it to
                        <a href="https://imgur.com" target="_blank" rel="noreferrer" className="text-[#171717] font-semibold underline ml-1">imgur.com</a>
                        and paste the link in your message.
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                        </div>
                    )}

                    <button
                        type="submit" disabled={submitting}
                        className="w-full py-3 rounded-md bg-[#171717] hover:bg-[#333333] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Ticket</>}
                    </button>
                </form>
            </div>

            {/* Previous Tickets */}
            <div>
                <h2 className="text-base font-semibold text-[#171717] mb-4 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#8F8F8F]" /> My Tickets
                </h2>

                {ticketsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#8F8F8F]" /></div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-10 text-[#8F8F8F] text-xs font-semibold">No tickets yet.</div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map(t => {
                            const isExpanded = expandedId === t.id;
                            return (
                                <div key={t.id} className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FAFAFA] transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : t.id)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="font-mono text-xs font-semibold text-[#171717] shrink-0">{t.ticket_id}</span>
                                            <span className="text-[#4D4D4D] text-xs truncate">{catLabel(t.category)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-3">
                                            <StatusBadge status={t.status} />
                                            <span className="text-[#8F8F8F] text-xs hidden sm:block">
                                                {format(new Date(t.created_at), 'MMM dd')}
                                            </span>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-[#8F8F8F]" /> : <ChevronDown className="w-4 h-4 text-[#8F8F8F]" />}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="px-5 pb-5 border-t border-[#EBEBEB] space-y-4 pt-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8F8F8F] mb-1 font-mono">Your Message</p>
                                                <p className="text-xs text-[#171717] leading-relaxed">{t.message}</p>
                                            </div>

                                            {t.admin_reply ? (
                                                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#EBEBEB]">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-2 flex items-center gap-1 font-mono">
                                                        <MessageSquare className="w-3 h-3 text-[#171717]" /> Support Reply
                                                    </p>
                                                    <p className="text-xs text-[#171717] leading-relaxed">{t.admin_reply}</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs text-[#8F8F8F]">
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
