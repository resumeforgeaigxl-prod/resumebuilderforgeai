"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserCheck, Loader2, Sparkles, Building2, MapPin, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CompleteProfilePage() {
    const params = useParams() as { locale: string };
    const { locale } = params;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        college: '',
        skills: '',
        experience: 'Beginner'
    });

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) {
                router.push(`/${locale}/login`);
                return;
            }
            const data = await res.json();
            if (data.user) {
                setForm(prev => ({
                    ...prev,
                    fullName: data.user.full_name || '',
                    phone: data.user.phone_number || ''
                }));
            }
        } catch (err) {
            console.error("Auth check failed", err);
        }
    }, [locale, router]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/user/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update profile');
            }

            // SUCCESS!
            router.push(`/${locale}/dashboard?onboarding=success`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-xl z-10">
                <Card glass className="p-10 border-white/5 bg-white/[0.02] rounded-[3rem] shadow-2xl">
                    <div className="text-center mb-10 space-y-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
                            <Sparkles className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Let&apos;s Finish Your Profile</h1>
                        <p className="text-slate-500 font-medium">Capture your context to get personalized AI resume guidance.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Full Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input 
                                    type="text"
                                    required
                                    value={form.fullName}
                                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                    placeholder="Enter your legal name..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">College/University</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input 
                                        type="text"
                                        required
                                        value={form.college}
                                        onChange={e => setForm({ ...form, college: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                        placeholder="University name..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Experience Level</label>
                                <select 
                                    value={form.experience}
                                    onChange={e => setForm({ ...form, experience: e.target.value })}
                                    className="w-full px-6 py-4 bg-[#0c0c1b] border border-white/10 rounded-2xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="Beginner">Beginner (Student)</option>
                                    <option value="Intermediate">Intermediate (1-3 Years)</option>
                                    <option value="Senior">Senior (4+ Years)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Primary Skills (Comma Separated)</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input 
                                    type="text"
                                    required
                                    value={form.skills}
                                    onChange={e => setForm({ ...form, skills: e.target.value })}
                                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                    placeholder="React, Node.js, Python..."
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest italic">
                                ERROR_LOG: {error}
                            </div>
                        )}

                        <Button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-10 rounded-[2rem] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <UserCheck className="w-4 h-4 fill-slate-950" />
                                    Launch Dashboard
                                </div>
                            )}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
