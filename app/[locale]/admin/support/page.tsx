'use client';
import { useState, useEffect } from 'react';
import {
    LifeBuoy, Loader2, Search, ChevronDown, ChevronUp,
    MessageSquare, CheckCircle, Clock, Send, AlertCircle, ExternalLink
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface SupportTicket {
    id: string; ticket_id: string; user_id: string | null;
    email: string; name: string | null; category: string;
    message: string; screenshot_url: string | null; status: string;
    admin_reply: string | null; replied_at: string | null;
    created_at: string; updated_at: string;
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved'];

function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, string> = {
        open: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
        in_progress: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
        resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg[status] ?? cfg.open}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [replyStatus, setReplyStatus] = useState<Record<string, string>>({});
    const [sending, setSending] = useState<string | null>(null);
    const [replyResult, setReplyResult] = useState<Record<string, 'ok' | 'err'>>({});

    const load = async () => {
        setLoading(true);
        const r = await fetch('/api/admin/support');
        const d = await r.json();
        if (d.success) setTickets(d.tickets);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const filtered = tickets.filter(t => {
        const matchSearch =
            t.email.toLowerCase().includes(search.toLowerCase()) ||
            t.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
            t.category.toLowerCase().includes(search.toLowerCase()) ||
            t.message.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || t.status === filter;
        return matchSearch && matchFilter;
    });

    const handleReply = async (t: SupportTicket) => {
        const reply = replyText[t.id] ?? '';
        if (!reply.trim()) return;
        setSending(t.id);
        const status = replyStatus[t.id] ?? 'in_progress';
        const res = await fetch(`/api/admin/support/${t.id}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply, status }),
        });
        if (res.ok) {
            setReplyResult(prev => ({ ...prev, [t.id]: 'ok' }));
            await load();
        } else {
            setReplyResult(prev => ({ ...prev, [t.id]: 'err' }));
        }
        setSending(null);
    };

    const catLabel = (v: string) => v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const counts = { open: 0, in_progress: 0, resolved: 0 };
    tickets.forEach(t => { counts[t.status as keyof typeof counts]++; });

    return (
        <div className="p-4 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LifeBuoy className="w-6 h-6 text-indigo-400" /> Support Tickets
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{tickets.length} total tickets</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search email, ticket, message…"
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-72" />
                </div>
            </div>

            {/* Stats + Filter strip */}
            <div className="flex flex-wrap gap-3 mb-6">
                {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${filter === f ? 'bg-indigo-500/20 border-indigo-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                        {f === 'all' ? `All (${tickets.length})` : f === 'open' ? `Open (${counts.open})` : f === 'in_progress' ? `In Progress (${counts.in_progress})` : `Resolved (${counts.resolved})`}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(t => {
                        const isExpanded = expandedId === t.id;
                        return (
                            <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                {/* Ticket header row */}
                                <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : t.id)}>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                            <span className="font-mono font-bold text-xs text-indigo-300">{t.ticket_id}</span>
                                            <StatusBadge status={t.status} />
                                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700 text-slate-400">{catLabel(t.category)}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 truncate">
                                            <strong className="text-slate-300">{t.email}</strong>
                                            <span className="mx-1.5 text-slate-600">·</span>
                                            {t.message.slice(0, 80)}{t.message.length > 80 ? '…' : ''}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 text-slate-600 text-xs">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                                        {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                                    </div>
                                </button>

                                {/* Expanded panel */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 px-5 py-5 space-y-5">
                                        {/* Meta */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                            {[
                                                { label: 'Name', value: t.name ?? '—' },
                                                { label: 'Email', value: t.email },
                                                { label: 'Submitted', value: format(new Date(t.created_at), 'MMM dd, yyyy HH:mm') },
                                                { label: 'Category', value: catLabel(t.category) },
                                            ].map(m => (
                                                <div key={m.label} className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                                                    <p className="text-slate-500 mb-0.5">{m.label}</p>
                                                    <p className="text-slate-200 font-medium truncate">{m.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Message */}
                                        <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">User Message</p>
                                            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{t.message}</p>
                                            {t.screenshot_url && (
                                                <a href={t.screenshot_url} target="_blank" rel="noreferrer"
                                                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline">
                                                    <ExternalLink className="w-3 h-3" /> View Screenshot
                                                </a>
                                            )}
                                        </div>

                                        {/* Previous reply */}
                                        {t.admin_reply && (
                                            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">Previous Reply</p>
                                                <p className="text-sm text-slate-200 leading-relaxed">{t.admin_reply}</p>
                                            </div>
                                        )}

                                        {/* Reply form */}
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reply to User</p>
                                            <textarea
                                                value={replyText[t.id] ?? ''}
                                                onChange={e => setReplyText(prev => ({ ...prev, [t.id]: e.target.value }))}
                                                rows={3} placeholder="Type your reply here…"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                                            />
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={replyStatus[t.id] ?? t.status}
                                                    onChange={e => setReplyStatus(prev => ({ ...prev, [t.id]: e.target.value }))}
                                                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s} value={s} className="bg-slate-900">{s.replace('_', ' ')}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleReply(t)}
                                                    disabled={sending === t.id || !replyText[t.id]?.trim()}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    {sending === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                    Send Reply
                                                </button>
                                                {replyResult[t.id] === 'ok' && (
                                                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Sent!
                                                    </span>
                                                )}
                                                {replyResult[t.id] === 'err' && (
                                                    <span className="flex items-center gap-1 text-xs text-rose-400">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Failed
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-600">User will receive an email notification with your reply.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-slate-500">
                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            No tickets found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
