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
import { PostHogInit } from "@/components/providers/PostHogProvider";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/jwt";
import { createClient } from "@/lib/supabase/server";

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
