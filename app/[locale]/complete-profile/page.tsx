"use client"
export const dynamic = 'force-dynamic';
;

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserCheck, Loader2 , Wand2 } from 'lucide-react';
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
    const [termsAccepted, setTermsAccepted] = useState(false);

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setForm(prev => ({
                        ...prev,
                        fullName: data.user.full_name || '',
                        phone: data.user.phone_number || ''
                    }));
                }
            }
        } catch (err) {
            console.error("Auth check failed", err);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const isPhoneValid = form.phone.length >= 10;
    const isFormValid = form.fullName && isPhoneValid && form.college && form.skills && termsAccepted;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        
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

            router.push(`/${locale}/dashboard?onboarding=success`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-xl z-10">
                <Card glass className="p-8 md:p-10 border-white/5 bg-white/[0.02] rounded-[2.5rem] shadow-2xl">
                    <div className="text-center mb-8 space-y-3">
                        <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner mb-4">
                            <UserCheck className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Complete Your Profile</h1>
                        <p className="text-slate-400 font-medium text-sm">Welcome aboard! Let&apos;s personalize your experience.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1 ml-1">Full Name</label>
                            <input 
                                type="text"
                                required
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1 ml-1">Phone Number</label>
                                <input 
                                    type="tel"
                                    required
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                    placeholder="Mobile number"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1 ml-1">Experience Level</label>
                                <select 
                                    value={form.experience}
                                    onChange={e => setForm({ ...form, experience: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-[#0a0a1a] border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium cursor-pointer"
                                >
                                    <option value="Beginner">Beginner (Student)</option>
                                    <option value="Intermediate">Intermediate (1-3 yrs)</option>
                                    <option value="Senior">Senior (4+ yrs)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1 ml-1">College/Institution</label>
                            <input 
                                type="text"
                                required
                                value={form.college}
                                onChange={e => setForm({ ...form, college: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                placeholder="University or current company"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1 ml-1">Top Skills (comma separated)</label>
                            <input 
                                type="text"
                                required
                                value={form.skills}
                                onChange={e => setForm({ ...form, skills: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                placeholder="React, Python, AWS..."
                            />
                        </div>

                        <div className="pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={e => setTermsAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
                                />
                                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                                    I accept the <a href="/terms" className="text-emerald-500 hover:underline">Terms & Conditions</a> and agree to provide accurate information for career guidance.
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                                ERROR: {error}
                            </div>
                        )}

                        <Button 
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className={`w-full py-7 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl active:scale-95 ${
                                isFormValid ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20' : 'bg-white/5 text-slate-600 border border-white/5'
                            }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Wand2 className="w-4 h-4" />
                                    Complete Integration
                                </div>
                            )}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
