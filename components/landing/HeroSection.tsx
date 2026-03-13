"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeroSectionProps {
  t: (key: string) => string;
  locale: string;
}

export default function HeroSection({ t, locale }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none opacity-40" />
      
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-10 shadow-xl"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-200 tracking-[0.2em] uppercase">
            Forge Ecosystem v2.0
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] max-w-5xl"
        >
          <span className="text-white">Forge Your</span> <br />
          <span className="text-gradient">Career Destiny.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed font-medium"
        >
          Build ATS-optimized resumes, master coding challenges, and ace interviews with our AI-powered ecosystem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button asChild size="lg" variant="premium" className="px-10 h-14 rounded-xl text-lg group">
            <Link href={`/${locale}/signup`}>
              {t("build_resume_free")}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="glass" className="px-10 h-14 rounded-xl text-lg">
            <Link href={`/${locale}/login`}>
              {t("view_dashboard")}
            </Link>
          </Button>
        </motion.div>

        {/* Hero Image/UI Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 w-full max-w-6xl relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative rounded-2xl border border-white/10 bg-[#0c0c14] overflow-hidden shadow-2xl overflow-hidden aspect-[16/9]">
            <div className="absolute top-0 left-0 right-0 h-10 bg-white/[0.03] border-b border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              </div>
              <div className="flex-1 flex justify-center">
                 <div className="bg-white/5 rounded-md px-3 py-0.5 text-[10px] text-slate-500 font-mono">resumeforge.ai/dashboard</div>
              </div>
            </div>
            
            {/* Mock Dashboard UI */}
            <div className="pt-10 h-full w-full grid grid-cols-[200px_1fr] gap-px bg-white/5">
                <div className="bg-[#0c0c14] p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-4 w-full bg-white/5 rounded-md" style={{ width: `${Math.random() * 40 + 60}%` }} />
                    ))}
                </div>
                <div className="bg-[#0c0c14] p-8">
                    <div className="grid grid-cols-3 gap-6 mb-10">
                        <div className="h-24 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                        <div className="h-24 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                        <div className="h-24 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                    </div>
                    <div className="h-64 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
