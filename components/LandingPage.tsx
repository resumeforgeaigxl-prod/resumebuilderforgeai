"use client";

import dynamic from "next/dynamic";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { useEffect, useState } from "react";

/* ── Eagerly loaded (above the fold) ── */
import GrowXLabsTopBar from "@/components/ads/GrowXLabsTopBar";
import Navbar from "@/components/landing-v2/Navbar";
import HeroSection from "@/components/landing-v2/HeroSection";
import FinalCTA from "@/components/landing-v2/FinalCTA";

/* ── Lazily loaded (below the fold) ── */
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
      <div className="rf-dark">
        <GrowXLabsTopBar />
        <Navbar locale={locale} />
      </div>

      <main>
        <HeroSection locale={locale} />
        <FinalCTA locale={locale} />
      </main>

      <FooterSection locale={locale} promo={false} />

      {showBanners && (
        <>
          <CookieBanner />
          <InstallBanner />
        </>
      )}
    </div>
  );
}
