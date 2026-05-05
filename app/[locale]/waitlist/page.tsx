'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle2, Rocket, Users, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function WaitlistPage({ params }: { params: { locale: string } }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        college: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Failed to join waitlist.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#080B16] flex items-center justify-center p-6">
                <div className="max-w-md w-full glass-card p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">You're on the list!</h1>
                    <p className="text-slate-400">
                        Thanks for joining the ResumeForgeAI early access waitlist. We'll email you soon with your exclusive launch offer.
                    </p>
                    <button 
                        onClick={() => window.location.href = `/${params.locale}`}
                        className="w-full py-4 bg-indigo-600 rounded-xl text-white font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080B16] relative overflow-hidden flex flex-col items-center justify-center p-6 pt-40 pb-40">
            {/* Background elements */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Left Side: Content */}
                <div className="space-y-8">
                    <div>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                            Early Access Waitlist
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter leading-[1.1]">
                            Forge Your <span className="text-indigo-500">Future</span> with AI.
                        </h1>
                        <p className="text-slate-400 mt-6 text-xl leading-relaxed">
                            Be the first to experience the most advanced career ecosystem for Indian engineering students. Built to help you scale your career.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-3xl">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">First 100 Users</h4>
                                <p className="text-slate-400 text-sm">Get the ₹499 Premium Plan for FREE (2 Months).</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-3xl">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Everyone Else</h4>
                                <p className="text-slate-400 text-sm">Flat 50% Early-Bird discount on all plans.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#080B16] bg-slate-800" />
                            ))}
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                            <span className="text-white font-bold">1,000+ students</span> already joined the forge.
                        </p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="glass-card p-10 md:p-12 relative">
                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>

                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white tracking-tight">Join the Waitlist</h3>
                        <p className="text-slate-400 text-sm mt-1">Limited spots available for early access.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                            <input 
                                required
                                type="text" 
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                            <input 
                                required
                                type="email" 
                                placeholder="you@college.edu"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone</label>
                                <input 
                                    required
                                    type="tel" 
                                    placeholder="+91..."
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">College</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="University Name"
                                    value={formData.college}
                                    onChange={e => setFormData({...formData, college: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold">
                                {error}
                            </div>
                        )}

                        <button 
                            disabled={isSubmitting}
                            type="submit" 
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                        >
                            {isSubmitting ? 'Joining Forge...' : 'Secure My Early Access'}
                        </button>

                        <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">
                            By joining, you agree to our terms of service.
                        </p>
                    </form>
                </div>
            </div>

            {/* Footer sub-text */}
            <div className="mt-20 flex items-center gap-8 text-slate-600">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure Data</span>
                </div>
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI Verified</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Community Focused</span>
                </div>
            </div>
        </div>
    );
}
