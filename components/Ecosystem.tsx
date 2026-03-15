"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import {
  ecosystemSignals,
  fadeInScale,
  fadeInUp,
  moduleCards,
} from "@/lib/constants";

export default function Ecosystem() {
  const featuredModules = moduleCards.slice(0, 4);

  return (
    <section className="px-6 py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <motion.div {...fadeInUp()} className="max-w-2xl">
          <span className="section-kicker">Connected Ecosystem</span>
          <h2 className="section-title mt-5">
            Every action sharpens the next step.
          </h2>
          <p className="section-copy mt-6">
            ResumeForgeAI is designed as a flywheel. The output of one module
            becomes the input for the next, so each resume edit, coding session,
            mock interview, and application improves the entire career system.
          </p>

          <div className="mt-10 space-y-4">
            {ecosystemSignals.map((signal, index) => (
              <motion.div
                key={signal}
                {...fadeInUp(index * 0.07)}
                className="glass-card flex items-center gap-4 rounded-[22px] px-5 py-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/[0.12] text-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-sm leading-7 text-slate-300">{signal}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...fadeInScale(0.08)}
          className="glass-card rounded-[32px] p-6 shadow-[0_30px_90px_-50px_rgba(8,15,30,1)]"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {featuredModules.map((module, index) => {
              const Icon = module.icon;

              return (
                <motion.div
                  key={module.title}
                  {...fadeInScale(index * 0.08)}
                  className={`rounded-[24px] border border-white/[0.08] bg-gradient-to-br ${module.accent} p-[1px]`}
                >
                  <div className="h-full rounded-[23px] bg-slate-950/[0.85] p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                      {module.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {module.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/[0.08] bg-white/[0.06] px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/70">
              Shared intelligence layer
            </div>
            <div className="mt-3 text-lg font-semibold tracking-tight text-white">
              One profile, one timeline, one system for building momentum.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
