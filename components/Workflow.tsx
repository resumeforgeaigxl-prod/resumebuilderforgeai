"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeInScale, fadeInUp, workflowSteps } from "@/lib/constants";

export default function Workflow() {
  return (
    <section id="workflow" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeInUp()} className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">Workflow</span>
          <h2 className="section-title mt-5">
            A simple path from profile to opportunity.
          </h2>
          <p className="section-copy mt-6">
            ResumeForgeAI is designed to reduce friction between your next step
            and your end goal.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 xl:grid-cols-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.step}
                {...fadeInScale(index * 0.07)}
                className="relative"
              >
                <div className="glass-card relative h-full rounded-[30px] p-7 shadow-[0_20px_80px_-45px_rgba(8,15,30,1)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-[0.28em] text-sky-100/75">
                      {step.step}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-10 text-2xl font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {step.description}
                  </p>
                </div>

                {index < workflowSteps.length - 1 ? (
                  <div className="pointer-events-none absolute right-[-18px] top-1/2 hidden -translate-y-1/2 xl:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/[0.85] text-slate-300 backdrop-blur-xl">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
