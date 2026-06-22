'use client'
export const dynamic = 'force-dynamic';
;
import { useState, useEffect } from 'react';
import { Ban, Loader2, Phone, User, Unlock, Infinity, ShieldCheck, Eye, X } from 'lucide-react';

interface UserRow {
    id: string; email: string; phone_number: string | null;
    role: string; is_blocked: boolean; resume_count: number;
    terms_accepted: boolean; created_at: string;
    is_free_override: boolean; free_unlimited: boolean;
    full_name?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    portfolio_url?: string | null;
    college?: string | null;
    skills?: string[] | null;
    experience_level?: string | null;
    referral_source?: string | null;
    target_role?: string | null;
    preferred_work_mode?: string | null;
    professional_summary?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    education?: any | null;
    profile_completed?: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

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
                                                        <span 
                                                            onClick={() => setSelectedUser(u)} 
                                                            className="text-[#171717] font-medium hover:text-indigo-600 hover:underline cursor-pointer transition-colors"
                                                            title="Inspect full profile data"
                                                        >
                                                            {u.email}
                                                        </span>
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
                                                    <button
                                                        onClick={() => setSelectedUser(u)}
                                                        className="p-2 rounded-lg bg-neutral-50 text-[#8F8F8F] hover:text-[#171717] hover:bg-neutral-100 border border-[#EBEBEB] transition-all active:scale-95"
                                                        title="Inspect full profile data"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
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
                                            <span 
                                                onClick={() => setSelectedUser(u)}
                                                className="text-[#171717] font-semibold truncate block hover:text-indigo-600 hover:underline cursor-pointer transition-colors"
                                                title="Inspect full profile data"
                                            >
                                                {u.email}
                                            </span>
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

                                <button
                                    onClick={() => setSelectedUser(u)}
                                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-[#4D4D4D] border border-[#EBEBEB] text-xs font-semibold transition-all active:scale-98 shadow-sm"
                                >
                                    <Eye className="w-4 h-4" /> Inspect User Profile Form
                                </button>

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

            {/* User Profile Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-text">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-[#EBEBEB] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#EBEBEB] bg-[#FAFAFA]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#171717] flex items-center justify-center text-white font-bold">
                                    {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#171717]">{selectedUser.full_name || 'Anonymous User'}</h2>
                                    <p className="text-xs text-[#8F8F8F] font-mono">{selectedUser.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="p-2 rounded-lg hover:bg-neutral-100 text-[#8F8F8F] hover:text-[#171717] transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body: Complete Form Data (Scrollable) */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar text-sm text-[#171717]">
                            
                            {/* Section 1: Core Credentials Form */}
                            <div>
                                <h3 className="text-xs font-bold text-[#8F8F8F] uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">Core Identity Form</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Full Name</label>
                                        <input readOnly value={selectedUser.full_name || ''} className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Email Address</label>
                                        <input readOnly value={selectedUser.email || ''} className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Phone Number</label>
                                        <input readOnly value={selectedUser.phone_number || 'Not Configured'} className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Role & Permissions</label>
                                        <input readOnly value={selectedUser.role.toUpperCase()} className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-bold cursor-default focus:outline-none text-indigo-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Professional Profile Form */}
                            <div>
                                <h3 className="text-xs font-bold text-[#8F8F8F] uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">Professional Profile Form</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Target Job Role</label>
                                        <input readOnly value={selectedUser.target_role || 'Not Configured'} className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Experience Level</label>
                                        <input readOnly value={selectedUser.experience_level || 'Beginner'} className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Work Preference</label>
                                        <input readOnly value={selectedUser.preferred_work_mode || 'Remote'} className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Undergraduate College</label>
                                        <input readOnly value={selectedUser.college || 'Not Configured'} className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Referral Source</label>
                                        <input readOnly value={selectedUser.referral_source || 'Direct'} className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Profile Completed Status</label>
                                        <input readOnly value={selectedUser.profile_completed ? 'COMPLETE' : 'INCOMPLETE'} className={`w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-bold cursor-default focus:outline-none ${selectedUser.profile_completed ? 'text-emerald-600' : 'text-red-500'}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Social & Portfolio Links Form */}
                            <div>
                                <h3 className="text-xs font-bold text-[#8F8F8F] uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">Social & Portfolio Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">LinkedIn URL</label>
                                        {selectedUser.linkedin_url ? (
                                            <a href={selectedUser.linkedin_url} target="_blank" rel="noopener noreferrer" className="block w-full px-3 py-2 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-xs font-medium truncate">
                                                {selectedUser.linkedin_url}
                                            </a>
                                        ) : (
                                            <input readOnly value="No LinkedIn linked" className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none text-[#8F8F8F]" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">GitHub URL</label>
                                        {selectedUser.github_url ? (
                                            <a href={selectedUser.github_url} target="_blank" rel="noopener noreferrer" className="block w-full px-3 py-2 bg-neutral-50 hover:bg-neutral-100 border border-[#EBEBEB] text-[#171717] rounded-lg text-xs font-medium truncate">
                                                {selectedUser.github_url}
                                            </a>
                                        ) : (
                                            <input readOnly value="No GitHub linked" className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none text-[#8F8F8F]" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Portfolio URL</label>
                                        {selectedUser.portfolio_url ? (
                                            <a href={selectedUser.portfolio_url} target="_blank" rel="noopener noreferrer" className="block w-full px-3 py-2 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-xs font-medium truncate">
                                                {selectedUser.portfolio_url}
                                            </a>
                                        ) : (
                                            <input readOnly value="No Portfolio linked" className="w-full px-3 py-2 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs font-medium cursor-default focus:outline-none text-[#8F8F8F]" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Professional Summary Form */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Professional Summary Abstract</label>
                                <textarea readOnly value={selectedUser.professional_summary || 'No professional summary set.'} rows={3} className="w-full px-4 py-3 bg-neutral-50 border border-[#EBEBEB] rounded-lg text-xs leading-relaxed font-medium cursor-default focus:outline-none resize-none font-sans" />
                            </div>

                            {/* Section 5: Skills Inventory Form */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Skills Inventory</label>
                                <div className="flex flex-wrap gap-1.5 p-4 bg-neutral-50 border border-[#EBEBEB] rounded-lg min-h-[50px]">
                                    {Array.isArray(selectedUser.skills) && selectedUser.skills.length > 0 ? (
                                        selectedUser.skills.map((skill: string, index: number) => (
                                            <span key={index} className="bg-white border border-[#EBEBEB] text-[#4D4D4D] text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded shadow-sm">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-[#8F8F8F] italic">No skills listed.</span>
                                    )}
                                </div>
                            </div>

                            {/* Section 6: Education Registry Form */}
                            {selectedUser.education && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">Education Registry Path</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Tenth */}
                                        {selectedUser.education.tenth?.institution && (
                                            <div className="p-4 bg-neutral-50 border border-[#EBEBEB] rounded-xl space-y-1 shadow-sm">
                                                <div className="text-[9px] font-black uppercase tracking-wider text-[#8F8F8F]">Class 10th / Secondary</div>
                                                <div className="font-semibold text-xs text-[#171717]">{selectedUser.education.tenth.institution}</div>
                                                <div className="text-[10px] text-[#4D4D4D] font-medium flex justify-between">
                                                    <span>Passing Year: {selectedUser.education.tenth.passingYear}</span>
                                                    <span>Score: {selectedUser.education.tenth.score}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Twelfth / Diploma */}
                                        {selectedUser.education.diploma?.enabled && selectedUser.education.diploma?.institution ? (
                                            <div className="p-4 bg-neutral-50 border border-[#EBEBEB] rounded-xl space-y-1 shadow-sm">
                                                <div className="text-[9px] font-black uppercase tracking-wider text-[#8F8F8F]">Diploma / Equivalent</div>
                                                <div className="font-semibold text-xs text-[#171717]">{selectedUser.education.diploma.institution}</div>
                                                <div className="text-[10px] text-[#4D4D4D] font-medium flex justify-between">
                                                    <span>Passing Year: {selectedUser.education.diploma.passingYear}</span>
                                                    <span>Score: {selectedUser.education.diploma.score}</span>
                                                </div>
                                            </div>
                                        ) : selectedUser.education.twelfth?.institution ? (
                                            <div className="p-4 bg-neutral-50 border border-[#EBEBEB] rounded-xl space-y-1 shadow-sm">
                                                <div className="text-[9px] font-black uppercase tracking-wider text-[#8F8F8F]">Class 12th / Senior Secondary</div>
                                                <div className="font-semibold text-xs text-[#171717]">{selectedUser.education.twelfth.institution}</div>
                                                <div className="text-[10px] text-[#4D4D4D] font-medium flex justify-between">
                                                    <span>Passing Year: {selectedUser.education.twelfth.passingYear}</span>
                                                    <span>Score: {selectedUser.education.twelfth.score}</span>
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Undergraduate B.Tech */}
                                        {selectedUser.education.btech?.institution && (
                                            <div className="p-4 bg-neutral-50 border border-[#EBEBEB] rounded-xl space-y-1 shadow-sm">
                                                <div className="text-[9px] font-black uppercase tracking-wider text-[#8F8F8F]">Undergraduate / B.Tech</div>
                                                <div className="font-semibold text-xs text-[#171717]">{selectedUser.education.btech.institution}</div>
                                                <div className="text-[10px] text-[#4D4D4D] font-medium flex justify-between">
                                                    <span>Passing Year: {selectedUser.education.btech.passingYear}</span>
                                                    <span>Score: {selectedUser.education.btech.score}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Postgraduate Masters */}
                                        {selectedUser.education.masters?.enabled && selectedUser.education.masters?.institution && (
                                            <div className="p-4 bg-neutral-50 border border-[#EBEBEB] rounded-xl space-y-1 shadow-sm">
                                                <div className="text-[9px] font-black uppercase tracking-wider text-[#8F8F8F]">Postgraduate / Masters</div>
                                                <div className="font-semibold text-xs text-[#171717]">{selectedUser.education.masters.institution}</div>
                                                <div className="text-[10px] text-[#4D4D4D] font-medium flex justify-between">
                                                    <span>Passing Year: {selectedUser.education.masters.passingYear}</span>
                                                    <span>Score: {selectedUser.education.masters.score}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[#EBEBEB] bg-[#FAFAFA] flex justify-end">
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="h-9 px-4 rounded-lg bg-[#171717] hover:bg-[#333333] text-white font-semibold text-xs transition-all shadow-sm"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
