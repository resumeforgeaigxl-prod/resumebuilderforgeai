export const dynamic = 'force-dynamic';
import ShareExperienceForm from '@/components/interview-prep/ShareExperienceForm';
import { Sparkles, Trophy, ShieldHalf } from 'lucide-react';

export default function ShareInterviewPage() {
    return (
        <div className="min-h-screen pt-12 pb-24 px-4 sm:px-8 bg-slate-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full -z-10" />

            {/* Header Content */}
            <div className="max-w-4xl mx-auto text-center mb-16 relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6 animate-fade-in-down">
                    <Sparkles className="w-3.5 h-3.5" /> Crowdsourced Intelligence
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent italic">
                    Help Others Conquer Interviews
                </h1>

                <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                    Sharing your real interview experience helps thousands of other candidates prepare better. Your input fuels our verified intelligence system.
                </p>

                {/* Micro stats for trust */}
                <div className="flex flex-wrap justify-center gap-8 mt-12 opacity-80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <ShieldHalf className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="text-left">
                            <div className="text-white font-black text-sm uppercase tracking-wider">100% Anonymous</div>
                            <div className="text-slate-500 text-[10px]">Your identity is never shown</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-left">
                            <div className="text-white font-black text-sm uppercase tracking-wider">Verified Only</div>
                            <div className="text-slate-500 text-[10px]">Every entry is human-verified</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="relative z-10 px-2 sm:px-0">
                <ShareExperienceForm />
            </div>

            {/* Subtle Footer Note */}
            <div className="mt-20 text-center">
                <p className="text-slate-600 text-xs font-medium">
                    By contributing, you become part of the ResumeForgeAI contributor circle. <br />
                    Verified contributors get exclusive access to premium company insights.
                </p>
            </div>
        </div>
    );
}
