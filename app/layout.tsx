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
  title: "ResumeForgeAI",
  description:
    "AI-powered platform to build resumes, practice coding, prepare for interviews, and discover tech jobs.",
};

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
        {children}
      </body>
    </html>
  );
}
