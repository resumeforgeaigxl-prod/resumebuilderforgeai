export const dynamic = 'force-dynamic';
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Cookie Policy | ResumeForgeAI',
    description: 'Learn how ResumeForgeAI uses essential, performance, and analytics cookies.',
};

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-white py-16 px-6 md:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Back to Home */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[14px] text-[#8F8F8F] hover:text-[#171717] transition-colors mb-12"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="mb-16">
                    <p
                        className="text-[12px] font-medium tracking-[0.1em] uppercase text-[#8F8F8F] mb-4"
                        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                    >
                        Legal
                    </p>
                    <h1
                        className="text-[40px] md:text-[48px] font-bold text-[#171717] leading-[1.1] mb-4"
                        style={{ letterSpacing: '-1.28px' }}
                    >
                        Cookie Policy
                    </h1>
                    <p className="text-[14px] text-[#8F8F8F]">
                        Last updated — June 20, 2026
                    </p>
                </div>

                {/* Introduction */}
                <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-16">
                    This Cookie Policy explains how ResumeForgeAI and our family of products — including
                    CodingForge, InterviewForge, PrepForge, LearnForge, ProjectForge, CareerForge, and
                    JobForge — use cookies and similar tracking technologies when you visit any of our
                    platforms. It covers what cookies are, why we use them, and how you can control them.
                </p>

                {/* Section 01 — What Are Cookies */}
                <section className="pt-10 border-t border-[#EBEBEB]">
                    <div className="flex items-baseline gap-4 mb-4">
                        <span
                            className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.05em]"
                            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                        >
                            #01
                        </span>
                        <h2 className="text-[20px] font-bold text-[#171717]">
                            What Are Cookies
                        </h2>
                    </div>
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-16">
                        Cookies are small text files that are stored on your device (computer, tablet, or
                        mobile phone) when you visit a website. They allow the site to remember your actions
                        and preferences — such as login credentials, language, font size, and other display
                        preferences — over a period of time, so you don&apos;t have to keep re-entering them
                        every time you return or navigate between pages. Cookies may also include similar
                        technologies like local storage, session storage, and tracking pixels.
                    </p>
                </section>

                {/* Section 02 — Types of Cookies We Use */}
                <section className="pt-10 border-t border-[#EBEBEB]">
                    <div className="flex items-baseline gap-4 mb-4">
                        <span
                            className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.05em]"
                            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                        >
                            #02
                        </span>
                        <h2 className="text-[20px] font-bold text-[#171717]">
                            Types of Cookies We Use
                        </h2>
                    </div>
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-8">
                        We use different categories of cookies to operate, improve, and personalize our
                        platforms. Below is a breakdown of each type and its purpose.
                    </p>

                    <div className="space-y-4 mb-16">
                        {/* Essential Cookies */}
                        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6">
                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2">
                                Essential Cookies
                            </h3>
                            <p className="text-[15px] text-[#4D4D4D] leading-[1.7]">
                                These cookies are strictly necessary for the operation of our platforms. They
                                enable core functionality such as secure authentication sessions (managed via
                                the <code className="text-[13px] bg-[#F0F0F0] px-1.5 py-0.5 rounded font-mono">resume_forge_auth</code> cookie),
                                CSRF protection, payment processing through Razorpay and Stripe, and maintaining
                                session integrity across page loads. These cookies cannot be disabled as our
                                services cannot function without them.
                            </p>
                        </div>

                        {/* Performance Cookies */}
                        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6">
                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2">
                                Performance Cookies
                            </h3>
                            <p className="text-[15px] text-[#4D4D4D] leading-[1.7]">
                                These cookies help us measure and improve site speed, responsiveness, and overall
                                functionality. They collect information about how visitors interact with our pages —
                                such as load times, error logs, and feature usage metrics — so we can optimize
                                performance. These cookies do not collect personally identifiable information.
                            </p>
                        </div>

                        {/* Analytics Cookies */}
                        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6">
                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2">
                                Analytics Cookies
                            </h3>
                            <p className="text-[15px] text-[#4D4D4D] leading-[1.7]">
                                We use PostHog as our primary analytics provider to understand usage patterns,
                                feature adoption, and user flows across our platforms. Analytics cookies help us
                                identify which pages are most visited, how users navigate between sections, and
                                where drop-offs occur. All analytics data is processed in aggregate and is never
                                used to personally identify individual visitors.
                            </p>
                        </div>

                        {/* Preference Cookies */}
                        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6">
                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2">
                                Preference Cookies
                            </h3>
                            <p className="text-[15px] text-[#4D4D4D] leading-[1.7]">
                                These cookies remember your personalization choices — such as your preferred
                                theme (light or dark mode), locale and language settings, dashboard layout, and
                                UI preferences like sidebar state or editor configurations. They allow us to
                                provide a more tailored experience each time you return.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 03 — How We Use Cookies Across Forges */}
                <section className="pt-10 border-t border-[#EBEBEB]">
                    <div className="flex items-baseline gap-4 mb-4">
                        <span
                            className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.05em]"
                            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                        >
                            #03
                        </span>
                        <h2 className="text-[20px] font-bold text-[#171717]">
                            How We Use Cookies Across Forges
                        </h2>
                    </div>
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                        Our ecosystem of products — ResumeForge, CodingForge, InterviewForge, PrepForge,
                        LearnForge, ProjectForge, CareerForge, and JobForge — shares a unified authentication
                        and preference layer. This means a single set of essential and preference cookies supports
                        your experience across the entire platform.
                    </p>
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-16">
                        When you log in to any Forge product, your session is recognized across sibling services.
                        Preference cookies ensure your theme, locale, and layout choices carry over seamlessly.
                        Analytics cookies are scoped per product to give us granular insight into how each service
                        is used, while respecting your consent choices globally.
                    </p>
                </section>

                {/* Section 04 — Third-Party Cookies */}
                <section className="pt-10 border-t border-[#EBEBEB]">
                    <div className="flex items-baseline gap-4 mb-4">
                        <span
                            className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.05em]"
                            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                        >
                            #04
                        </span>
                        <h2 className="text-[20px] font-bold text-[#171717]">
                            Third-Party Cookies
                        </h2>
                    </div>
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                        In addition to our own cookies, we work with trusted third parties who may place cookies
                        on your device when you use our services. These include:
                    </p>
                    <ul className="list-disc pl-6 text-[16px] text-[#4D4D4D] leading-[1.75] space-y-3 mb-16">
                        <li>
                            <strong className="text-[#171717]">Payment Processors (Razorpay &amp; Stripe)</strong> —
                            These providers use cookies to securely process transactions, prevent fraud, and maintain
                            PCI-compliant payment sessions.
                        </li>
                        <li>
                            <strong className="text-[#171717]">Analytics (PostHog)</strong> —
                            PostHog sets cookies to track anonymized user events, session recordings, and feature
                            flag evaluations to help us understand product usage.
                        </li>
                        <li>
                            <strong className="text-[#171717]">Authentication Providers</strong> —
                            When you sign in via Google, GitHub, or other OAuth providers, those services may set
                            their own cookies to manage the authentication handshake.
                        </li>
                    </ul>
                </section>

                {/* Section 05 — Global Compliance */}
                <section className="pt-10 border-t border-[#EBEBEB]">
                    <div className="flex items-baseline gap-4 mb-4">
                        <span
                            className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.05em]"
                            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                        >
                            #05
                        </span>
                        <h2 className="text-[20px] font-bold text-[#171717]">
                            Global Compliance
                        </h2>
                    </div>
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                        We are committed to compliance with regional data protection and privacy regulations
                        around the world. Our cookie practices adhere to:
                    </p>
                    <ul className="list-disc pl-6 text-[16px] text-[#4D4D4D] leading-[1.75] space-y-3 mb-16">
                        <li>
                            <strong className="text-[#171717]">GDPR (European Union)</strong> —
                            We obtain explicit consent before setting non-essential cookies for users in EU/EEA
                            member states. You can withdraw consent at any time via our cookie banner.
                        </li>
                        <li>
                            <strong className="text-[#171717]">CCPA (United States — California)</strong> —
                            California residents have the right to know what personal information is collected
                            through cookies, opt out of the sale of personal data, and request deletion.
                            We do not sell personal information.
                        </li>
                        <li>
                            <strong className="text-[#171717]">IT Act, 2000 &amp; DPDP Act (India)</strong> —
                            We comply with the Information Technology Act and the Digital Personal Data Protection
                            Act with respect to how we handle data collected via cookies and similar technologies
                            for users in India.
                        </li>
                    </ul>
                </section>

                {/* Section 06 — Managing Your Preferences */}
                <section className="pt-10 border-t border-[#EBEBEB]">
                    <div className="flex items-baseline gap-4 mb-4">
                        <span
                            className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.05em]"
                            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                        >
                            #06
                        </span>
                        <h2 className="text-[20px] font-bold text-[#171717]">
                            Managing Your Preferences
                        </h2>
                    </div>
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                        You are in control of your cookie preferences. Here&apos;s how you can manage them:
                    </p>
                    <ul className="list-disc pl-6 text-[16px] text-[#4D4D4D] leading-[1.75] space-y-3 mb-6">
                        <li>
                            <strong className="text-[#171717]">Cookie Consent Banner</strong> —
                            On your first visit, our consent banner allows you to <em>Accept All</em> or{' '}
                            <em>Reject Non-Essential</em> cookies. Your choice is saved and respected on
                            subsequent visits.
                        </li>
                        <li>
                            <strong className="text-[#171717]">Browser Settings</strong> —
                            Most browsers allow you to block or delete cookies through their privacy settings.
                            Note that blocking essential cookies may prevent parts of the site from functioning
                            correctly.
                        </li>
                        <li>
                            <strong className="text-[#171717]">Clear Local Storage</strong> —
                            You can clear your browser&apos;s local storage and refresh the page to reset your
                            cookie consent preferences. The consent banner will reappear, allowing you to make
                            a new selection.
                        </li>
                    </ul>
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-16">
                        Changes to your cookie preferences take effect immediately. Previously collected data
                        from analytics cookies will not be retroactively deleted but no new data will be
                        collected once consent is withdrawn.
                    </p>
                </section>

                {/* Section 07 — Contact */}
                <section className="pt-10 border-t border-[#EBEBEB]">
                    <div className="flex items-baseline gap-4 mb-4">
                        <span
                            className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.05em]"
                            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                        >
                            #07
                        </span>
                        <h2 className="text-[20px] font-bold text-[#171717]">
                            Contact
                        </h2>
                    </div>
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                        If you have any questions about this Cookie Policy or how we handle cookies across
                        the Forges ecosystem, please reach out to us:
                    </p>
                    <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6 mb-16">
                        <p className="text-[15px] text-[#4D4D4D] leading-[1.8]">
                            <strong className="text-[#171717]">Email:</strong>{' '}
                            <a
                                href="mailto:privacy@resumeforgeai.com"
                                className="text-[#171717] underline underline-offset-4 hover:text-[#4D4D4D] transition-colors"
                            >
                                privacy@resumeforgeai.com
                            </a>
                            <br />
                            <strong className="text-[#171717]">Support:</strong>{' '}
                            Available through your dashboard or via the help center on any Forge product.
                            <br />
                            <strong className="text-[#171717]">Response Time:</strong>{' '}
                            We aim to respond to all privacy-related inquiries within 48 hours.
                        </p>
                    </div>
                </section>

                {/* Footer note */}
                <div className="pt-10 border-t border-[#EBEBEB]">
                    <p className="text-[13px] text-[#8F8F8F] leading-[1.6]">
                        This Cookie Policy is part of and should be read alongside our{' '}
                        <Link
                            href="/privacy-policy"
                            className="text-[#171717] underline underline-offset-4 hover:text-[#4D4D4D] transition-colors"
                        >
                            Privacy Policy
                        </Link>{' '}
                        and{' '}
                        <Link
                            href="/terms-of-service"
                            className="text-[#171717] underline underline-offset-4 hover:text-[#4D4D4D] transition-colors"
                        >
                            Terms of Service
                        </Link>
                        . We may update this policy from time to time to reflect changes in technology, regulation,
                        or our business operations.
                    </p>
                </div>
            </div>
        </div>
    );
}
