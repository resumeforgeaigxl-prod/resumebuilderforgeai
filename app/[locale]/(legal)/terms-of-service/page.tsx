export const dynamic = 'force-dynamic';
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service | ResumeForgeAI',
    description: 'Terms of Service for using ResumeForgeAI across global regions.',
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white py-16 px-6 md:px-8">
            <div className="max-w-3xl mx-auto">

                {/* Back Link */}
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
                        className="text-[12px] font-medium uppercase tracking-[1.6px] text-[#8F8F8F] mb-4"
                        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                    >
                        Legal
                    </p>
                    <h1
                        className="text-[40px] md:text-[48px] font-bold text-[#171717] leading-[1.1] mb-4"
                        style={{ letterSpacing: '-1.28px' }}
                    >
                        Terms of Service
                    </h1>
                    <p className="text-[14px] text-[#8F8F8F]">
                        Last updated — June 20, 2026
                    </p>
                </div>

                {/* Introduction */}
                <div className="mb-12">
                    <p className="text-[16px] text-[#4D4D4D] leading-relaxed">
                        Welcome to the Forges ecosystem. These Terms of Service (&quot;Terms&quot;) constitute a legally
                        binding agreement between you and ResumeForge AI (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                        governing your access to and use of our platforms, including ResumeForge, CodingForge,
                        InterviewForge, PrepForge, LearnForge, ProjectForge, CareerForge, and JobForge
                        (collectively, the &quot;Service&quot;). Please read these Terms carefully before using the Service.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-0">

                    {/* Section 01 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #01
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Acceptance of Terms
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                By registering for, accessing, or using any part of the Service, you acknowledge that you
                                have read, understood, and agree to be bound by these Terms. If you do not agree, you must
                                immediately discontinue use of the Service.
                            </p>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                We reserve the right to modify these Terms at any time. When material changes are made, we
                                will update the &quot;Last updated&quot; date above and may notify you via email or an in-app
                                notification. Your continued use of the Service following any amendments constitutes your
                                acceptance of the revised Terms.
                            </p>
                            <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-5 mt-4">
                                <p className="text-[14px] text-[#4D4D4D] leading-relaxed">
                                    <strong className="text-[#171717]">Important:</strong> If you are under 18 years of age,
                                    you may only use the Service with the involvement and consent of a parent or legal guardian.
                                    By using the Service, you represent that you meet this requirement.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 02 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #02
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Description of Service
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                The Forges ecosystem provides a comprehensive suite of AI-powered career development tools.
                                The Service includes, but is not limited to, the following platforms:
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        <strong className="text-[#171717]">ResumeForge</strong> — AI-powered resume creation,
                                        formatting, optimization, and ATS scoring tools.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        <strong className="text-[#171717]">CodingForge</strong> — Coding challenges, technical
                                        assessments, and algorithmic practice environments.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        <strong className="text-[#171717]">InterviewForge</strong> — AI mock interviews,
                                        real-time feedback, and behavioral question preparation.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        <strong className="text-[#171717]">PrepForge</strong> — Structured study plans and
                                        placement preparation resources.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        <strong className="text-[#171717]">LearnForge</strong> — Curated learning paths,
                                        skill assessments, and educational content.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        <strong className="text-[#171717]">ProjectForge</strong> — Guided project building,
                                        portfolio generation, and showcase tools.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        <strong className="text-[#171717]">CareerForge</strong> — Career path mapping, skill
                                        gap analysis, and professional development recommendations.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        <strong className="text-[#171717]">JobForge</strong> — AI-curated job board, application
                                        tracking, and employer matching services.
                                    </span>
                                </li>
                            </ul>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                We continuously evolve our platforms and may add, modify, or discontinue features at our
                                discretion. Service availability, feature limits, and pricing may vary by region.
                            </p>
                        </div>
                    </section>

                    {/* Section 03 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #03
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Account Registration &amp; Security
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                To access certain features of the Service, you must create an account. When registering, you
                                agree to provide accurate, current, and complete information and to keep your account details
                                up to date.
                            </p>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                You are solely responsible for maintaining the confidentiality of your login credentials and
                                for all activities that occur under your account. You must immediately notify us of any
                                unauthorized use of your account or any other security breach.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        You may not create multiple accounts to circumvent usage limits or bans.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        You may not share your account credentials with third parties.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        We reserve the right to suspend or delete accounts that remain inactive for extended
                                        periods, subject to prior notice.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 04 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #04
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                User Responsibilities &amp; Conduct
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                You agree to use the Service only for lawful purposes and in accordance with these Terms. As
                                a user of the Service, you expressly agree not to:
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Falsify, fabricate, or deliberately misrepresent your professional qualifications, work
                                        history, educational background, or any other information on your resume or profile.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Abuse, harass, threaten, or impersonate other users or any person.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Scrape, crawl, or use automated systems to extract data from the Service without
                                        explicit written authorization.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Attempt to bypass, disable, or circumvent any security features, payment mechanisms,
                                        or usage restrictions.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Upload or transmit viruses, malware, or any harmful code that may damage or interfere
                                        with the Service.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Violate any applicable local, state, national, or international law, including but not
                                        limited to laws of India, the United States, and the European Union.
                                    </span>
                                </li>
                            </ul>
                            <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-5">
                                <p className="text-[14px] text-[#4D4D4D] leading-relaxed">
                                    <strong className="text-[#171717]">Note:</strong> Violations of these conduct rules may
                                    result in immediate account suspension or termination without prior notice, at our sole
                                    discretion.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 05 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #05
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Subscriptions, Payments &amp; Refunds
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                Certain features of the Service are available through paid subscription plans. By purchasing
                                a subscription, you agree to the following:
                            </p>

                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2 mt-6">Payment Processing</h3>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                All payments are processed securely through our third-party payment partners, Razorpay and
                                Stripe. We do not directly store your credit card or bank account information. By providing
                                your payment details, you authorize us to charge the applicable subscription fees to your
                                selected payment method.
                            </p>

                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2 mt-6">Billing &amp; Renewal</h3>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                Subscriptions renew automatically at the end of each billing cycle unless cancelled prior to
                                the renewal date. Pricing and billing currency may vary by region. Any price changes will be
                                communicated with at least 30 days notice before your next billing cycle.
                            </p>

                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2 mt-6">Cancellation</h3>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                You may cancel your subscription at any time from your account settings. Upon cancellation,
                                you will retain access to paid features until the end of your current billing period. No
                                partial refunds are issued for the remaining days in a billing cycle.
                            </p>

                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2 mt-6">Refund Policy</h3>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                Due to the digital and instantaneous nature of AI-generated services, refunds are generally
                                not provided. However, we may consider refund requests on a case-by-case basis under the
                                following circumstances:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Duplicate or erroneous charges resulting from technical issues.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Service outages lasting more than 72 consecutive hours affecting your subscription period.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Requests submitted within 48 hours of purchase where the core service has not been
                                        utilized.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 06 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #06
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                AI-Generated Content Disclaimer
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                The Service leverages artificial intelligence and machine learning models to generate
                                suggestions, recommendations, and content across all Forge platforms. You acknowledge and
                                agree that:
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        AI-generated content is provided as suggestions only and should be reviewed, edited,
                                        and verified by you before use.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        AI outputs do not constitute professional career advice, legal advice, or any form of
                                        guaranteed outcome.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        AI models may occasionally produce inaccurate, incomplete, or biased content. You are
                                        responsible for verifying the accuracy of all generated content.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        We do not guarantee that AI suggestions will result in interview invitations,
                                        job offers, or career advancement.
                                    </span>
                                </li>
                            </ul>
                            <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-5">
                                <p className="text-[14px] text-[#4D4D4D] leading-relaxed">
                                    <strong className="text-[#171717]">Disclaimer:</strong> You are solely responsible for
                                    the final content of your resumes, cover letters, interview responses, and any other
                                    materials produced using the Service. The Company shall not be held liable for consequences
                                    arising from AI-generated content that you choose to use without appropriate review.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 07 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #07
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Intellectual Property
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2">Our Property</h3>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                All template designs, structural formats, UI components, algorithms, AI models, branding,
                                logos, and the overall look and feel of the Service are the exclusive intellectual property of
                                ResumeForge AI and are protected by applicable copyright, trademark, and other intellectual
                                property laws. You may not reproduce, distribute, modify, or create derivative works from any
                                part of our intellectual property without prior written consent.
                            </p>

                            <h3 className="text-[16px] font-semibold text-[#171717] mb-2 mt-6">Your Content</h3>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                You retain full ownership of the personal text, data, and content you provide to and create
                                through the Service. This includes your resume text, personal information, cover letters,
                                project descriptions, and any other original content you input.
                            </p>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                By using the Service, you grant us a limited, non-exclusive, revocable license to use,
                                process, display, and store your content solely for the purpose of operating, maintaining, and
                                improving the Service. We will never sell your personal content to third parties.
                            </p>
                        </div>
                    </section>

                    {/* Section 08 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #08
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Limitation of Liability
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                To the maximum extent permitted by applicable law, ResumeForge AI and its directors, officers,
                                employees, affiliates, and agents shall not be liable for any indirect, incidental, special,
                                consequential, or punitive damages arising out of or related to your use of the Service,
                                including but not limited to:
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Loss of employment opportunities or failure to secure interviews, offers, or positions.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Inaccuracies or errors in AI-generated content that you chose to publish or submit.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Loss of data, revenue, or business opportunities.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Service interruptions, downtime, or technical failures.
                                    </span>
                                </li>
                            </ul>
                            <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-5">
                                <p className="text-[14px] text-[#4D4D4D] leading-relaxed">
                                    <strong className="text-[#171717]">No Employment Guarantee:</strong> The Service is
                                    designed to assist and optimize your career materials. We provide tools, not outcomes.
                                    ResumeForge AI expressly does not guarantee employment, interviews, or any specific career
                                    results from using the Service.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 09 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #09
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Termination
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                We reserve the right to suspend, restrict, or permanently terminate your access to the
                                Service at any time and for any reason, including but not limited to:
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Violation of these Terms or any applicable policies.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Fraudulent, abusive, or illegal activity associated with your account.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Non-payment of subscription fees.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] mt-2 flex-shrink-0" />
                                    <span className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                        Extended account inactivity (after prior notice).
                                    </span>
                                </li>
                            </ul>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                Upon termination, your right to use the Service ceases immediately. We may, at our discretion,
                                provide you with a reasonable window to export your data before account deletion. Provisions
                                of these Terms that by their nature should survive termination (including intellectual property,
                                limitation of liability, and governing law) shall survive.
                            </p>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                You may also voluntarily terminate your account at any time by contacting our support team or
                                using the account deletion option in your settings.
                            </p>
                        </div>
                    </section>

                    {/* Section 10 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #10
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Governing Law
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                These Terms shall be governed by and construed in accordance with the laws of the Republic of
                                India, without regard to its conflict of law provisions. For users located outside India, we
                                acknowledge the applicability of local consumer protection laws in your jurisdiction to the
                                extent required by mandatory law.
                            </p>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-4">
                                Any disputes arising from or relating to these Terms or the Service shall be subject to the
                                exclusive jurisdiction of the courts located in New Delhi, India, unless otherwise required by
                                the mandatory consumer protection laws of your country of residence.
                            </p>
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed">
                                For users within the European Union, nothing in these Terms affects your rights under the EU
                                General Data Protection Regulation (GDPR) or applicable EU consumer protection directives. For
                                users within the United States, applicable federal and state laws shall apply to the extent they
                                supersede these provisions.
                            </p>
                        </div>
                    </section>

                    {/* Section 11 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-4">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-wide"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #11
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Contact
                            </h2>
                        </div>
                        <div className="pl-[52px]">
                            <p className="text-[16px] text-[#4D4D4D] leading-relaxed mb-6">
                                If you have any questions, concerns, or feedback regarding these Terms of Service, please
                                reach out to us through any of the following channels:
                            </p>
                            <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-6">
                                <div className="space-y-3">
                                    <p className="text-[15px] text-[#4D4D4D]">
                                        <strong className="text-[#171717]">Email:</strong>{' '}
                                        <a
                                            href="mailto:legal@resumeforgeai.com"
                                            className="text-[#171717] underline underline-offset-4 hover:text-[#4D4D4D] transition-colors"
                                        >
                                            legal@resumeforgeai.com
                                        </a>
                                    </p>
                                    <p className="text-[15px] text-[#4D4D4D]">
                                        <strong className="text-[#171717]">Support:</strong>{' '}
                                        <a
                                            href="mailto:support@resumeforgeai.com"
                                            className="text-[#171717] underline underline-offset-4 hover:text-[#4D4D4D] transition-colors"
                                        >
                                            support@resumeforgeai.com
                                        </a>
                                    </p>
                                    <p className="text-[15px] text-[#4D4D4D]">
                                        <strong className="text-[#171717]">Address:</strong> ResumeForge AI, New Delhi, India
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-[#EBEBEB]">
                    <p className="text-[13px] text-[#8F8F8F] leading-relaxed">
                        By using the Service, you acknowledge that you have read, understood, and agree to be bound
                        by these Terms of Service. These Terms constitute the entire agreement between you and
                        ResumeForge AI with respect to your use of the Service.
                    </p>
                </div>

            </div>
        </div>
    );
}
