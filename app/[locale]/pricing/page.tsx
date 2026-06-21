import { Metadata } from 'next';
import Navbar from "@/components/landing-v2/Navbar";
import PricingSection from "@/components/landing-v2/PricingSection";
import FooterSection from "@/components/landing-v2/FooterSection";
import { BASE_URL } from "@/lib/constants";

type PricingPageProps = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({
  params,
}: PricingPageProps): Promise<Metadata> {
  const canonicalPath = `/${params.locale}/pricing`;

  return {
    metadataBase: new URL(BASE_URL),
    title: "Pricing | ResumeForgeAI",
    description:
      "Simple, transparent pricing. Choose the right plan for your career growth and start generating ATS-optimized resumes today.",
    alternates: {
      canonical: `${BASE_URL}${canonicalPath}`,
    },
    openGraph: {
      title: "Pricing | ResumeForgeAI",
      description:
        "Simple, transparent pricing. Choose the right plan for your career growth and start generating ATS-optimized resumes today.",
      url: `${BASE_URL}${canonicalPath}`,
      siteName: "ResumeForgeAI",
      type: "website",
    },
  };
}

export default function PricingPage({ params }: PricingPageProps) {
  return (
    <div className="landing-light">
      <Navbar locale={params.locale} />
      <main className="pt-8 bg-[#fafaf9]">
        <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white">
          <PricingSection locale={params.locale} />
        </div>
      </main>
      <FooterSection locale={params.locale} />
    </div>
  );
}
