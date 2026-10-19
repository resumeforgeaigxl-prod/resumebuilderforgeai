"use client";

import { useState } from "react";
import { Check } from "@/components/icons";
import Link from "next/link";

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

const offers: Record<string, { resume: string; resumeLines: string[]; forge: string; forgeLines: string[] }> = {
  Free: {
    resume: "Try the resume builder.",
    resumeLines: ["Write a resume from your experience", "Run a basic ATS check", "Download the PDF"],
    forge: "The resume builder, and a first look at the other tools.",
    forgeLines: ["The same resume tools", "A short pass at jobs, interviews, and practice", "Our mark stays on the file"],
  },
  Daily: {
    resume: "The resume builder, for one day.",
    resumeLines: ["Build and tailor the resume", "A stronger ATS check", "A PDF without our mark"],
    forge: "The resume plan, plus every forge, for 24 hours.",
    forgeLines: ["Resume, ATS check, and PDF", "Jobs, interviews, coding practice, and learning", "It ends after one day"],
  },
  Weekly: {
    resume: "The resume builder, for a week.",
    resumeLines: ["Build and tailor the resume", "A stronger ATS check", "A PDF without our mark"],
    forge: "The resume plan, plus every forge, for 7 days.",
    forgeLines: ["Resume, ATS check, and PDF", "Jobs, interviews, coding practice, and learning", "It lasts the week"],
  },
  Monthly: {
    resume: "The resume builder, for a month.",
    resumeLines: ["Build and tailor the resume", "A stronger ATS check", "A PDF without our mark"],
    forge: "The resume plan, plus every forge, for a month.",
    forgeLines: ["Resume, ATS check, and PDF", "Jobs, interviews, coding practice, and learning", "A career roadmap for the month"],
  },
  Professional: {
    resume: "The resume builder, with room to use it.",
    resumeLines: ["Build and tailor the resume", "A stronger ATS check", "A PDF without our mark"],
    forge: "Every forge, plus a person looking at the resume.",
    forgeLines: ["Resume, ATS check, and PDF", "Jobs, interviews, coding practice, and learning", "A one-to-one resume review"],
  },
};

function Feature({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[14px] leading-6 text-[#b4b8c2]">
      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#d7e4f0]" strokeWidth={2.5} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export default function PricingSection({ locale = "en-in" }: PricingSectionProps) {
  const [activeIndex, setActiveIndex] = useState(3);
  const activeTier = pricingTiersData[activeIndex];
  const offer = offers[activeTier.name];

  return (
    <section id="pricing" className="bg-[#050505] text-[#f4f5f7]">
      <div className="mx-auto max-w-[1120px] px-5 py-14 sm:px-8 sm:py-20">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#8b909a]">
          Pricing
        </p>
        <h1
          className="mt-4 max-w-[12ch] text-[clamp(36px,5vw,56px)] font-normal leading-[1.05] tracking-[-0.03em]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Simple pricing.
        </h1>
        <p className="mt-4 max-w-[36rem] text-[15px] leading-relaxed text-[#b4b8c2] sm:text-base">
          Choose how long you need it.
        </p>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Billing period">
          {pricingTiersData.map((tier, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={tier.name}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveIndex(index)}
                className={`h-9 cursor-pointer rounded-full px-4 text-[13px] font-medium transition-colors ${
                  selected
                    ? "bg-[#f4f5f7] text-[#0c0d10]"
                    : "border border-[#3a3d46] text-[#f4f5f7] hover:bg-[#16171b]"
                }`}
              >
                {tier.name}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-2">
          <article className="flex flex-col rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5 sm:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8b909a]">Resume</p>
            <div className="mt-5 flex items-end gap-3">
              <p
                className="text-[52px] leading-none tracking-[-0.04em] text-[#f4f5f7] sm:text-[60px]"
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                {activeTier.standardPrice}
              </p>
              <p className="pb-1 text-sm text-[#8b909a]">/ {activeTier.standardPeriod}</p>
            </div>
            <p className="mt-4 max-w-[28ch] text-[15px] leading-6 text-[#f4f5f7]">{offer.resume}</p>
            <p className="mt-2 text-sm text-[#8b909a]">{activeTier.limit} a day</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {offer.resumeLines.map((line) => (
                <Feature key={line}>{line}</Feature>
              ))}
            </ul>
            <Link
              href={`/${locale}${activeTier.standardHref}`}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-[#3a3d46] text-sm font-medium text-[#f4f5f7] transition-colors hover:bg-[#16171b]"
            >
              {activeTier.standardCTA}
            </Link>
          </article>

          <article className="flex flex-col rounded-2xl border border-[#d7e4f0]/40 bg-[#0c0d10] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#d7e4f0]">Resume and forges</p>
              <span className="rounded-full border border-[#2a2c33] px-2.5 py-1 text-[11px] text-[#b4b8c2]">
                Recommended
              </span>
            </div>
            <div className="mt-5 flex items-end gap-3">
              <p
                className="text-[52px] leading-none tracking-[-0.04em] text-[#d7e4f0] sm:text-[60px]"
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                {activeTier.allAccessPrice}
              </p>
              <p className="pb-1 text-sm text-[#8b909a]">/ {activeTier.allAccessPeriod}</p>
            </div>
            <p className="mt-4 max-w-[32ch] text-[15px] leading-6 text-[#f4f5f7]">{offer.forge}</p>
            <p className="mt-2 text-sm text-[#8b909a]">{activeTier.limit} a day</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {offer.forgeLines.map((line) => (
                <Feature key={line}>{line}</Feature>
              ))}
            </ul>
            <Link
              href={`/${locale}${activeTier.allAccessHref}`}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#f4f5f7] text-sm font-medium text-[#0c0d10] transition-colors hover:bg-white"
            >
              {activeTier.allAccessCTA}
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
