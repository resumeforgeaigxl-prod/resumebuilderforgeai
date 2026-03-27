"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeInScale, fadeInUp, hoverLift, moduleCards } from "@/lib/constants";

export default function ForgeGrid({ locale = "en-in" }: { locale?: string }) {
  return (
    <section id="platform" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeInUp()} className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">Linked Components</span>
          <h2 className="section-title mt-5">Explore the Forge Ecosystem</h2>
          <p className="section-copy mt-6">
            ResumeForgeAI is an integrated career ecosystem where each forge
            specializes in a critical phase of your professional journey.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((module, index) => {
            const Icon = module.icon;
            const forgePath = module.title.toLowerCase().replace("ai", "");

            return (
              <motion.article
                key={module.title}
                {...fadeInScale(index * 0.05)}
                whileHover={hoverLift}
                className={`group relative rounded-[30px] border border-white/10 bg-gradient-to-br ${module.accent} p-[1px] shadow-[0_20px_80px_-45px_rgba(8,15,30,1)]`}
              >
                <Link 
                  href={`/${locale}/${forgePath}`}
                  className="glass-card block h-full rounded-[29px] border-0 bg-slate-950/[0.92] p-7 transition-colors hover:bg-slate-950/[0.80]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-white group-hover:text-sky-400 transition-colors">
                    {module.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {module.description}
                  </p>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
