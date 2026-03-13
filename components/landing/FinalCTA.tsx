"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FinalCTAProps {
  t: (key: string) => string;
  locale: string;
}

export default function FinalCTA({ t, locale }: FinalCTAProps) {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative p-16 md:p-24 rounded-[3rem] bg-gradient-to-br from-[#0c0c1b] via-[#050510] to-[#0c0c1b] border border-white/10 overflow-hidden text-center shadow-[0_40px_100px_-20px_rgba(99,102,241,0.1)]">
          {/* Animated Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-tight max-w-4xl mx-auto">
                Ready to Enter the <br />
                <span className="text-gradient">Forge Ecosystem?</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
                Join 10,000+ professionals using the Forge to automate their career growth and secure high-impact roles.
            </p>
            
            <Button asChild size="lg" variant="premium" className="px-12 h-16 rounded-2xl text-xl shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:shadow-indigo-500/40 group">
              <Link href={`/${locale}/signup`}>
                {t('get_started_free')} 
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </Button>
            
            <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               {/* Placeholders for partner logos */}
               <div className="h-6 w-24 bg-white/20 rounded-md" />
               <div className="h-4 w-20 bg-white/20 rounded-md" />
               <div className="h-5 w-28 bg-white/20 rounded-md" />
               <div className="h-6 w-16 bg-white/20 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
