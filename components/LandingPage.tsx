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
import { DEFAULT_LOCALE } from "@/lib/constants";
import { BlogPost } from "@/lib/seo-service";

type LandingPageProps = {
  locale?: string;
  posts?: BlogPost[];
};

export default function LandingPage({
  locale = DEFAULT_LOCALE,
  posts = [],
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
    </div>
  );
}
