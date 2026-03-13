'use client';

import GeoSuggestionBanner from '@/components/geo/GeoSuggestionBanner';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import dynamic from 'next/dynamic';

import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import PlatformOverview from '@/components/landing/PlatformOverview';
import FeatureGrid from '@/components/landing/FeatureGrid';
import ProductDemo from '@/components/landing/ProductDemo';
import UseCases from '@/components/landing/UseCases';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTA from '@/components/landing/FinalCTA';

const PricingSection = dynamic(() => import('@/components/landing/PricingSection'), {
  loading: () => <div className="h-96 animate-pulse bg-white/5 rounded-3xl" />
});

const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection'), {
  loading: () => <div className="h-64 animate-pulse bg-white/5 rounded-2xl" />
});

export default function Home() {
  const { t, locale, region } = useTranslation();
  const currentLocale = `${locale}-${region}`;

  return (
    <div className="min-h-screen bg-[#070710] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <GeoSuggestionBanner />

      <main className="relative z-10">
        <HeroSection t={t} locale={currentLocale} />
        <ProblemSection />
        <PlatformOverview />
        <FeatureGrid t={t} />
        <ProductDemo />
        <UseCases />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA t={t} locale={currentLocale} />

        <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
          <div className="mb-4 text-white">ResumeForgeAI Ecosystem</div>
          <div>&copy; 2026 ResumeForgeAI Inc. All rights reserved. Precision forged for the future of work.</div>
        </footer>
      </main>
    </div>
  );
}
