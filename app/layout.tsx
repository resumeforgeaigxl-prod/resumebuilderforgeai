import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import { BASE_URL } from "@/lib/constants";

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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "ResumeForgeAI - AI Career Platform for Developers",
  description:
    "Build resumes, practice coding, prepare for interviews, and discover tech jobs using AI.",
  keywords: [
    "AI Resume Builder",
    "Coding Practice",
    "Interview Prep",
    "Tech Jobs",
    "Developer Career",
    "Next.js AI App",
    "Software Engineering Jobs",
  ],
  authors: [{ name: "ResumeForgeAI Team" }],
  openGraph: {
    title: "ResumeForgeAI - AI Career Platform for Developers",
    description: "Build resumes, practice coding, prepare for interviews, and discover tech jobs using AI.",
    url: BASE_URL,
    siteName: "ResumeForgeAI",
    images: [
      {
        url: "/dashboard-preview.png",
        width: 1200,
        height: 630,
        alt: "ResumeForgeAI Dashboard",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeForgeAI - AI Career Platform for Developers",
    description: "Build resumes, practice coding, prepare for interviews, and discover tech jobs using AI.",
    images: ["/dashboard-preview.png"],
  },
  verification: {
    google: "googlea5530cdfb982a1f8",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};


import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] antialiased`}
      >
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
