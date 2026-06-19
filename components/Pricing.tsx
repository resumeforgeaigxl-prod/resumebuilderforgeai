"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Wand2} from 'lucide-react';
import {
  DEFAULT_LOCALE,
  fadeInScale,
  fadeInUp,
  hoverLift,
  pricingTiers } from "@/lib/constants";

type PricingProps = {
  locale?: string;
};

export default function Pricing({ locale = DEFAULT_LOCALE }: PricingProps) {
  return (
    <section id="pricing" className="px-6 py-24 sm:py-28 overflow-hidden">
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

        <div className="mt-16 grid gap-4 xl:gap-5 lg:grid-cols-5">
          {pricingTiers.map((tier, index) => {
            return (
              <motion.article
                key={tier.name}
                {...fadeInScale(index * 0.08)}
                whileHover={hoverLift}
                className={`relative flex flex-col rounded-[28px] xl:rounded-[32px] border border-white/10 bg-gradient-to-br ${tier.accent} p-[1px] shadow-[0_24px_100px_-50px_rgba(8,15,30,1)]`}
              >
                <div className="glass-card h-full rounded-[27px] xl:rounded-[31px] border-0 bg-slate-950/[0.94] p-5 xl:p-6 flex flex-col relative overflow-hidden">
                  {tier.featured ? (
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-sky-300/[0.22] bg-sky-400/[0.10] px-2 py-1 text-[9px] xl:text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100 z-10">
                      <Wand2 className="h-3 w-3" />
                      Popular
                    </div>
                  ) : null}

                  <div className="pr-12 sm:pr-20 lg:pr-0 relative z-10">
                    <h3 className="text-xl xl:text-2xl font-semibold tracking-tight text-white">
                      {tier.name}
                    </h3>
                    <p className="mt-2 text-xs xl:text-sm leading-6 xl:leading-7 text-slate-400">
                      {tier.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-end gap-1.5 relative z-10">
                    <span className="text-3xl xl:text-4xl font-semibold tracking-[-0.05em] text-white">
                      {tier.price}
                    </span>
                    <span className="pb-1 text-xs xl:text-sm font-medium text-slate-400">
                      {tier.cadence}
                    </span>
                  </div>

                  <ul className="mt-10 space-y-4 flex-grow relative z-10">
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
                    href={`/${locale}${tier.href}`}
                    className={`mt-10 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold transition-all duration-200 relative z-10 ${
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
