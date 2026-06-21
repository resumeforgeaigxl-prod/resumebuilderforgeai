"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
    UserCheck, Loader2, ChevronLeft, ChevronRight, 
    Check, Sparkles, AlertCircle, ShieldAlert, Award
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const REFERRAL_OPTIONS = [
    { label: "LinkedIn", value: "linkedin" },
    { label: "Google Search", value: "google" },
    { label: "X / Twitter", value: "twitter" },
    { label: "GitHub", value: "github" },
    { label: "YouTube", value: "youtube" },
    { label: "Friend / Word of Mouth", value: "word_of_mouth" },
    { label: "Other", value: "other" }
];

export default function CompleteProfilePage() {
    const params = useParams() as { locale: string };
    const locale = params.locale || 'en-in';
    const router = useRouter();
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 7;

    const [form, setForm] = useState({
        referralSource: '',
        fullName: '',
        phone: '',
        experience: 'Beginner',
        college: '',
        skills: [] as string[]
    });
    const [skillInput, setSkillInput] = useState('');
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

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = skillInput.trim().replace(/,/g, '');
            if (trimmed && !form.skills.includes(trimmed)) {
                setForm(prev => ({
                    ...prev,
                    skills: [...prev.skills, trimmed]
                }));
            }
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setForm(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Validation per step
    const canContinue = () => {
        switch (currentStep) {
            case 1: return !!form.referralSource;
            case 2: return !!form.fullName.trim();
            case 3: return form.phone.length >= 10;
            case 4: return !!form.experience;
            case 5: return !!form.college.trim();
            case 6: return form.skills.length > 0;
            case 7: return termsAccepted;
            default: return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canContinue()) return;
        
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/user/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: form.fullName,
                    phone: form.phone,
                    college: form.college,
                    skills: form.skills.join(', '),
                    experience: form.experience,
                    referralSource: form.referralSource
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update profile');
            }

            router.push(`/${locale}/dashboard?onboarding=success`);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
            setCurrentStep(7); // Jump back to review screen to display error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 relative select-none font-sans"
            style={{
                backgroundImage: 'radial-gradient(#EBEBEB 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
            }}
        >
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in {
                    animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />

            <div className="w-full max-w-xl z-10 animate-slide-in">
                <div className="bg-white border border-[#EBEBEB] p-8 md:p-10 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02),0_16px_32px_-8px_rgba(0,0,0,0.05)] relative">
                    
                    {/* Brand Identifier */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#171717] rounded-full flex items-center justify-center font-bold text-white text-[10px] tracking-tight border border-[#171717] shadow-sm select-none">
                                RF
                            </div>
                            <span className="text-[#171717] font-semibold text-xs tracking-tight">Onboarding</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">
                            Step {currentStep} of {totalSteps}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#FAFAFA] border border-[#EBEBEB] h-1.5 rounded-full overflow-hidden mb-8">
                        <div 
                            className="bg-[#171717] h-full transition-all duration-300 rounded-full"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>

                    {/* Form Screen wrapper */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* STEP 1: Referral */}
                        {currentStep === 1 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Where did you find out about us?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Help us understand how you discovered the ResumeForge AI platform.</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                                    {REFERRAL_OPTIONS.map((opt) => {
                                        const isSelected = form.referralSource === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setForm(prev => ({ ...prev, referralSource: opt.value }));
                                                    setTimeout(nextStep, 250); // Small delay for visual selection feedback
                                                }}
                                                className={`px-4 py-3 border text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#171717] border-[#171717] text-white shadow-sm'
                                                        : 'bg-white border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA] hover:text-[#171717]'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Full Name */}
                        {currentStep === 2 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">What is your full name?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Please enter your complete professional name for the resumes.</p>
                                </div>
                                <div className="pt-2">
                                    <input 
                                        type="text"
                                        required
                                        autoFocus
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        className="w-full px-5 py-4 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-sm"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Phone */}
                        {currentStep === 3 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">What is your mobile number?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Required for secure job application contact fields.</p>
                                </div>
                                <div className="pt-2">
                                    <input 
                                        type="tel"
                                        required
                                        autoFocus
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                                        className="w-full px-5 py-4 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-sm"
                                        placeholder="Enter 10-digit number"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Experience */}
                        {currentStep === 4 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">What is your career level?</h2>
                                    <p className="text-xs text-[#8F8F8F]">This adjusts the baseline suggestions of our AI engine.</p>
                                </div>
                                <div className="flex flex-col gap-3 pt-2">
                                    {[
                                        { level: 'Beginner', title: 'Beginner / Student', desc: 'Entry-level credentials, college degree, or self-taught seeker.' },
                                        { level: 'Intermediate', title: 'Intermediate Professional', desc: '1 to 3 years of active engineering role experience.' },
                                        { level: 'Senior', title: 'Senior Leader', desc: '4+ years of leading architectures, tech stacks, or engineering teams.' }
                                    ].map((opt) => {
                                        const isSelected = form.experience === opt.level;
                                        return (
                                            <button
                                                key={opt.level}
                                                type="button"
                                                onClick={() => {
                                                    setForm(prev => ({ ...prev, experience: opt.level }));
                                                    setTimeout(nextStep, 250);
                                                }}
                                                className={`p-4 text-left border rounded-xl transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-white border-[#171717] ring-1 ring-[#171717]'
                                                        : 'bg-white border-[#EBEBEB] hover:bg-[#FAFAFA]'
                                                }`}
                                            >
                                                <div className="font-semibold text-xs text-[#171717]">{opt.title}</div>
                                                <div className="text-[11px] text-[#8F8F8F] mt-1">{opt.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 5: College/Institution */}
                        {currentStep === 5 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Where are you currently active?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Enter your university name or current company employer.</p>
                                </div>
                                <div className="pt-2">
                                    <input 
                                        type="text"
                                        required
                                        autoFocus
                                        value={form.college}
                                        onChange={e => setForm({ ...form, college: e.target.value })}
                                        className="w-full px-5 py-4 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-sm"
                                        placeholder="University, College, or Company name"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 6: Skills */}
                        {currentStep === 6 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">What are your technical skills?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Type a skill (e.g. React) and press Enter or comma to log it.</p>
                                </div>
                                <div className="space-y-4 pt-2">
                                    <input 
                                        type="text"
                                        autoFocus
                                        value={skillInput}
                                        onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                        className="w-full px-5 py-4 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-sm"
                                        placeholder="Add skill (e.g., Python, Docker)"
                                    />
                                    
                                    <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl">
                                        {form.skills.length === 0 ? (
                                            <span className="text-xs text-[#8F8F8F] self-center pl-2 italic">No skills added yet...</span>
                                        ) : (
                                            form.skills.map((skill) => (
                                                <span 
                                                    key={skill} 
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#EBEBEB] text-[#171717] font-semibold text-xs rounded-md shadow-sm select-none"
                                                >
                                                    {skill}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="text-[#8F8F8F] hover:text-red-500 font-bold ml-1"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 7: Terms & Finish */}
                        {currentStep === 7 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Review & Integration</h2>
                                    <p className="text-xs text-[#8F8F8F]">Accept terms to complete the setup and start using the Forges.</p>
                                </div>

                                <div className="p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl space-y-2 text-xs text-[#4D4D4D]">
                                    <div><strong>Name</strong>: {form.fullName}</div>
                                    <div><strong>Contact</strong>: {form.phone}</div>
                                    <div><strong>Level</strong>: {form.experience}</div>
                                    <div><strong>Institution</strong>: {form.college}</div>
                                    <div className="truncate"><strong>Skills</strong>: {form.skills.join(', ')}</div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={e => setTermsAccepted(e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded border-[#EBEBEB] bg-[#FAFAFA] text-[#171717] focus:ring-[#171717]/25 cursor-pointer accent-[#171717]"
                                        />
                                        <span className="text-xs text-[#8F8F8F] group-hover:text-[#4D4D4D] transition-colors leading-relaxed">
                                            I accept the <a href="/terms" className="text-[#171717] font-semibold hover:underline">Terms & Conditions</a> and agree to allow AI-guided telemetry.
                                        </span>
                                    </label>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Panel */}
                        <div className="flex items-center justify-between pt-6 border-t border-[#EBEBEB]">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="text-xs font-semibold text-[#8F8F8F] hover:text-[#171717] flex items-center gap-1 py-2 cursor-pointer transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!canContinue()}
                                    className={`px-5 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer select-none ${
                                        canContinue()
                                            ? 'bg-[#171717] hover:bg-[#333333] text-white active:scale-98'
                                            : 'bg-[#FAFAFA] border border-[#EBEBEB] text-[#8F8F8F] cursor-not-allowed'
                                    }`}
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <Button 
                                    type="submit"
                                    disabled={isLoading || !termsAccepted}
                                    className={`px-6 py-2.5 rounded-lg font-semibold text-xs tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer ${
                                        termsAccepted ? 'bg-[#171717] hover:bg-[#333333] text-white shadow-[#171717]/10' : 'bg-[#FAFAFA] text-[#8F8F8F] border border-[#EBEBEB]'
                                    }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                    ) : (
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            Complete Onboarding
                                        </div>
                                    )}
                                </Button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

