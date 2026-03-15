import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { BASE_URL, DEFAULT_LOCALE } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "ResumeForgeAI",
  description:
    "AI-powered platform to build resumes, practice coding, prepare for interviews, and discover tech jobs.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ResumeForgeAI",
    description:
      "AI-powered platform to build resumes, practice coding, prepare for interviews, and discover tech jobs.",
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
