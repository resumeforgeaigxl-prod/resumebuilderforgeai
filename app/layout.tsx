import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ResumeForge AI | Build Your Dream Career",
  description: "AI-powered resume builder, ATS optimizer, and portfolio generator to help you land your dream job faster.",
};

import Header from "@/components/layout/Header";
import HeaderWrapper from "@/components/layout/HeaderWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070710] text-slate-200`}
      >
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        {children}
      </body>
    </html>
  );
}
