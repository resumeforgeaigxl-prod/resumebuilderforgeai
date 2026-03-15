"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeInScale, fadeInUp, dashboardStats } from "@/lib/constants";

export default function DashboardPreview() {
  return (
    <section id="preview" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeInUp()} className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">Dashboard Preview</span>
          <h2 className="section-title mt-5">
            One dashboard for execution, not just inspiration.
          </h2>
          <p className="section-copy mt-6">
            Track progress across resumes, job prep, interview practice, and
            career roadmaps from a single control center.
          </p>
        </motion.div>

        <motion.div
          {...fadeInScale(0.08)}
          className="relative mt-16 rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-4 shadow-[0_34px_120px_-55px_rgba(56,189,248,0.38)] backdrop-blur-2xl sm:p-6"
        >
          <div className="absolute left-8 top-8 hidden rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-300 backdrop-blur-xl md:block">
            ResumeForgeAI Workspace
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10">
            <Image
              src="/dashboard-preview.png"
              alt="ResumeForgeAI dashboard preview"
              width={1440}
              height={900}
              priority
              className="h-auto w-full"
            />
          </div>

          <div className="pointer-events-none absolute inset-x-6 bottom-6 grid gap-4 md:grid-cols-3">
            {dashboardStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                {...fadeInScale(0.18 + index * 0.08)}
                className="glass-card rounded-[22px] border-white/[0.12] bg-slate-950/[0.78] px-5 py-4 backdrop-blur-xl"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/75">
                  {stat.label}
                </div>
                <div className="mt-2 text-xl font-semibold tracking-tight text-white">
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
