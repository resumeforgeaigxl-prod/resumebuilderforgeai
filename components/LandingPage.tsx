"use client";

import dynamic from "next/dynamic";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { useEffect, useState } from "react";

/* ── Eagerly loaded (above the fold) ── */
import Navbar from "@/components/landing-v2/Navbar";
import HeroSection from "@/components/landing-v2/HeroSection";

/* ── Lazily loaded (below the fold) ── */
const TrustBar = dynamic(() => import("@/components/landing-v2/TrustBar"), { ssr: true });
const FeaturesGrid = dynamic(() => import("@/components/landing-v2/FeaturesGrid"), { ssr: true });
const WorkflowTimeline = dynamic(() => import("@/components/landing-v2/WorkflowTimeline"), { ssr: true });
const PlatformEcosystem = dynamic(() => import("@/components/landing-v2/PlatformEcosystem"), { ssr: true });
const ATSDashboard = dynamic(() => import("@/components/landing-v2/ATSDashboard"), { ssr: false });
const PricingSection = dynamic(() => import("@/components/landing-v2/PricingSection"), { ssr: false });
const FinalCTA = dynamic(() => import("@/components/landing-v2/FinalCTA"), { ssr: false });
const FooterSection = dynamic(() => import("@/components/landing-v2/FooterSection"), { ssr: false });
const CookieBanner = dynamic(() => import("@/components/ui/CookieBanner"), { ssr: false });
const InstallBanner = dynamic(() => import("@/components/pwa/InstallBanner"), { ssr: false });

type LandingPageProps = {
  locale?: string;
  posts?: any;
};

export default function LandingPage({
  locale = DEFAULT_LOCALE,
  posts,
}: LandingPageProps) {
  const [showBanners, setShowBanners] = useState(false);

  useEffect(() => {
    // Delay banners to free up main thread for initial render
    const timer = setTimeout(() => setShowBanners(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-light">
      <Navbar locale={locale} />

      <main>
        <HeroSection locale={locale} />
        <TrustBar />
        <FeaturesGrid />
        <WorkflowTimeline />
        <PlatformEcosystem locale={locale} />
        <ATSDashboard />
        <PricingSection locale={locale} />
        <FinalCTA locale={locale} />
      </main>

      <FooterSection locale={locale} />

      {showBanners && (
        <>
          <CookieBanner />
          <InstallBanner />
        </>
      )}
    </div>
  );
}
