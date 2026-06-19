'use client'
export const dynamic = 'force-dynamic';
;

import ShareExperienceForm from '@/components/interview-prep/ShareExperienceForm';
import { Sparkles, Trophy, ShieldHalf } from 'lucide-react';

export default function ShareInterviewPage() {
    return (
        <div className="min-h-screen pt-20 pb-20 px-4 sm:px-8 bg-[#FAFAFA] text-[#171717] relative overflow-hidden">
            {/* Header Content */}
            <div className="max-w-4xl mx-auto text-center mb-12 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070F3]/5 border border-[#0070F3]/10 text-[#0070F3] text-xs font-semibold uppercase tracking-wider mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-[#0070F3]" /> Crowdsourced Intelligence
                </div>

                <h1 className="text-3xl sm:text-5xl font-semibold text-[#171717] tracking-tight mb-6 font-sans">
                    Help Others Conquer Interviews
                </h1>

                <p className="text-[#4D4D4D] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                    Sharing your real interview experience helps thousands of other candidates prepare better. Your input fuels our verified intelligence system.
                </p>

                {/* Micro stats for trust */}
                <div className="flex flex-wrap justify-center gap-6 mt-10">
                    <div className="flex items-center gap-3 px-5 py-3 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-[#0070F3]/5 border border-[#0070F3]/10 flex items-center justify-center">
                            <ShieldHalf className="w-4.5 h-4.5 text-[#0070F3]" />
                        </div>
                        <div className="text-left">
                            <div className="text-[#171717] font-semibold text-xs uppercase tracking-wider leading-tight">100% Anonymous</div>
                            <div className="text-[#8F8F8F] text-[10px] font-medium mt-0.5">Your identity is never shown</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-3 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Trophy className="w-4.5 h-4.5 text-emerald-600" />
                        </div>
                        <div className="text-left">
                            <div className="text-[#171717] font-semibold text-xs uppercase tracking-wider leading-tight">Verified Only</div>
                            <div className="text-[#8F8F8F] text-[10px] font-medium mt-0.5">Every entry is human-verified</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="relative z-10 px-2 sm:px-0">
                <ShareExperienceForm />
            </div>

            {/* Subtle Footer Note */}
            <div className="mt-16 text-center">
                <p className="text-[#8F8F8F] text-xs font-medium max-w-md mx-auto leading-relaxed">
                    By contributing, you become part of the ResumeForgeAI contributor circle. <br />
                    Verified contributors get exclusive access to premium company insights.
                </p>
            </div>
        </div>
    );
}
