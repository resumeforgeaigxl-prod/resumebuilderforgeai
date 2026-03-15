"use client";

import { motion } from "framer-motion";
import {
  fadeInScale,
  fadeInUp,
  solutionPoints,
} from "@/lib/constants";

export default function Solution() {
  return (
    <section className="px-6 py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <motion.div {...fadeInUp()} className="max-w-2xl">
          <span className="section-kicker">Solution</span>
          <h2 className="section-title mt-5">A Complete Career Operating System</h2>
          <p className="section-copy mt-6">
            ResumeForgeAI combines resume building, coding practice, interview
            preparation, career roadmaps, learning resources, and job discovery
            into one ecosystem. Instead of bouncing between disconnected tools,
            users move through a single, AI-guided workflow that compounds over
            time.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: "1", label: "Unified workspace" },
              { value: "8", label: "Connected modules" },
              { value: "Faster", label: "Path from learning to offers" },
            ].map((item) => (
              <div
                key={item.label}
                className="glass-card rounded-[24px] px-5 py-5"
              >
                <div className="text-2xl font-semibold tracking-tight text-white">
                  {item.value}
                </div>
                <div className="mt-2 text-sm text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-6">
          {solutionPoints.map((point, index) => {
            const Icon = point.icon;

            return (
              <motion.article
                key={point.title}
                {...fadeInScale(index * 0.08)}
                className="glass-card rounded-[28px] p-7 shadow-[0_20px_70px_-42px_rgba(8,15,30,1)]"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sky-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">
                      {point.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                      {point.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
