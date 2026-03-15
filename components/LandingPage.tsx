import AITools from "@/components/AITools";
import CareerPaths from "@/components/CareerPaths";
import CTA from "@/components/CTA";
import DashboardPreview from "@/components/DashboardPreview";
import Ecosystem from "@/components/Ecosystem";
import Footer from "@/components/Footer";
import ForgeGrid from "@/components/ForgeGrid";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Workflow from "@/components/Workflow";
import { DEFAULT_LOCALE } from "@/lib/constants";

type LandingPageProps = {
  locale?: string;
};

export default function LandingPage({
  locale = DEFAULT_LOCALE,
}: LandingPageProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.9),rgba(5,8,22,1))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />

      <main className="relative z-10">
        <Hero locale={locale} />
        <Problem />
        <Solution />
        <Ecosystem />
        <ForgeGrid />
        <AITools />
        <CareerPaths />
        <Workflow />
        <Pricing locale={locale} />
        <DashboardPreview />
        <CTA locale={locale} />
      </main>

      <Footer locale={locale} />
    </div>
  );
}
