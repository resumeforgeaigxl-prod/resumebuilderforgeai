export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { BASE_URL, DEFAULT_LOCALE } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "ResumeForgeAI | AI-Powered Career Platform for Developers",
  description:
    "Build ATS-optimized resumes, practice coding, prepare for interviews, and discover tech jobs with the ResumeForgeAI ecosystem.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "ResumeForgeAI | AI-Powered Career Platform for Developers",
    description:
      "Build ATS-optimized resumes, practice coding, prepare for interviews, and discover tech jobs with the ResumeForgeAI ecosystem.",
    url: BASE_URL,
    siteName: "ResumeForgeAI",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/dashboard-preview.png`,
        width: 1440,
        height: 900,
        alt: "ResumeForgeAI dashboard preview",
      },
    ],
  },
};

export default function Home() {
  return <LandingPage locale={DEFAULT_LOCALE} />;
}
