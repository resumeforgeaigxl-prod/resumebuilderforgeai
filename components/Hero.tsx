"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Brain, Search, Wand2} from 'lucide-react';
import {
  DEFAULT_LOCALE,
  fadeInScale,
  fadeInUp } from "@/lib/constants";

type HeroProps = {
  locale?: string;
};

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "AI Tools", href: "#ai-tools" },
  { label: "Pricing", href: "#pricing" },
  { label: "Workflow", href: "#workflow" },
];

export default function Hero({ locale = DEFAULT_LOCALE }: HeroProps) {
  const homeHref = locale === DEFAULT_LOCALE ? "/" : `/${locale}`;

  return (
    <section className="relative px-4 md:px-6 pb-20 md:pb-32 pt-6 md:pt-10 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-[#00D4A0]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-full max-w-xl h-[300px] bg-[#7C5CFC]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        <motion.header
          {...fadeInScale()}
          className="mx-auto mb-16 sm:mb-24 flex max-w-5xl items-center justify-between rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 shadow-2xl backdrop-blur-2xl sm:px-6"
        >
          <Link
            href={homeHref}
            aria-label="ResumeForgeAI Home"
            className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
          >
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00D4A0,#7C5CFC)] text-sm text-[#080B16] font-bold shadow-[0_0_30px_rgba(0,212,160,0.4)]" aria-hidden="true">
              RF
            </span>
            <span className="hidden sm:block">ResumeForgeAI</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-all duration-200 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20"
          >
            Sign In
          </Link>
        </motion.header>

        <div className="flex flex-col items-center text-center">
          <motion.div
            {...fadeInUp(0.06)}
            className="inline-flex items-center gap-2 rounded-full border border-[#00D4A0]/30 bg-[#00D4A0]/10 px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#00D4A0] backdrop-blur-sm shadow-[0_0_20px_rgba(0,212,160,0.15)]"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>The Intelligence Layer for Careers</span>
          </motion.div>

          <motion.h1
            {...fadeInUp(0.12)}
            className="mt-8 max-w-5xl text-[3rem] leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl font-extrabold"
          >
            Forge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4A0] to-[#7C5CFC]">Tech Career</span> <br className="hidden sm:block" /> in One Platform.
          </motion.h1>

          <motion.p
            {...fadeInUp(0.18)}
            className="mt-8 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-slate-400 font-medium px-4"
          >
            ResumeForgeAI is an autonomous career ecosystem. Build ATS-optimized resumes, practice coding, ace AI mock interviews, and land jobs seamlessly.
          </motion.p>

          <motion.div
            {...fadeInUp(0.24)}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto px-4"
          >
            <Link
              href={`/${locale}/signup`}
              className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm sm:text-base font-bold text-[#080B16] transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Start Forging Free
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#platform"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 py-4 text-sm sm:text-base font-semibold text-white transition-all hover:bg-white/[0.08] backdrop-blur-sm"
            >
              Explore Ecosystem
            </a>
          </motion.div>

          <motion.div
            {...fadeInUp(0.3)}
            className="mt-12 sm:mt-16"
          >
            <a
              href="https://peerlist.io/saivarshith8284/project/resumeforgeai"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-2 pr-6 transition-all duration-300 hover:border-[#00D4A0]/40 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(0,212,160,0.1)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black shadow-inner border border-white/10 overflow-hidden relative">
                <Image 
                  src="/peerlist-badge.png" 
                  alt="Peerlist Launchpad" 
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-400">
                  Featured On
                </span>
                <span className="text-sm font-bold text-white group-hover:text-[#00D4A0]">
                  Peerlist Launchpad
                </span>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Hero Visual - Premium Stacked Cards */}
        <motion.div
          {...fadeInScale(0.35)}
          className="relative mt-20 sm:mt-28 mx-auto max-w-5xl perspective-1000"
        >
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] sm:rounded-[3rem] border border-white/10 bg-[#080B16] shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] overflow-hidden">
            {/* Inner Dashboard Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[#00D4A0]/20 blur-[100px] rounded-full mix-blend-screen" />
            
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />

            {/* AI Scanning Line Effect */}
            <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D4A0]/50 to-transparent z-20 pointer-events-none animate-scan-line" />

            {/* Dashboard Mockup Header */}
            <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex items-center px-6 sm:px-10 gap-4 z-20">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="ml-4 h-6 w-32 sm:w-48 rounded-md bg-white/5" />
              <div className="ml-auto h-8 w-8 rounded-full bg-gradient-to-br from-[#00D4A0] to-[#7C5CFC]" />
            </div>

            {/* Floating Forge Cards */}
            <div className="absolute top-24 sm:top-32 left-0 right-0 bottom-0 p-6 sm:p-10 grid grid-cols-1 sm:grid-cols-3 gap-6 z-10">
              <div className="relative flex flex-col rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-sm sm:-translate-y-4 transition-colors hover:border-indigo-500/30 animate-float-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg">ResumeForge</h3>
                <p className="text-slate-400 text-sm mt-2">ATS-optimized parsing and generation.</p>
                <div className="mt-auto pt-6 space-y-2">
                  <div className="h-2 w-full bg-white/5 rounded-full" />
                  <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                </div>
              </div>

              <div className="relative hidden sm:flex flex-col rounded-[2rem] border border-[#00D4A0]/30 bg-[#00D4A0]/5 p-6 shadow-[0_0_50px_rgba(0,212,160,0.15)] backdrop-blur-sm sm:-translate-y-12 transition-colors hover:border-[#00D4A0]/50 hover:shadow-[0_0_80px_rgba(0,212,160,0.25)] z-10 animate-float-2">
                <div className="w-12 h-12 rounded-2xl bg-[#00D4A0]/20 text-[#00D4A0] flex items-center justify-center mb-6 border border-[#00D4A0]/30 shadow-[0_0_20px_rgba(0,212,160,0.3)]">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg">InterviewForge</h3>
                <p className="text-slate-400 text-sm mt-2">Real-time voice AI mock interviews.</p>
                <div className="mt-auto pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00D4A0]/20 flex items-center justify-center border border-[#00D4A0]/30 relative">
                       <div className="absolute inset-0 rounded-full border border-[#00D4A0]/50 animate-ping" />
                       <div className="w-2 h-2 rounded-full bg-[#00D4A0] animate-pulse" />
                    </div>
                    <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full" />
                </div>
              </div>

              <div className="relative hidden sm:flex flex-col rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-sm sm:-translate-y-4 transition-colors hover:border-amber-500/30 animate-float-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 border border-amber-500/20">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg">JobForge</h3>
                <p className="text-slate-400 text-sm mt-2">AI-matched opportunities across tech.</p>
                <div className="mt-auto pt-6 space-y-2">
                  <div className="h-2 w-full bg-white/5 rounded-full" />
                  <div className="h-2 w-4/5 bg-white/5 rounded-full" />
                </div>
              </div>
            </div>
            
            {/* Bottom Fade Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080B16] via-[#080B16]/80 to-transparent pointer-events-none z-30" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
