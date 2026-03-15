"use client";

import { motion } from "framer-motion";
import { fadeInScale, fadeInUp, hoverLift, problemCards } from "@/lib/constants";

export default function Problem() {
  return (
    <section id="problem" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeInUp()} className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">Problem</span>
          <h2 className="section-title mt-5">The Modern Hiring Problem</h2>
          <p className="section-copy mt-6">
            High-potential candidates are losing momentum to broken workflows,
            weak feedback loops, and hiring processes that reward preparation
            quality over raw potential.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {problemCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.article
                key={card.title}
                {...fadeInScale(index * 0.08)}
                whileHover={hoverLift}
                className="glass-card rounded-[28px] p-7 shadow-[0_20px_70px_-40px_rgba(8,15,30,1)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                  <Icon className={`h-6 w-6 ${card.accent}`} />
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {card.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
