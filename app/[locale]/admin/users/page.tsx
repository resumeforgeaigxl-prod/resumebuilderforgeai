'use client'
export const dynamic = 'force-dynamic';
;
import { useState, useEffect } from 'react';
import { Ban, Loader2, Phone, User, Unlock, Infinity, ShieldCheck } from 'lucide-react';

interface UserRow {
    id: string; email: string; phone_number: string | null;
    role: string; is_blocked: boolean; resume_count: number;
    terms_accepted: boolean; created_at: string;
    is_free_override: boolean; free_unlimited: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    async function loadUsers() {
        setLoading(true);
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.success) setUsers(data.users);
        setLoading(false);
    }

    useEffect(() => { loadUsers(); }, []);

    async function toggleBlock(userId: string) {
        setToggling(`block-${userId}`);
        const res = await fetch(`/api/admin/users/${userId}/block`, { method: 'POST' });
        if (res.ok) await loadUsers();
        setToggling(null);
    }

    async function upgradeUser(userId: string) {
        if (!confirm('Are you sure you want to upgrade this user to Pro (1 month free)?')) return;
        setToggling(`upgrade-${userId}`);
        const res = await fetch(`/api/admin/users/${userId}/upgrade`, { method: 'POST' });
        if (res.ok) {
            alert('User upgraded to Pro successfully!');
        } else {
            alert('Failed to upgrade user.');
        }
        await loadUsers();
        setToggling(null);
    }

    async function toggleRole(userId: string, currentRole: string) {
        const newRole = currentRole === 'recruiter' ? 'user' : 'recruiter';
        if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;
        setToggling(`role-${userId}`);
        const res = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });
        if (res.ok) {
            await loadUsers();
        } else {
            alert('Failed to change user role.');
        }
        setToggling(null);
    }

    async function deleteUser(userId: string) {
        if (!confirm('WARNING: Are you sure you want to permanently delete this user? This cannot be undone.')) return;
        setToggling(`delete-${userId}`);
        const res = await fetch(`/api/admin/users/${userId}/delete`, { method: 'POST' });
        if (res.ok) {
            await loadUsers();
        } else {
            alert('Failed to delete user.');
        }
        setToggling(null);
    }

    async function toggleOverride(userId: string, field: 'is_free_override' | 'free_unlimited', current: boolean) {
        setToggling(`${field}-${userId}`);
        await fetch(`/api/admin/users/${userId}/override`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, value: !current }),
        });
        await loadUsers();
        setToggling(null);
    }

    const filtered = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone_number?.includes(search)
    );

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight"><User className="w-6 h-6 text-blue-600" />User Management</h1>
                    <p className="text-[#8F8F8F] text-sm mt-1">{users.length} registered users</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by email or phone…"
                        className="w-full px-4 py-2 bg-white border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm min-w-max">
                                <thead className="border-b border-[#EBEBEB] bg-white/[0.02]">
                                    <tr className="text-left text-xs text-[#8F8F8F] uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">User</th>
                                        <th className="px-6 py-4 font-semibold text-center">Resumes</th>
                                        <th className="px-6 py-4 font-semibold">Access Controls</th>
                                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EBEBEB]">
                                    {filtered.map(u => (
                                        <tr key={u.id} className={`hover:bg-white transition-colors group ${u.is_blocked ? 'bg-red-500/5' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[#171717] font-medium">{u.email}</span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tighter ${u.role === 'admin' ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-blue-50 border border-blue-100 text-blue-600'}`}>
                                                            {u.role}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {u.phone_number ? (
                                                            <div className="flex items-center gap-1 text-[11px] text-[#8F8F8F]">
                                                                <Phone className="w-3 h-3" />
                                                                {u.phone_number}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] text-[#8F8F8F]">No phone</span>
                                                        )}
                                                        <span className="text-[#8F8F8F] underline decoration-slate-800">•</span>
                                                        <span className="text-[11px] text-[#8F8F8F]">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-[#EBEBEB] text-[#171717] font-bold">
                                                    {u.resume_count}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {u.role !== 'admin' && (
                                                        <>
                                                            <button
                                                                onClick={() => toggleOverride(u.id, 'is_free_override', u.is_free_override)}
                                                                disabled={toggling === `is_free_override-${u.id}`}
                                                                title={u.is_free_override ? 'Revoke free override' : 'Grant free override'}
                                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${u.is_free_override ? 'bg-emerald-50 border border-emerald-100 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/30' : 'bg-white text-[#8F8F8F] border-[#EBEBEB] hover:bg-neutral-100'}`}>
                                                                {toggling === `is_free_override-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                                                                Free
                                                            </button>
                                                            <button
                                                                onClick={() => toggleOverride(u.id, 'free_unlimited', u.free_unlimited)}
                                                                disabled={toggling === `free_unlimited-${u.id}`}
                                                                title={u.free_unlimited ? 'Revoke unlimited' : 'Grant unlimited access'}
                                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${u.free_unlimited ? 'bg-purple-50 border border-purple-100 text-purple-600 border-purple-500/20 hover:bg-purple-500/30' : 'bg-white text-[#8F8F8F] border-[#EBEBEB] hover:bg-neutral-100'}`}>
                                                                {toggling === `free_unlimited-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Infinity className="w-3 h-3" />}
                                                                Unlimited
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {u.is_blocked
                                                        ? <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 border border-red-100 text-red-600 flex items-center gap-1.5 border border-red-500/20 uppercase tracking-tighter"><Ban className="w-3 h-3" />Blocked</span>
                                                        : <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-600 border border-emerald-500/20 uppercase tracking-tighter">Active</span>
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {u.role !== 'admin' && (
                                                        <>
                                                            <button
                                                                onClick={() => toggleRole(u.id, u.role)}
                                                                disabled={toggling === `role-${u.id}`}
                                                                className={`p-2 rounded-lg transition-all active:scale-95 border ${u.role === 'recruiter' ? 'bg-purple-50 text-purple-600 border-purple-500/20 hover:bg-purple-50 border border-purple-100' : 'bg-slate-500/10 text-[#8F8F8F] border-slate-500/20 hover:bg-slate-500/20'}`}
                                                                title={u.role === 'recruiter' ? 'Revoke Recruiter Access' : 'Grant Recruiter Access'}
                                                            >
                                                                {toggling === `role-${u.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => upgradeUser(u.id)}
                                                                disabled={toggling === `upgrade-${u.id}`}
                                                                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 border border-indigo-500/20 transition-all active:scale-95"
                                                                title="Upgrade to Pro"
                                                            >
                                                                {toggling === `upgrade-${u.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>⬆️</span>}
                                                            </button>
                                                            <button
                                                                onClick={() => toggleBlock(u.id)}
                                                                disabled={toggling === `block-${u.id}`}
                                                                className={`p-2 rounded-lg transition-all active:scale-95 border ${u.is_blocked ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20 hover:bg-emerald-50 border border-emerald-100' : 'bg-red-50 text-red-500 border-red-500/20 hover:bg-red-50 border border-red-100'}`}
                                                                title={u.is_blocked ? 'Unblock user' : 'Block user'}
                                                            >
                                                                {toggling === `block-${u.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => deleteUser(u.id)}
                                                                disabled={toggling === `delete-${u.id}`}
                                                                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95"
                                                                title="Delete User"
                                                            >
                                                                {toggling === `delete-${u.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>🗑️</span>}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filtered.map(u => (
                            <div key={u.id} className={`bg-white border border-[#EBEBEB] rounded-2xl p-5 space-y-4 ${u.is_blocked ? 'bg-red-500/5' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[#171717] font-semibold truncate block">{u.email}</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tighter shrink-0 ${u.role === 'admin' ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-blue-50 border border-blue-100 text-blue-600'}`}>
                                                {u.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-[#8F8F8F]">
                                            {u.phone_number && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3" />
                                                    {u.phone_number}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {u.is_blocked
                                            ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 border border-red-100 text-red-600 border border-red-500/20 uppercase tracking-tighter">Blocked</span>
                                            : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-600 border border-emerald-500/20 uppercase tracking-tighter">Active</span>
                                        }
                                        <div className="text-[10px] text-[#8F8F8F] font-bold uppercase tracking-widest">
                                            {u.resume_count} Resumes
                                        </div>
                                    </div>
                                </div>

                                {u.role !== 'admin' && (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EBEBEB]">
                                        <button
                                            onClick={() => toggleOverride(u.id, 'is_free_override', u.is_free_override)}
                                            disabled={toggling === `is_free_override-${u.id}`}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${u.is_free_override ? 'bg-emerald-50 border border-emerald-100 text-emerald-600 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-white text-[#8F8F8F] border-[#EBEBEB]'}`}>
                                            {toggling === `is_free_override-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                                            Free
                                        </button>
                                        <button
                                            onClick={() => toggleOverride(u.id, 'free_unlimited', u.free_unlimited)}
                                            disabled={toggling === `free_unlimited-${u.id}`}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${u.free_unlimited ? 'bg-purple-50 border border-purple-100 text-purple-600 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]' : 'bg-white text-[#8F8F8F] border-[#EBEBEB]'}`}>
                                            {toggling === `free_unlimited-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Infinity className="w-3 h-3" />}
                                            Unlimited
                                        </button>
                                    </div>
                                )}

                                {u.role !== 'admin' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => toggleRole(u.id, u.role)}
                                            disabled={toggling === `role-${u.id}`}
                                            className={`flex items-center justify-center py-2 rounded-xl border text-xs font-semibold ${u.role === 'recruiter' ? 'bg-purple-50 text-purple-600 border-purple-500/20' : 'bg-slate-500/10 text-[#8F8F8F] border-slate-500/20'}`}
                                        >
                                            {toggling === `role-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : (u.role === 'recruiter' ? 'Revoke Recruiter' : 'Make Recruiter')}
                                        </button>
                                        <button
                                            onClick={() => upgradeUser(u.id)}
                                            disabled={toggling === `upgrade-${u.id}`}
                                            className="flex items-center justify-center py-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-500/20 text-xs font-semibold"
                                        >
                                            {toggling === `upgrade-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Upgrade'}
                                        </button>
                                        <button
                                            onClick={() => toggleBlock(u.id)}
                                            disabled={toggling === `block-${u.id}`}
                                            className={`flex items-center justify-center py-2 rounded-xl border text-xs font-semibold ${u.is_blocked ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20' : 'bg-red-50 text-red-500 border-red-500/20'}`}
                                        >
                                            {toggling === `block-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : (u.is_blocked ? 'Unblock' : 'Block')}
                                        </button>
                                        <button
                                            onClick={() => deleteUser(u.id)}
                                            disabled={toggling === `delete-${u.id}`}
                                            className="flex items-center justify-center py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold"
                                        >
                                            {toggling === `delete-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Delete'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-white border border-[#EBEBEB] rounded-2xl">
                            <User className="w-12 h-12 text-[#8F8F8F] mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold text-[#8F8F8F]">No users found</h3>
                            <p className="text-sm text-[#8F8F8F] mt-1">Try adjusting your search filters.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
