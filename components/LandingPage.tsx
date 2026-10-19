"use client";

import dynamic from "next/dynamic";
import { DEFAULT_LOCALE } from "@/lib/constants";

/* ── Eagerly loaded (above the fold) ── */
import GrowXLabsTopBar from "@/components/ads/GrowXLabsTopBar";
import Navbar from "@/components/landing-v2/Navbar";
import HeroSection from "@/components/landing-v2/HeroSection";
import FinalCTA from "@/components/landing-v2/FinalCTA";
import HomeJobs, { type HomeJob } from "@/components/landing-v2/HomeJobs";
import { FaqSection, ReviewsSection } from "@/components/landing-v2/HomeClose";

/* ── Lazily loaded (below the fold) ── */
const FooterSection = dynamic(() => import("@/components/landing-v2/FooterSection"), { ssr: false });

type LandingPageProps = {
  locale?: string;
  posts?: unknown;
  jobs?: HomeJob[];
};

export default function LandingPage({
  locale = DEFAULT_LOCALE,
  jobs = [],
}: LandingPageProps) {
  return (
    <div className="landing-light">
      <div className="rf-dark">
        <GrowXLabsTopBar />
        <Navbar locale={locale} />
      </div>

      <main>
        <HeroSection locale={locale} />
        <ReviewsSection />
        <HomeJobs locale={locale} jobs={jobs} />
        <FinalCTA locale={locale} />
        <FaqSection />
      </main>

      <FooterSection locale={locale} promo={false} />
    </div>
  );
}
