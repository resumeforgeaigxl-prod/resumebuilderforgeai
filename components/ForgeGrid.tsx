"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeInScale, fadeInUp, hoverLift, moduleCards } from "@/lib/constants";

export default function ForgeGrid({ locale = "en-in" }: { locale?: string }) {
  return (
    <section id="platform" className="px-4 md:px-6 py-12 md:py-24">
      <div className="mx-auto max-w-7xl animate-premium-in">
        <motion.div {...fadeInUp()} className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">Linked Components</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mt-5">Explore the Forge Ecosystem</h2>
          <p className="text-slate-400 mt-6 text-base md:text-lg">
            ResumeForgeAI is an integrated career ecosystem where each forge
            specializes in a critical phase of your professional journey.
          </p>
        </motion.div>

        <div className="mt-12 md:mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((module, index) => {
            const Icon = module.icon;
            const forgePath = module.title.toLowerCase().replace("ai", "");

            return (
              <motion.article
                key={module.title}
                {...fadeInScale(index * 0.05)}
                whileHover={hoverLift}
                className="group h-full"
              >
                <Link 
                  href={`/${locale}/${forgePath}`}
                  className="forge-card block h-full premium-glass p-6 md:p-8 active:scale-[0.98]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white transition-transform group-hover:scale-110 shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors uppercase">
                    {module.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400 font-medium">
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
