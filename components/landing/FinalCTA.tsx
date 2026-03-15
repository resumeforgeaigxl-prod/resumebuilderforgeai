"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FinalCTAProps {
  t: (key: string) => string;
  locale: string;
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative p-16 md:p-24 rounded-[3rem] bg-gradient-to-br from-[#0c0c1b] via-[#050510] to-[#0c0c1b] border border-white/10 overflow-hidden text-center shadow-[0_40px_100px_-20px_rgba(99,102,241,0.1)]">
          {/* Animated Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-tight max-w-4xl mx-auto">
              Start Building <br />
              <span className="text-gradient">Your Career With AI</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
              Create your resume, explore the ecosystem, and begin preparing for your next opportunity.
            </p>
            
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 px-12 h-16 rounded-2xl text-xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] font-bold group">
              <Link href={`/${locale}/signup`}>
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </Button>

            <div className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                Precision Forged For Developers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
