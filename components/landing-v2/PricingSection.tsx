"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

interface TierDetails {
  name: string;
  limit: string;
  standardPrice: string;
  standardPeriod: string;
  standardCTA: string;
  standardHref: string;
  standardFeatures: string[];
  allAccessPrice: string;
  allAccessPeriod: string;
  allAccessCTA: string;
  allAccessHref: string;
  allAccessFeatures: string[];
}

const pricingTiersData: TierDetails[] = [
  {
    name: "Free",
    limit: "50 credits / day",
    standardPrice: "₹0",
    standardPeriod: "forever",
    standardCTA: "Start Free",
    standardHref: "/signup",
    standardFeatures: [
      "50 Daily AI credits",
      "Basic Resume Builder",
      "Standard ATS Check",
      "Community Support",
    ],
    allAccessPrice: "₹0",
    allAccessPeriod: "forever",
    allAccessCTA: "Start Free",
    allAccessHref: "/signup",
    allAccessFeatures: [
      "50 Daily AI credits",
      "Basic Resume Builder",
      "Standard ATS Check",
      "Access to all basic mockups",
      "Community Support",
    ],
  },
  {
    name: "Daily",
    limit: "300 credits / day",
    standardPrice: "₹29",
    standardPeriod: "day",
    standardCTA: "Get Daily Standard",
    standardHref: "/dashboard/billing?plan=daily_standard",
    standardFeatures: [
      "300 Daily AI credits",
      "Full access to ResumeForge",
      "Standard ATS Check & suggestions",
      "Valid for 24 hours",
    ],
    allAccessPrice: "₹49",
    allAccessPeriod: "day",
    allAccessCTA: "Get Daily All-Access",
    allAccessHref: "/dashboard/billing?plan=daily_all_access",
    allAccessFeatures: [
      "500 Daily AI credits",
      "Full access to ResumeForge",
      "CodingForge (interactive drills)",
      "InterviewForge (mock voice agent)",
      "Valid for 24 hours",
    ],
  },
  {
    name: "Weekly",
    limit: "800 credits / day",
    standardPrice: "₹79",
    standardPeriod: "week",
    standardCTA: "Get Weekly Standard",
    standardHref: "/dashboard/billing?plan=weekly_standard",
    standardFeatures: [
      "800 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Project & Portfolio basics",
    ],
    allAccessPrice: "₹129",
    allAccessPeriod: "week",
    allAccessCTA: "Get Weekly All-Access",
    allAccessHref: "/dashboard/billing?plan=weekly_all_access",
    allAccessFeatures: [
      "1200 Daily AI credits",
      "Full access to ResumeForge",
      "CodingForge (all problems)",
      "InterviewForge (unlimited mock rounds)",
      "PrepForge (TCS NQT & companies)",
    ],
  },
  {
    name: "Monthly",
    limit: "2000 credits / day",
    standardPrice: "₹199",
    standardPeriod: "month",
    standardCTA: "Get Monthly Standard",
    standardHref: "/dashboard/billing?plan=monthly_standard",
    standardFeatures: [
      "2000 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Priority Email Support",
    ],
    allAccessPrice: "₹399",
    allAccessPeriod: "month",
    allAccessCTA: "Get Monthly All-Access",
    allAccessHref: "/dashboard/billing?plan=monthly_all_access",
    allAccessFeatures: [
      "3500 Daily AI credits",
      "Everything in Standard",
      "All Forges (Coding, Interview, Prep, Project, Learn)",
      "Adaptive Career roadmap generator",
      "Priority Email Support",
    ],
  },
  {
    name: "Professional",
    limit: "5000 credits / day",
    standardPrice: "₹499",
    standardPeriod: "month",
    standardCTA: "Get Pro Standard",
    standardHref: "/dashboard/billing?plan=pro_standard",
    standardFeatures: [
      "5000 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Priority Routing & Skill Gap",
      "Knowledge Runner Enabled",
    ],
    allAccessPrice: "₹899",
    allAccessPeriod: "month",
    allAccessCTA: "Get Pro All-Access",
    allAccessHref: "/dashboard/billing?plan=pro_all_access",
    allAccessFeatures: [
      "8000 Daily AI credits",
      "Everything in Standard",
      "All Forges + Mentor AI assistant",
      "Company-specific deck customization",
      "Priority 1-on-1 support",
    ],
  },
];

interface PricingSectionProps {
  locale?: string;
}

export default function PricingSection({ locale = "en-in" }: PricingSectionProps) {
  const [sliderValue, setSliderValue] = useState(3); // Default to Monthly (index 3)
  const activeTier = pricingTiersData[sliderValue];

  return (
    <section id="pricing" className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white">
        
        {/* Header Block */}
        <div className="px-6 md:px-10 py-16 text-left">
          <span className="font-mono text-[14px] text-rose-500 font-semibold uppercase leading-4 block mb-3 select-none">
            #05 — Pricing
          </span>
          <h2
            className="text-[#1c1917] font-bold leading-[1.15] text-2xl md:text-[clamp(28px,3vw,40px)] tracking-tight max-w-[640px]"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-sm md:text-base text-stone-500 mt-3 max-w-[560px] leading-relaxed">
            Select your usage requirements and get started instantly. Save or upgrade anytime.
          </p>
        </div>

        {/* Pricing Estimator Slider block */}
        <div className="border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-12 md:py-16">
          <div className="max-w-[720px] mx-auto bg-white border border-[#e7e5e4] rounded-2xl p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-12">
            
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Usage Volume Estimator
              </span>
              <span className="bg-[#7c3aed]/10 text-[#7c3aed] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {activeTier.limit}
              </span>
            </div>

            {/* Custom Range Slider */}
            <div className="relative w-full py-4 select-none">
              {/* Track background */}
              <div className="relative w-full h-1.5 bg-stone-200 rounded-full">
                {/* Active fill */}
                <div
                  className="absolute h-full bg-[#7c3aed] rounded-full animate-none"
                  style={{ width: `${(sliderValue / 4) * 100}%` }}
                />
                
                {/* Tick marks */}
                <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                  {[0, 1, 2, 3, 4].map((tick) => (
                    <div
                      key={tick}
                      className={`w-1.5 h-1.5 rounded-full -mt-0.5 transition-colors duration-200 ${
                        tick <= sliderValue ? "bg-[#7c3aed]" : "bg-stone-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Hidden native input overlay for drag-select */}
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {/* Custom Grab Thumb pill */}
              <div
                className="absolute top-1/2 -mt-3.5 w-11 h-7 bg-white border border-[#e7e5e4] shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-lg flex items-center justify-center pointer-events-none transition-all duration-75 select-none"
                style={{
                  left: `calc(${(sliderValue / 4) * 100}% - 22px)`,
                }}
              >
                <div className="flex gap-0.5">
                  <div className="w-[1.5px] h-3 bg-stone-300" />
                  <div className="w-[1.5px] h-3 bg-stone-300" />
                </div>
              </div>
            </div>

            {/* Slider Ticks/Labels */}
            <div className="flex justify-between mt-3 px-1">
              {pricingTiersData.map((tier, idx) => (
                <button
                  key={tier.name}
                  onClick={() => setSliderValue(idx)}
                  className="flex flex-col items-center group cursor-pointer animate-none bg-transparent border-0 p-0"
                >
                  <span
                    className={`text-[11px] font-mono uppercase font-bold transition-colors ${
                      sliderValue === idx ? "text-[#7c3aed]" : "text-stone-400 group-hover:text-stone-600"
                    }`}
                  >
                    {tier.name === "Professional" ? (
                      <>
                        <span className="hidden sm:inline">Professional</span>
                        <span className="inline sm:hidden">Pro</span>
                      </>
                    ) : tier.name}
                  </span>
                  <span className="text-[9.5px] text-stone-500 mt-0.5 hidden md:inline font-mono">
                    {tier.limit.split(" ")[0]} cr
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cards side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 max-w-[960px] mx-auto">
            
            {/* CARD 1: Standard Access */}
            <motion.div
              className="flex flex-col transition-all duration-300 bg-white border border-[#e7e5e4] rounded-2xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:-translate-y-1 h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
            >
              <span className="font-mono text-[9px] uppercase font-bold text-stone-400 tracking-wider mb-2 block text-left">
                Standard Tier
              </span>
              
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-stone-900 font-display italic text-left">
                Standard Access
              </h3>
              
              <p className="text-[12.5px] text-stone-500 mt-1.5 leading-relaxed min-h-[38px] text-left">
                Core AI tools for resume building and ATS scoring.
              </p>

              {/* Price block */}
              <div className="mt-5 flex items-baseline gap-1 justify-start">
                <span className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-none">
                  {activeTier.standardPrice}
                </span>
                <span className="text-xs font-semibold text-stone-400">
                  /{activeTier.standardPeriod}
                </span>
              </div>

              <div className="my-6 h-[1px] bg-stone-100" />

              {/* Features list */}
              <ul className="space-y-3.5 flex-1 mb-8 text-left">
                {activeTier.standardFeatures.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-stone-600 text-[13.5px]">
                    <Check className="w-4 h-4 text-[#7c3aed] mt-0.5 shrink-0" strokeWidth={2.5} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Link href={`/${locale}${activeTier.standardHref}`} className="block w-full">
                <button className="w-full text-center border border-[#e7e5e4] rounded-xl py-3.5 text-[12px] font-semibold font-mono uppercase tracking-wider text-[#1c1917] bg-white hover:bg-[#fafaf9] hover:border-[#1c1917] transition-all duration-75 cursor-pointer active:scale-95">
                  {activeTier.standardCTA}
                </button>
              </Link>
            </motion.div>

            {/* CARD 2: All-Access Forges (Recommended) */}
            <motion.div
              className="flex flex-col transition-all duration-300 bg-[#faf8ff] border-2 border-[#7c3aed] rounded-2xl p-6 md:p-8 shadow-[0_8px_24px_rgba(124,58,237,0.04)] hover:-translate-y-1 h-full relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 bg-[#7c3aed] text-white text-[8px] font-bold font-mono tracking-widest px-4 py-1.5 uppercase rounded-bl-lg select-none">
                RECOMMENDED
              </div>

              <span className="font-mono text-[9px] uppercase font-bold text-[#7c3aed] tracking-wider mb-2 block text-left">
                All-Access Tier
              </span>
              
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-stone-900 font-display italic text-left">
                All-Access Forges
              </h3>
              
              <p className="text-[12.5px] text-stone-500 mt-1.5 leading-relaxed min-h-[38px] text-left">
                Full access to all AI platforms (Coding, Interviews, Portfolios).
              </p>

              {/* Price block */}
              <div className="mt-5 flex items-baseline gap-1 justify-start">
                <span className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-none">
                  {activeTier.allAccessPrice}
                </span>
                <span className="text-xs font-semibold text-stone-400">
                  /{activeTier.allAccessPeriod}
                </span>
              </div>

              <div className="my-6 h-[1px] bg-stone-100" />

              {/* Features list */}
              <ul className="space-y-3.5 flex-1 mb-8 text-left">
                {activeTier.allAccessFeatures.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-stone-700 text-[13.5px]">
                    <Check className="w-4 h-4 text-[#7c3aed] mt-0.5 shrink-0" strokeWidth={2.5} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Link href={`/${locale}${activeTier.allAccessHref}`} className="block w-full">
                <button className="w-full text-center bg-[#7c3aed] text-white border border-[#6d28d9] rounded-xl py-3.5 text-[12px] font-semibold font-mono uppercase tracking-wider hover:bg-[#6d28d9] transition-all duration-75 cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(124,58,237,0.15)]">
                  {activeTier.allAccessCTA}
                </button>
              </Link>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
