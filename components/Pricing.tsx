"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import {
  DEFAULT_LOCALE,
  fadeInScale,
  fadeInUp,
  hoverLift,
  pricingTiers,
} from "@/lib/constants";

type PricingProps = {
  locale?: string;
};

export default function Pricing({ locale = DEFAULT_LOCALE }: PricingProps) {
  return (
    <section id="pricing" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeInUp()} className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">Pricing</span>
          <h2 className="section-title mt-5">
            Simple pricing for every stage of the journey.
          </h2>
          <p className="section-copy mt-6">
            Start free, then unlock deeper AI prep, more guided practice, and
            full-career workflows as your momentum grows.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, index) => {
            const href = `/${locale}${tier.href}`;

            return (
              <motion.article
                key={tier.name}
                {...fadeInScale(index * 0.08)}
                whileHover={hoverLift}
                className={`relative rounded-[32px] border border-white/10 bg-gradient-to-br ${tier.accent} p-[1px] shadow-[0_24px_100px_-50px_rgba(8,15,30,1)]`}
              >
                <div className="glass-card h-full rounded-[31px] border-0 bg-slate-950/[0.94] p-8">
                  {tier.featured ? (
                    <div className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full border border-sky-300/[0.22] bg-sky-400/[0.10] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100">
                      <Sparkles className="h-3.5 w-3.5" />
                      Most Popular
                    </div>
                  ) : null}

                  <div className="pr-28">
                    <h3 className="text-2xl font-semibold tracking-tight text-white">
                      {tier.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {tier.description}
                    </p>
                  </div>

                  <div className="mt-10 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-[-0.05em] text-white">
                      {tier.price}
                    </span>
                    <span className="pb-1 text-sm font-medium text-slate-400">
                      {tier.cadence}
                    </span>
                  </div>

                  <ul className="mt-10 space-y-4">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm leading-7 text-slate-300"
                      >
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/[0.14] text-emerald-200">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={href}
                    className={`mt-10 inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      tier.featured ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
