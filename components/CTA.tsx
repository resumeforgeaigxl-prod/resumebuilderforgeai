"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Wand2} from 'lucide-react';
import { DEFAULT_LOCALE, fadeInScale, fadeInUp } from "@/lib/constants";

type CTAProps = {
  locale?: string;
};

export default function CTA({ locale = DEFAULT_LOCALE }: CTAProps) {
  return (
    <section className="px-4 md:px-6 py-24 sm:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-5xl">
        <motion.div
          {...fadeInScale()}
          className="relative overflow-hidden rounded-[2.5rem] sm:rounded-[4rem] border border-white/10 bg-[#080B16] px-6 py-16 sm:px-12 sm:py-24 shadow-[0_40px_100px_-30px_rgba(0,212,160,0.2)] text-center flex flex-col items-center"
        >
          {/* Brand Colored Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[200px] bg-[#00D4A0]/15 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[200px] bg-[#7C5CFC]/15 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none" />

          <motion.div {...fadeInUp(0.08)} className="relative z-10 max-w-3xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00D4A0]/30 bg-[#00D4A0]/10 px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#00D4A0] backdrop-blur-sm shadow-[0_0_20px_rgba(0,212,160,0.15)] mb-8">
              <Wand2 className="w-3.5 h-3.5" />
              <span>The Next Step</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Start Forging Your <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4A0] to-[#7C5CFC]">Tech Career Today.</span>
            </h2>
            
            <p className="mt-8 text-base sm:text-lg text-slate-400 font-medium max-w-2xl leading-relaxed">
              Build a stronger profile, follow a smarter roadmap, and prepare
              with AI-driven insights from day one. Join the ecosystem and accelerate your momentum.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <Link
                href={`/${locale}/signup`}
                className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm sm:text-base font-bold text-[#080B16] transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
