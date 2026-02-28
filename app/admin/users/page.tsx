'use client';
import { useState, useEffect } from 'react';
import { Shield, Ban, CheckCircle, Loader2, Phone, Mail, User, Unlock, Infinity } from 'lucide-react';

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
                    <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight"><User className="w-6 h-6 text-blue-400" />User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">{users.length} registered users</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by email or phone…"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">User</th>
                                <th className="px-5 py-3">Phone</th>
                                <th className="px-5 py-3">Role</th>
                                <th className="px-5 py-3">Resumes</th>
                                <th className="px-5 py-3">T&C</th>
                                <th className="px-5 py-3">Free Override</th>
                                <th className="px-5 py-3">Unlimited</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(u => (
                                <tr key={u.id} className={`hover:bg-white/5 transition-colors ${u.is_blocked ? 'opacity-60' : ''}`}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <span className="text-white">{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-400">
                                        {u.phone_number ? (
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-3 h-3 text-slate-500" />
                                                {u.phone_number}
                                            </div>
                                        ) : <span className="text-slate-600 text-xs">—</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-300">{u.resume_count}</td>
                                    <td className="px-5 py-4 text-xs text-slate-500">
                                        {u.terms_accepted ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-600">—</span>}
                                    </td>
                                    {/* Free Override Toggle */}
                                    <td className="px-5 py-4">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => toggleOverride(u.id, 'is_free_override', u.is_free_override)}
                                                disabled={toggling === `is_free_override-${u.id}`}
                                                title={u.is_free_override ? 'Revoke free override' : 'Grant free override'}
                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${u.is_free_override ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                                                {toggling === `is_free_override-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                                                {u.is_free_override ? 'On' : 'Off'}
                                            </button>
                                        )}
                                    </td>
                                    {/* Unlimited Toggle */}
                                    <td className="px-5 py-4">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => toggleOverride(u.id, 'free_unlimited', u.free_unlimited)}
                                                disabled={toggling === `free_unlimited-${u.id}`}
                                                title={u.free_unlimited ? 'Revoke unlimited' : 'Grant unlimited access'}
                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${u.free_unlimited ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                                                {toggling === `free_unlimited-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Infinity className="w-3 h-3" />}
                                                {u.free_unlimited ? 'On' : 'Off'}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {u.is_blocked
                                            ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 flex items-center gap-1 w-fit"><Shield className="w-3 h-3" />Blocked</span>
                                            : <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 w-fit">Active</span>
                                        }
                                    </td>
                                    <td className="px-5 py-4">
                                        {u.role !== 'admin' && (
                                            <div className="flex gap-2 items-center flex-wrap">
                                                <button
                                                    onClick={() => upgradeUser(u.id)}
                                                    disabled={toggling === `upgrade-${u.id}`}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-50`}>
                                                    {toggling === `upgrade-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>⬆️</span>}
                                                    Upgrade
                                                </button>
                                                <button
                                                    onClick={() => toggleBlock(u.id)}
                                                    disabled={toggling === `block-${u.id}`}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${u.is_blocked ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'} disabled:opacity-50`}>
                                                    {toggling === `block-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                                                    {u.is_blocked ? 'Unblock' : 'Block'}
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(u.id)}
                                                    disabled={toggling === `delete-${u.id}`}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-50`}>
                                                    {toggling === `delete-${u.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>🗑️</span>}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No users found</div>}
                </div>
            )}
        </div>
    );
}
