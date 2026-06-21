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
  allAccessFeaturesLeft: string[];
  allAccessFeaturesRight: string[];
}

const pricingTiersData: TierDetails[] = [
  {
    name: "Free",
    limit: "50 credits",
    standardPrice: "₹0",
    standardPeriod: "forever",
    standardCTA: "Get Started",
    standardHref: "/signup",
    standardFeatures: [
      "50 Daily AI credits",
      "Basic Resume Builder",
      "Standard ATS Check",
      "Download PDF resumes",
      "Basic Community Support",
      "Standard templates access",
      "Footer branding included",
    ],
    allAccessPrice: "₹0",
    allAccessPeriod: "forever",
    allAccessCTA: "Get Started",
    allAccessHref: "/signup",
    allAccessFeaturesLeft: [
      "50 Daily AI credits",
      "Basic Resume Builder",
      "Standard ATS Check",
      "Download PDF resumes",
      "Basic Community Support",
      "Standard templates access",
      "Footer branding included",
    ],
    allAccessFeaturesRight: [
      "CodingForge basics",
      "InterviewForge basics",
      "PrepForge (TCS NQT)",
      "ProjectForge (GitHub import)",
      "LearnForge roadmaps",
      "Interactive tour sandbox",
      "Free career tools access",
    ],
  },
  {
    name: "Daily",
    limit: "300 credits",
    standardPrice: "₹29",
    standardPeriod: "day",
    standardCTA: "Get Started",
    standardHref: "/dashboard/billing?plan=daily_standard",
    standardFeatures: [
      "300 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Download PDF resumes",
      "Remove daily limits",
      "Priority Email Support",
      "No Footer Branding",
    ],
    allAccessPrice: "₹49",
    allAccessPeriod: "day",
    allAccessCTA: "Get Started",
    allAccessHref: "/dashboard/billing?plan=daily_all_access",
    allAccessFeaturesLeft: [
      "300 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Download PDF resumes",
      "Remove daily limits",
      "Priority Email Support",
      "No Footer Branding",
    ],
    allAccessFeaturesRight: [
      "CodingForge (all interactive drills)",
      "InterviewForge (mock voice agent)",
      "PrepForge (all company decks)",
      "ProjectForge (GitHub import)",
      "LearnForge roadmaps",
      "Valid for 24 hours",
      "All Forges unlocked",
    ],
  },
  {
    name: "Weekly",
    limit: "800 credits",
    standardPrice: "₹79",
    standardPeriod: "week",
    standardCTA: "Get Started",
    standardHref: "/dashboard/billing?plan=weekly_standard",
    standardFeatures: [
      "800 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Download PDF resumes",
      "Remove weekly limits",
      "Priority Email Support",
      "No Footer Branding",
    ],
    allAccessPrice: "₹129",
    allAccessPeriod: "week",
    allAccessCTA: "Get Started",
    allAccessHref: "/dashboard/billing?plan=weekly_all_access",
    allAccessFeaturesLeft: [
      "800 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Download PDF resumes",
      "Remove weekly limits",
      "Priority Email Support",
      "No Footer Branding",
    ],
    allAccessFeaturesRight: [
      "CodingForge (all interactive drills)",
      "InterviewForge (mock voice agent)",
      "PrepForge (all company decks)",
      "ProjectForge (GitHub import)",
      "LearnForge roadmaps",
      "Valid for 7 days",
      "All Forges unlocked",
    ],
  },
  {
    name: "Monthly",
    limit: "2,000 credits",
    standardPrice: "₹199",
    standardPeriod: "month",
    standardCTA: "Get Started",
    standardHref: "/dashboard/billing?plan=monthly_standard",
    standardFeatures: [
      "2,000 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Download PDF resumes",
      "Remove monthly limits",
      "Priority Email Support",
      "No Footer Branding",
    ],
    allAccessPrice: "₹399",
    allAccessPeriod: "month",
    allAccessCTA: "Get Started",
    allAccessHref: "/dashboard/billing?plan=monthly_all_access",
    allAccessFeaturesLeft: [
      "2,000 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Download PDF resumes",
      "Remove monthly limits",
      "Priority Email Support",
      "No Footer Branding",
    ],
    allAccessFeaturesRight: [
      "CodingForge (practice drills)",
      "InterviewForge (mock voice agent)",
      "PrepForge (TCS NQT & companies)",
      "ProjectForge (code portfolios)",
      "LearnForge roadmaps",
      "Adaptive Career roadmap generator",
      "All Forges unlocked",
    ],
  },
  {
    name: "Professional",
    limit: "5,000 credits",
    standardPrice: "₹499",
    standardPeriod: "month",
    standardCTA: "Get Started",
    standardHref: "/dashboard/billing?plan=pro_standard",
    standardFeatures: [
      "5,000 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Download PDF resumes",
      "Remove monthly limits",
      "Priority Email Support",
      "No Footer Branding",
    ],
    allAccessPrice: "₹899",
    allAccessPeriod: "month",
    allAccessCTA: "Get Started",
    allAccessHref: "/dashboard/billing?plan=pro_all_access",
    allAccessFeaturesLeft: [
      "5,000 Daily AI credits",
      "Full access to ResumeForge",
      "Advanced ATS optimization",
      "Download PDF resumes",
      "Remove monthly limits",
      "Priority Email Support",
      "No Footer Branding",
    ],
    allAccessFeaturesRight: [
      "CodingForge (all interactive drills)",
      "InterviewForge (unlimited mock rounds)",
      "PrepForge (all company decks)",
      "ProjectForge (GitHub import)",
      "LearnForge roadmaps",
      "Adaptive Career roadmap generator",
      "1-on-1 resume feedback sessions",
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
                {activeTier.limit} / day
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

          {/* Cards side-by-side comparison (AutoSend Split Layout) */}
          <motion.div
            className="border border-[#e7e5e4] bg-white rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e7e5e4] max-w-[960px] mx-auto shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
          >
            
            {/* CARD 1: Standard Access */}
            <div className="flex flex-col bg-white h-full justify-between overflow-hidden">
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <span className="font-mono text-[9px] uppercase font-bold text-stone-400 tracking-widest mb-1.5 block text-left">
                  ONLY RESUME BUILDER
                </span>
                
                {/* Price block */}
                <div className="flex items-center gap-4 my-4 justify-start">
                  <span className="text-5xl md:text-6xl font-extrabold text-stone-900 leading-none tracking-tight">
                    {activeTier.standardPrice}
                  </span>
                  <div className="flex flex-col text-left justify-center leading-none">
                    <span className="text-[12px] font-bold text-stone-800 uppercase font-mono">
                      {activeTier.name === "Monthly" ? "STARTER" : (activeTier.name === "Professional" ? "PRO" : activeTier.name.toUpperCase())}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500 mt-1 font-mono">
                      {activeTier.limit} / day
                    </span>
                    <span className="text-[9.5px] text-stone-400 mt-1 font-mono">
                      billed {activeTier.standardPeriod}
                    </span>
                  </div>
                </div>

                <div className="my-4 h-[1px] bg-stone-100" />

                {/* Features list */}
                <ul className="space-y-3.5 flex-1 text-left mb-4">
                  {activeTier.standardFeatures.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-stone-600 text-[13px]">
                      <div className="w-4 h-4 rounded-full bg-[#7c3aed] flex items-center justify-center shrink-0 mt-0.5 animate-none">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full-width bottom CTA */}
              <Link href={`/${locale}${activeTier.standardHref}`} className="block w-full">
                <div className="w-full py-4 bg-[#292524] hover:bg-[#1c1917] text-white text-center font-mono text-[12px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 border-t border-[#e7e5e4] cursor-pointer transition-all active:scale-[0.99]">
                  <span>{activeTier.standardCTA}</span>
                  <span className="text-[14px]">→</span>
                </div>
              </Link>
            </div>

            {/* CARD 2: All-Access Forges (Recommended) */}
            <div className="flex flex-col bg-white h-full justify-between overflow-hidden relative">
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-[9px] uppercase font-bold text-[#7c3aed] tracking-widest block text-left">
                    RESUME BUILDER + ALL FORGES
                  </span>
                  <span className="bg-[#84cc16] text-white text-[8px] font-bold font-mono tracking-widest px-2.5 py-0.5 rounded uppercase select-none">
                    RECOMMENDED
                  </span>
                </div>
                
                {/* Price block */}
                <div className="flex items-center gap-4 my-4 justify-start">
                  <span className="text-5xl md:text-6xl font-extrabold text-[#7c3aed] leading-none tracking-tight">
                    {activeTier.allAccessPrice}
                  </span>
                  <div className="flex flex-col text-left justify-center leading-none">
                    <span className="text-[12px] font-bold text-stone-800 uppercase font-mono">
                      {activeTier.name === "Monthly" ? "STARTER" : (activeTier.name === "Professional" ? "PRO" : activeTier.name.toUpperCase())}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500 mt-1 font-mono">
                      {activeTier.limit} / day · All Forges
                    </span>
                    <span className="text-[9.5px] text-stone-400 mt-1 font-mono">
                      billed {activeTier.allAccessPeriod}
                    </span>
                  </div>
                </div>

                <div className="my-4 h-[1px] bg-stone-100" />

                {/* Split Features columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 flex-1 text-left mb-4">
                  {/* Left Column (Standard features, matching Left card) */}
                  <ul className="space-y-3.5">
                    {activeTier.allAccessFeaturesLeft.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-stone-700 text-[13px]">
                        <div className="w-4 h-4 rounded-full bg-[#7c3aed] flex items-center justify-center shrink-0 mt-0.5 animate-none">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Right Column (All-Access extra Forges) */}
                  <ul className="space-y-3.5 border-t sm:border-t-0 pt-3.5 sm:pt-0 border-stone-100">
                    {activeTier.allAccessFeaturesRight.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-stone-700 text-[13px]">
                        <div className="w-4 h-4 rounded-full bg-[#7c3aed] flex items-center justify-center shrink-0 mt-0.5 animate-none">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Full-width bottom CTA */}
              <Link href={`/${locale}${activeTier.allAccessHref}`} className="block w-full">
                <div className="w-full py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-center font-mono text-[12px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 border-t border-[#e7e5e4] cursor-pointer transition-all active:scale-[0.99]">
                  <span>{activeTier.allAccessCTA}</span>
                  <span className="text-[14px]">→</span>
                </div>
              </Link>
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
