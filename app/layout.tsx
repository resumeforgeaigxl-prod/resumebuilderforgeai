import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import { PostHogInit } from "@/components/providers/PostHogProvider";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/jwt";
import { createClient } from "@/lib/supabase/server";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const BASE_URL = "https://resumeforgeai.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "AI Resume Builder | ResumeForgeAI",
    template: "%s | ResumeForgeAI",
  },
  description:
    "Build ATS optimized resumes using AI. Generate resumes, cover letters, practice AI mock interviews and discover job opportunities using ResumeForgeAI.",
  keywords: [
    "AI resume builder",
    "ATS resume builder",
    "resume generator",
    "AI mock interview",
    "job preparation AI",
    "resume builder for freshers",
    "free resume builder India",
    "cover letter generator",
    "AI interview practice",
    "job search AI",
  ],
  authors: [{ name: "ResumeForgeAI", url: BASE_URL }],
  creator: "ResumeForgeAI",
  publisher: "ResumeForgeAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "ResumeForgeAI",
    title: "ResumeForgeAI — AI Resume Builder & Interview Prep",
    description:
      "Build AI powered resumes instantly and prepare for interviews with ResumeForgeAI.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ResumeForgeAI — AI Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeForgeAI — AI Resume Builder & Interview Prep",
    description:
      "Build ATS optimized resumes, generate cover letters and practice AI mock interviews.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@resumeforgeai",
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    // Add your Google Search Console verification token here when ready:
    // google: "YOUR_GOOGLE_VERIFICATION_TOKEN",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ResumeForgeAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: BASE_URL,
  description:
    "AI powered resume builder and interview preparation platform for freshers and professionals.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  featureList: [
    "AI Resume Builder",
    "ATS Score Checker",
    "AI Mock Interview",
    "Cover Letter Generator",
    "Job Board",
    "Portfolio Builder",
  ],
  screenshot: `${BASE_URL}/og-image.png`,
  creator: {
    "@type": "Organization",
    name: "ResumeForgeAI",
    url: BASE_URL,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  let user = null;

  if (session) {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("users")
      .select("id, email, full_name")
      .eq("id", session.userId)
      .single();

    if (data) {
      user = { id: data.id, email: data.email, name: data.full_name as string };
    }
  }

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070710] text-slate-200`}
      >
        <Suspense fallback={null}>
          <PostHogInit user={user} />
        </Suspense>
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        {children}
      </body>
    </html>
  );
}
