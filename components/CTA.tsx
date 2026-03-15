"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEFAULT_LOCALE, fadeInScale, fadeInUp } from "@/lib/constants";

type CTAProps = {
  locale?: string;
};

export default function CTA({ locale = DEFAULT_LOCALE }: CTAProps) {
  return (
    <section className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          {...fadeInScale()}
          className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,30,0.95),rgba(15,23,42,0.88))] px-8 py-14 shadow-[0_34px_120px_-55px_rgba(56,189,248,0.38)] sm:px-12 sm:py-20"
        >
          <div className="absolute left-[-10%] top-[-20%] h-64 w-64 rounded-full bg-sky-500/[0.12] blur-[110px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-72 w-72 rounded-full bg-amber-500/[0.12] blur-[120px]" />

          <motion.div {...fadeInUp(0.08)} className="relative z-10 max-w-3xl">
            <span className="section-kicker">Final CTA</span>
            <h2 className="section-title mt-5">
              Start Building Your Tech Career Today
            </h2>
            <p className="section-copy mt-6">
              Build a stronger profile, follow a smarter roadmap, and prepare
              with better signals from day one.
            </p>

            <div className="mt-10">
              <Link
                href={`/${locale}/signup`}
                className="btn-primary group inline-flex rounded-full px-7 py-3.5 text-sm font-semibold shadow-[0_18px_60px_-25px_rgba(56,189,248,0.45)]"
              >
                Build Resume Free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
