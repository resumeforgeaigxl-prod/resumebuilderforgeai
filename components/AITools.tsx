"use client";

import { motion } from "framer-motion";
import { aiToolCards, fadeInScale, fadeInUp, hoverLift } from "@/lib/constants";

export default function AITools() {
  return (
    <section id="ai-tools" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeInUp()} className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">AI Tools</span>
          <h2 className="section-title mt-5">
            Purpose-built AI for each stage of the journey.
          </h2>
          <p className="section-copy mt-6">
            These tools are tuned for developer and student workflows, from
            resume refinement to interview preparation and job discovery.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {aiToolCards.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <motion.article
                key={tool.title}
                {...fadeInScale(index * 0.06)}
                whileHover={hoverLift}
                className={`rounded-[30px] border border-white/10 bg-gradient-to-br ${tool.accent} p-[1px] shadow-[0_20px_80px_-45px_rgba(8,15,30,1)] xl:[&:last-child]:col-span-2`}
              >
                <div className="glass-card h-full rounded-[29px] border-0 bg-slate-950/[0.92] p-7">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">
                    {tool.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {tool.description}
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
