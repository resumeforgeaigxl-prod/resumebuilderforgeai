import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/layout/Header";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/ui/CookieBanner";
import { I18nProvider } from "@/lib/i18n/I18nProvider";


const geistSans = localFont({
    src: "../fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
    display: "swap",
    preload: true,
});
const geistMono = localFont({
    src: "../fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
    display: "swap",
    preload: true,
});

const BASE_URL = "https://resumeforgeai.in";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
    const { locale } = params;

    // Define all supported region+lang combinations for hreflang
    const regions = ['in', 'us', 'eu'];

    const languagesMap: Record<string, string[]> = {
        'in': ['en', 'hi', 'te', 'ta', 'ml'],
        'us': ['en', 'es'],
        'eu': ['en', 'fr', 'de', 'es']
    };

    const hreflangs: Record<string, string> = {};
    regions.forEach(r => {
        (languagesMap[r] || ['en']).forEach(l => {
            // e.g. en-IN, hi-IN, en-US, fr-EU
            const key = `${l}-${r.toUpperCase()}`;
            hreflangs[key] = `${BASE_URL}/${l}-${r}`;
        });
    });

    // Add x-default
    hreflangs['x-default'] = `${BASE_URL}/en-in`;

    return {
        metadataBase: new URL(BASE_URL),
        title: {
            default: "AI Resume Builder | ResumeForgeAI",
            template: "%s | ResumeForgeAI",
        },
        description: "Build ATS optimized resumes using AI. Generate resumes, cover letters, practice AI mock interviews and discover job opportunities using ResumeForgeAI.",
        alternates: {
            canonical: `${BASE_URL}/${locale}`,
            languages: hreflangs,
        },
        manifest: '/manifest.json',
        appleWebApp: {
            capable: true,
            statusBarStyle: 'default',
            title: 'ResumeForgeAI',
        },
    };
}

import FooterWrapper from "@/components/layout/FooterWrapper";
import InstallBanner from "@/components/pwa/InstallBanner";
import Script from "next/script";

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = params;
    const [lang, region] = locale.split('-');

    return (
        <I18nProvider>
            <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070710] text-slate-200 min-h-screen flex flex-col`}>
                <HeaderWrapper>
                    <Header lang={lang} region={region} />
                </HeaderWrapper>
                <div className="flex-1 flex flex-col">
                    {children}
                </div>
                <FooterWrapper>
                    <Footer />
                </FooterWrapper>
                <CookieBanner />
                <InstallBanner />
                
                <Script
                    id="service-worker-reg"
                    strategy="lazyOnload"
                    dangerouslySetInnerHTML={{
                        __html: `
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', function() {
                                navigator.serviceWorker.register('/sw.js');
                            });
                        }
                        `,
                    }}
                />
            </div>
        </I18nProvider>
    );
}
