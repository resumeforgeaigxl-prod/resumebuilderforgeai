'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Send, Building2, Briefcase,
    HelpCircle, AlertCircle, CheckCircle2,
    Layout, ArrowLeft, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROUNDS = [
    'Online Assessment',
    'Aptitude Test',
    'Technical Interview',
    'System Design',
    'HR Interview'
] as const;

const formSchema = z.object({
    companyName: z.string().min(2, 'Company name is required'),
    roleName: z.string().min(2, 'Role name is required'),
    roundType: z.enum(ROUNDS),
    questionText: z.string().min(5, 'Please provide the question text'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ShareExperienceForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roundType: 'Technical Interview',
            difficulty: 'Medium',
        }
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/interview-prep/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || 'Failed to submit experience');
            }
        } catch {
            setError('Submission failed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = async () => {
        const fieldsToValidate = step === 1
            ? ['companyName', 'roleName'] as const
            : ['roundType', 'questionText', 'difficulty'] as const;

        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep(s => s + 1);
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto p-12 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center backdrop-blur-xl shadow-2xl"
            >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Experience Shared!</h2>
                <p className="text-emerald-100/70 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                    Your interview intelligence has been sent for moderation. Once verified, it will help thousands of other candidates.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/20"
                >
                    Share Another Experience
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Multi-step progress bar */}
            <div className="flex items-center justify-between mb-12 px-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 ${step >= i ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                            {i}
                        </div>
                        {i < 3 && <div className={`h-1 flex-1 mx-4 rounded-full transition-all duration-700 ${step > i ? 'bg-indigo-500' : 'bg-white/5'}`} />}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/5 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center ring-1 ring-indigo-500/30">
                                    <Building2 className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Basic Context</h2>
                                    <p className="text-slate-400 text-sm">Where and for what role did you interview?</p>
                                </div>
                            </div>

                            <div className="grid gap-8">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Target Company</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input {...register('companyName')}
                                            placeholder="e.g. Google, Amazon, Zerodha"
                                            className="w-full pl-12 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-600" />
                                    </div>
                                    {errors.companyName && <p className="text-rose-400 text-xs mt-3 flex items-center gap-2 font-medium px-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.companyName.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Applied Role</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input {...register('roleName')}
                                            placeholder="e.g. SDE-1, Product Designer"
                                            className="w-full pl-12 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-600" />
                                    </div>
                                    {errors.roleName && <p className="text-rose-400 text-xs mt-3 flex items-center gap-2 font-medium px-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.roleName.message}</p>}
                                </div>
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button type="button" onClick={nextStep}
                                    className="group flex items-center gap-3 px-10 py-5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95">
                                    Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/5 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center ring-1 ring-indigo-500/30">
                                    <HelpCircle className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">The Content</h2>
                                    <p className="text-slate-400 text-sm">Details about the round and questions.</p>
                                </div>
                            </div>

                            <div className="grid gap-10">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Interview Round</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {ROUNDS.map(r => (
                                            <label key={r} className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer font-bold text-xs text-center ${watch('roundType') === r ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}>
                                                <input type="radio" {...register('roundType')} value={r} className="hidden" />
                                                {r}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Questions Asked</label>
                                    <div className="relative group">
                                        <textarea {...register('questionText')}
                                            placeholder="What specifically did they ask? Paste coding problem links or describe the discussion..."
                                            rows={5}
                                            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-3xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-600 resize-none" />
                                    </div>
                                    {errors.questionText && <p className="text-rose-400 text-xs mt-3 flex items-center gap-2 font-medium px-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.questionText.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Overall Difficulty</label>
                                    <div className="flex gap-4">
                                        {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                                            <label key={d} className={`flex-1 py-4 rounded-xl border-2 transition-all cursor-pointer font-black text-xs text-center uppercase tracking-widest ${watch('difficulty') === d ? (d === 'Easy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : d === 'Medium' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-rose-500/20 border-rose-500 text-rose-400') : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}>
                                                <input type="radio" {...register('difficulty')} value={d} className="hidden" />
                                                {d}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-between items-center">
                                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-all px-4">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button type="button" onClick={nextStep}
                                    className="group flex items-center gap-3 px-10 py-5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20">
                                    Last Look <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/5 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center ring-1 ring-indigo-500/30">
                                    <Send className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Final Details</h2>
                                    <p className="text-slate-400 text-sm">Anything else you want to share?</p>
                                </div>
                            </div>

                            <div className="grid gap-8">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Additional Notes (Optional)</label>
                                    <textarea {...register('notes')}
                                        placeholder="Any tips for future candidates? Culture fit questions? Soft skills?"
                                        rows={4}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-3xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-600 resize-none" />
                                </div>

                                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-indigo-400 shrink-0" />
                                    <p className="text-xs text-indigo-200/60 leading-relaxed font-medium">
                                        By submitting, you agree to share this experience anonymously with the ResumeForgeAI community. Our AI and admin team will review and verify the question within 24-48 hours.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-bold animate-pulse">
                                    <AlertCircle className="w-5 h-5" /> {error}
                                </div>
                            )}

                            <div className="mt-12 flex justify-between items-center">
                                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-all px-4">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button type="submit" disabled={loading}
                                    className="group flex items-center gap-3 px-12 py-5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20">
                                    {loading ? (
                                        <><Layout className="w-5 h-5 animate-spin" /> Submitting...</>
                                    ) : (
                                        <><Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Publish Experience</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
}
