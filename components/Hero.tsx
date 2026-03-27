"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  DEFAULT_LOCALE,
  fadeInScale,
  fadeInUp,
  heroNodes,
  heroStats,
  hoverLift,
} from "@/lib/constants";

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
    <section className="px-6 pb-24 pt-6 sm:pt-8">
      <div className="mx-auto max-w-7xl">
        <motion.header
          {...fadeInScale()}
          className="mx-auto mb-16 flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 shadow-[0_24px_80px_-40px_rgba(8,15,30,0.9)] backdrop-blur-xl sm:px-6"
        >
          <Link
            href={homeHref}
            className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(56,189,248,0.95),rgba(245,158,11,0.85))] text-sm text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.28)]">
              RF
            </span>
            <span className="hidden sm:block">ResumeForgeAI</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors duration-200 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.08] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/25 hover:bg-white/[0.12]"
          >
            Get Started
          </Link>
        </motion.header>

        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <motion.div
              {...fadeInUp(0.06)}
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100"
            >
              AI Career Operating System
            </motion.div>

            <motion.h1
              {...fadeInUp(0.12)}
              className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl"
            >
              Forge Your Entire Tech Career in One Platform
            </motion.h1>

            <motion.p
              {...fadeInUp(0.18)}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl"
            >
              ResumeForgeAI is an AI career platform for developers built as a
              Forge Ecosystem, where each forge solves a specific part of the
              journey including resumes, coding practice, interview preparation,
              and job discovery.
            </motion.p>

            <motion.p
              {...fadeInUp(0.20)}
              className="mt-4 max-w-2xl text-base leading-7 text-slate-400"
            >
              Build ATS-optimized resumes, practice coding, prepare for
              interviews, follow AI career roadmaps, and discover job
              opportunities inside the ResumeForgeAI ecosystem.
            </motion.p>

            <motion.div
              {...fadeInUp(0.24)}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href={`/${locale}/signup`}
                className="btn-primary group min-w-[220px] justify-center rounded-full px-7 py-3.5 text-sm font-semibold shadow-[0_18px_60px_-25px_rgba(56,189,248,0.45)]"
              >
                Build My Resume Free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <a
                href="#platform"
                className="btn-secondary min-w-[220px] justify-center rounded-full px-7 py-3.5 text-sm font-semibold"
              >
                Explore Platform
              </a>
            </motion.div>

            <motion.div
              {...fadeInUp(0.3)}
              className="mt-14 flex justify-center sm:justify-start"
            >
              <a
                href="https://peerlist.io/saivarshith8284/project/resumeforgeai"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 pr-6 transition-all duration-300 hover:border-sky-500/30 hover:bg-white/[0.06] hover:shadow-[0_0_40px_rgba(56,189,248,0.2)] hover:scale-[1.05]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black shadow-inner border border-white/5 overflow-hidden relative">
                  <Image 
                    src="/peerlist-badge.png" 
                    alt="Peerlist Launchpad" 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">
                    🚀 Now Live on
                  </span>
                  <span className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                    Peerlist Launchpad
                  </span>
                </div>
                
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 -z-10 bg-sky-500/0 blur-2xl transition-all duration-300 group-hover:bg-sky-500/10" />
              </a>
            </motion.div>

            <motion.div
              {...fadeInUp(0.36)}
              className="mt-14 grid gap-4 sm:grid-cols-3"
            >
              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="glass-card rounded-3xl px-5 py-5 shadow-[0_30px_60px_-45px_rgba(8,15,30,0.95)]"
                >
                  <div className="text-2xl font-semibold tracking-tight text-white">
                    {item.value}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    {item.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            {...fadeInScale(0.16)}
            className="relative mx-auto flex h-[420px] w-full max-w-[560px] items-center justify-center sm:h-[520px]"
          >
            <div className="absolute inset-[10%] rounded-full bg-sky-500/[0.08] blur-[90px]" />
            <div className="absolute inset-[18%] rounded-full bg-amber-500/[0.08] blur-[110px]" />

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              fill="none"
              aria-hidden="true"
            >
              {heroNodes.map((node, index) => (
                <motion.line
                  key={node.label}
                  x1="50"
                  y1="50"
                  x2={node.x}
                  y2={node.y}
                  stroke="url(#hero-line-gradient)"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.1, delay: 0.18 + index * 0.08 }}
                />
              ))}
              <defs>
                <linearGradient
                  id="hero-line-gradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="rgba(125,211,252,0.05)" />
                  <stop offset="50%" stopColor="rgba(56,189,248,0.75)" />
                  <stop offset="100%" stopColor="rgba(245,158,11,0.35)" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-[36px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-6 text-center shadow-[0_32px_120px_-44px_rgba(56,189,248,0.55)] backdrop-blur-2xl sm:h-48 sm:w-48"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-100/70">
                Central Engine
              </span>
              <div className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                ResumeForgeAI
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-300">
                One profile. Shared intelligence. Faster career momentum.
              </div>
            </motion.div>

            {heroNodes.map((node, index) => {
              const Icon = node.icon;

              return (
                <motion.div
                  key={node.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -6, 0],
                  }}
                  transition={{
                    opacity: { delay: 0.4 + index * 0.08, duration: 0.55 },
                    scale: { delay: 0.4 + index * 0.08, duration: 0.55 },
                    y: {
                      duration: 4.8 + index * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4 + index * 0.1,
                    },
                  }}
                  whileHover={hoverLift}
                  className="absolute z-20"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className={`glass-card w-[112px] rounded-[24px] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.05))] px-4 py-4 text-center shadow-[0_18px_40px_-25px_rgba(8,15,30,0.95)] sm:w-[126px] ${node.accent}`}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                      {node.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
