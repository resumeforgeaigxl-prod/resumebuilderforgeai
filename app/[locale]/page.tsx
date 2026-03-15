'use client';

import GeoSuggestionBanner from '@/components/geo/GeoSuggestionBanner';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import dynamic from 'next/dynamic';

import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import EcosystemSection from '@/components/landing/EcosystemSection';
import WorkflowSection from '@/components/landing/WorkflowSection';
import FeatureDeepDive from '@/components/landing/FeatureDeepDive';
import ForgeModules from '@/components/landing/ForgeModules';
import CareerPaths from '@/components/landing/CareerPaths';
import CapabilitiesSection from '@/components/landing/CapabilitiesSection';
import ProductExperience from '@/components/landing/ProductExperience';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTA from '@/components/landing/FinalCTA';
import PhilosophySection from '@/components/landing/PhilosophySection';
import SecurityPrivacy from '@/components/landing/SecurityPrivacy';
import Link from 'next/link';

const PricingSection = dynamic(() => import('@/components/landing/PricingSection'), {
  loading: () => <div className="h-96 animate-pulse bg-white/5 rounded-3xl" />
});

export default function Home() {
  const { t, locale } = useTranslation();
  const currentLocale = locale; // Simplified for now as we don't have region in URL usually

  return (
    <div className="min-h-screen bg-[#070710] text-white selection:bg-indigo-500/30 overflow-hidden relative font-sans">
      <GeoSuggestionBanner />

      <main className="relative z-10">
        {/* SECTION 1 — HERO */}
        <HeroSection t={t} locale={currentLocale} />

        {/* SECTION 2 — THE MODERN HIRING CRISIS */}
        <ProblemSection />

        {/* SECTION 3 — THE RESUMEFORGEAI ECOSYSTEM */}
        <EcosystemSection />

        {/* SECTION 4 — HOW THE PLATFORM WORKS */}
        <WorkflowSection />

        {/* SECTION 5 — FEATURE DEEP DIVE */}
        <FeatureDeepDive />

        {/* SECTION 6 — FORGE MODULES */}
        <ForgeModules />

        {/* SECTION 7 — SUPPORTED CAREER PATHS */}
        <CareerPaths />

        {/* SECTION 8 — PLATFORM CAPABILITIES */}
        <CapabilitiesSection />

        {/* SECTION 9 — PRODUCT EXPERIENCE */}
        <ProductExperience />

        {/* SECTION 10 — PRICING */}
        <PricingSection />

        {/* SECTION 11 — PLATFORM PHILOSOPHY */}
        <PhilosophySection />

        {/* SECTION 12 — SECURITY AND PRIVACY */}
        <SecurityPrivacy />

        {/* SECTION 13 — FAQ */}
        <FAQSection />

        {/* SECTION 14 — FINAL CALL TO ACTION */}
        <FinalCTA t={t} locale={currentLocale} />

        {/* FOOTER */}
        <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-xl font-black tracking-tighter mb-4 text-white">ResumeForgeAI</div>
              <div className="text-slate-500 text-sm max-w-xs leading-relaxed">
                The complete AI-powered career ecosystem for modern developers and candidates.
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Links</div>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Support</div>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            <div>&copy; 2026 ResumeForgeAI</div>
            <div>Precision forged for the future of work.</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
