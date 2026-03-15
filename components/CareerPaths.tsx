"use client";

import { motion } from "framer-motion";
import {
  careerPathCards,
  fadeInScale,
  fadeInUp,
  hoverLift,
} from "@/lib/constants";

export default function CareerPaths() {
  return (
    <section id="career-paths" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeInUp()} className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">Career Paths</span>
          <h2 className="section-title mt-5">
            Career guidance mapped to real technical roles.
          </h2>
          <p className="section-copy mt-6">
            Choose a track and ResumeForgeAI connects the right learning plan,
            project ideas, coding practice, and interview preparation.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {careerPathCards.map((path, index) => {
            const Icon = path.icon;

            return (
              <motion.article
                key={path.title}
                {...fadeInScale(index * 0.06)}
                whileHover={hoverLift}
                className={`rounded-[30px] border border-white/10 bg-gradient-to-br ${path.accent} p-[1px] shadow-[0_20px_80px_-45px_rgba(8,15,30,1)]`}
              >
                <div className="glass-card h-full rounded-[29px] border-0 bg-slate-950/[0.92] p-7">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">
                    {path.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {path.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
