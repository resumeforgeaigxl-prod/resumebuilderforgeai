"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
const Problem = dynamic(() => import("@/components/Problem"), { ssr: true });
const Solution = dynamic(() => import("@/components/Solution"), { ssr: true });
const Ecosystem = dynamic(() => import("@/components/Ecosystem"), { ssr: true });
const ForgeGrid = dynamic(() => import("@/components/ForgeGrid"), { ssr: true });
const WhatsNew = dynamic(() => import("@/components/WhatsNew"), { ssr: true });
const AITools = dynamic(() => import("@/components/AITools"), { ssr: false });
const CareerPaths = dynamic(() => import("@/components/CareerPaths"), { ssr: false });
const Workflow = dynamic(() => import("@/components/Workflow"), { ssr: false });
const Pricing = dynamic(() => import("@/components/Pricing"), { ssr: false });
const DashboardPreview = dynamic(() => import("@/components/DashboardPreview"), { ssr: false });
const CTA = dynamic(() => import("@/components/CTA"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const CookieBanner = dynamic(() => import("@/components/ui/CookieBanner"), { ssr: false });
const InstallBanner = dynamic(() => import("@/components/pwa/InstallBanner"), { ssr: false });

import { DEFAULT_LOCALE } from "@/lib/constants";
import { BlogPost } from "@/lib/seo-service";
import { EtheralShadow } from "@/components/ui/etheral-shadow";
import { useEffect, useState } from "react";

type LandingPageProps = {
  locale?: string;
  posts?: BlogPost[];
};

export default function LandingPage({
  locale = DEFAULT_LOCALE,
  posts = [],
}: LandingPageProps) {
  const [showBanners, setShowBanners] = useState(false);

  useEffect(() => {
    // Delay banners to free up main thread for initial render
    const timer = setTimeout(() => setShowBanners(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#080B16]">
      {/* Ethereal Shadow — animated hero background */}
      <div className="pointer-events-none absolute inset-0 h-[110vh]">
        <EtheralShadow
          color="rgba(0, 212, 160, 0.3)"
          animation={{ scale: 60, speed: 40 }}
          noise={{ opacity: 0.4, scale: 1.0 }}
          sizing="fill"
          style={{ opacity: 0.6 }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:120px_120px] opacity-15 [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />

      {/* Bottom fade to solid bg */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#080B16] to-transparent" />

      <main className="relative z-10">
        <Hero locale={locale} />
        <Problem />
        <Solution />
        <Ecosystem />
        <ForgeGrid locale={locale} />
        <WhatsNew locale={locale} posts={posts} />
        <AITools />
        <CareerPaths />
        <Workflow />
        <Pricing locale={locale} />
        <DashboardPreview />
        <CTA locale={locale} />
      </main>

      <Footer locale={locale} />
      
      {showBanners && (
        <>
          <CookieBanner />
          <InstallBanner />
        </>
      )}
    </div>
  );
}
