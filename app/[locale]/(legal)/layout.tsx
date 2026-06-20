import React from "react";
import Navbar from "@/components/landing-v2/Navbar";
import FooterSection from "@/components/landing-v2/FooterSection";

export default async function LegalLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = params;

    return (
        <div className="flex-1 flex flex-col bg-white min-h-screen text-[#171717]">
            <Navbar locale={locale} />
            <main className="flex-1 flex flex-col">
                {children}
            </main>
            <FooterSection locale={locale} />
        </div>
    );
}
