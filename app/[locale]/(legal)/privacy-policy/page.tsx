export const dynamic = 'force-dynamic';
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy | ResumeForgeAI',
    description: 'Privacy Policy for ResumeForgeAI detailing data collection, usage, third-party services, and security practices across the Forges ecosystem.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">

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
                    <span
                        className="inline-block text-[12px] font-medium tracking-[0.1em] uppercase text-[#8F8F8F] mb-4"
                        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                    >
                        Legal
                    </span>
                    <h1
                        className="text-[40px] md:text-[48px] font-bold text-[#171717] leading-[1.1] mb-4"
                        style={{ letterSpacing: '-1.28px' }}
                    >
                        Privacy Policy
                    </h1>
                    <p className="text-[14px] text-[#8F8F8F]">
                        Last updated — June 20, 2026
                    </p>
                </div>

                {/* Intro */}
                <div className="mb-12">
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75]">
                        Your privacy matters to us. This Privacy Policy explains how ResumeForge AI
                        (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, shares, and protects
                        your personal information when you use any product across the Forges ecosystem — including
                        ResumeForge, CodingForge, InterviewForge, PrepForge, LearnForge, ProjectForge, CareerForge,
                        and JobForge. By using our services, you agree to the practices described below.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-0">

                    {/* Section 01 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #01
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Data We Collect
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            We collect information necessary to provide, personalize, and improve our services.
                            The categories of data we collect include:
                        </p>
                        <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75]">
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Account Data</strong> — Your name, email
                                    address, profile picture, and authentication credentials provided during
                                    registration or social login.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Resume &amp; Career Content</strong> — Work
                                    experience, education history, skills, certifications, projects, and any
                                    personal details you input into our builders across all Forge products.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Usage Data</strong> — Pages visited,
                                    features used, session duration, device type, browser type, IP address, and
                                    interactions within the platform.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Cookies &amp; Tracking</strong> — We use
                                    cookies, local storage, and similar technologies to maintain sessions,
                                    remember preferences, and analyze usage patterns.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 02 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #02
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                How We Use Your Data
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            Your data is used strictly to power and enhance the services you use.
                            Specifically, we use your information to:
                        </p>
                        <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75]">
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    Generate, format, and optimize resumes, cover letters, and career
                                    documents using AI models.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    Provide personalized job matching, ATS compatibility scoring, and
                                    tailored job recommendations.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    Power AI interview coaching, coding challenges, and real-time feedback
                                    across Forge products.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    Communicate with you about account status, billing, feature updates,
                                    and security alerts.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    Analyze aggregated usage patterns to improve platform performance,
                                    reliability, and user experience.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 03 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #03
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                The Forge Ecosystem
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            ResumeForge AI operates a connected ecosystem of career development tools.
                            Your data may flow between the following products to deliver a unified
                            experience under a single account:
                        </p>
                        <div className="rounded-xl bg-[#FAFAFA] border border-[#EBEBEB] p-6 mb-6">
                            <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75]">
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">ResumeForge</strong> — AI resume
                                        and cover letter builder. Your career data is used to generate
                                        optimized documents.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">CodingForge</strong> — Coding
                                        challenge platform. Your skill data and coding submissions are used
                                        to personalize problem recommendations.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">InterviewForge</strong> — AI mock
                                        interview platform. Your resume and target roles inform interview
                                        question generation and feedback.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">PrepForge</strong> — Exam and
                                        certification prep. Your learning history is used to adapt study
                                        plans and track progress.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">LearnForge</strong> — Skill
                                        development and learning paths. Course progress and assessments may
                                        inform other Forge recommendations.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">ProjectForge</strong> — Project
                                        portfolio builder. Your project data may be referenced in resume
                                        generation and job matching.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">CareerForge</strong> — Career
                                        roadmap and mentorship tool. Your career goals and progress are
                                        shared to personalize guidance.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">JobForge</strong> — Job search
                                        and application tracker. Your resume, preferences, and application
                                        history are used to surface relevant opportunities.
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75]">
                            Data sharing across Forge products is internal only and governed by this
                            policy. You can manage cross-product data sharing preferences from your
                            account settings at any time.
                        </p>
                    </section>

                    {/* Section 04 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #04
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Third-Party Services
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            We do not sell your personal data. We share the minimum necessary data
                            with trusted third-party providers solely to operate and deliver our
                            services:
                        </p>
                        <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75]">
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Brevo</strong> — Transactional
                                    and marketing email delivery. Your email address and name are shared
                                    to send account notifications, onboarding emails, and product updates.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Razorpay &amp; Stripe</strong> —
                                    Secure payment processing and subscription management. We never store
                                    your full card details — all payment data is handled directly by these
                                    PCI-DSS compliant processors.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Job Board APIs</strong> — We
                                    integrate with external job listing providers to fetch real-time job
                                    postings, provide ATS match scores, and surface relevant opportunities
                                    within JobForge.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">AI Providers</strong> — We use
                                    third-party large language model providers to power resume generation,
                                    interview coaching, and content optimization. Your content is sent
                                    to these providers for processing but is not used to train their models.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 05 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #05
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Data Storage &amp; Security
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            We take the security of your data seriously and implement
                            industry-standard measures to protect it:
                        </p>
                        <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    All data is transmitted over HTTPS with TLS 1.2+ encryption.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    Sensitive data at rest is encrypted using AES-256 encryption standards.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    Authentication tokens are securely managed with short expiry windows
                                    and refresh rotation.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    Access to production systems is restricted through role-based access
                                    controls (RBAC) and audit logging.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    Regular security audits and vulnerability assessments are conducted
                                    to maintain the integrity of our systems.
                                </span>
                            </li>
                        </ul>
                        <div className="rounded-xl bg-[#FAFAFA] border border-[#EBEBEB] p-5">
                            <p className="text-[14px] text-[#4D4D4D] leading-[1.7]">
                                While we strive to protect your data using commercially reasonable
                                measures, no method of electronic transmission or storage is 100%
                                secure. We encourage you to use strong, unique passwords and enable
                                two-factor authentication when available.
                            </p>
                        </div>
                    </section>

                    {/* Section 06 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #06
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Data Retention &amp; Deletion
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            We retain your personal data only for as long as necessary to fulfill the
                            purposes described in this policy, or as required by law:
                        </p>
                        <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Active accounts:</strong> Your data
                                    is retained for the duration of your account&apos;s active status.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Deleted accounts:</strong> Upon
                                    account deletion, all personal data and generated content is
                                    permanently removed within 30 days, except where retention is required
                                    for legal or compliance purposes.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Billing records:</strong> Transaction
                                    history may be retained for up to 7 years as required by applicable
                                    tax and financial regulations.
                                </span>
                            </li>
                        </ul>
                        <div className="rounded-xl bg-[#FAFAFA] border border-[#EBEBEB] p-5">
                            <p className="text-[14px] text-[#4D4D4D] leading-[1.7]">
                                You can request permanent deletion of your account and all associated
                                data at any time. Visit our{' '}
                                <Link
                                    href="/data-deletion"
                                    className="text-[#171717] underline underline-offset-4 hover:text-[#8F8F8F] transition-colors"
                                >
                                    Data Deletion
                                </Link>{' '}
                                page for detailed instructions.
                            </p>
                        </div>
                    </section>

                    {/* Section 07 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #07
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Your Rights
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            Depending on your jurisdiction (including under the GDPR, CCPA, and other
                            applicable data protection laws), you have the following rights regarding
                            your personal data:
                        </p>
                        <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75]">
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Right to Access</strong> — Request
                                    a copy of the personal data we hold about you.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Right to Correction</strong> — Request
                                    correction of inaccurate or incomplete personal data.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Right to Deletion</strong> — Request
                                    the permanent deletion of your personal data and account.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Right to Portability</strong> — Request
                                    your data in a structured, machine-readable format for transfer to
                                    another service.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Right to Restrict Processing</strong> —
                                    Request that we limit how we process your data in certain circumstances.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Right to Opt Out</strong> — California
                                    residents may opt out of the sale or sharing of personal information
                                    under the CCPA. We do not sell personal data.
                                </span>
                            </li>
                        </ul>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mt-6">
                            To exercise any of these rights, contact us through the support dashboard
                            or email us at the address listed below. We will respond within 30 days.
                        </p>
                    </section>

                    {/* Section 08 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #08
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Cookies
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            We use cookies and similar tracking technologies to maintain your session,
                            remember your preferences, and understand how you interact with our
                            platform. These include:
                        </p>
                        <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Essential cookies</strong> — Required
                                    for authentication, security, and core functionality.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Analytics cookies</strong> — Help
                                    us understand usage patterns and improve the platform experience.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Preference cookies</strong> — Store
                                    your language, theme, and display settings.
                                </span>
                            </li>
                        </ul>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75]">
                            For full details on the cookies we use and how to manage your preferences,
                            please see our{' '}
                            <Link
                                href="/cookie-policy"
                                className="text-[#171717] underline underline-offset-4 hover:text-[#8F8F8F] transition-colors"
                            >
                                Cookie Policy
                            </Link>
                            .
                        </p>
                    </section>

                    {/* Section 09 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #09
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Changes to This Policy
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75]">
                            We may update this Privacy Policy from time to time to reflect changes in
                            our practices, services, or legal requirements. When we make material
                            changes, we will notify you by posting the updated policy on this page
                            with a revised &quot;Last updated&quot; date, and where appropriate, by
                            sending you an email notification or displaying a prominent notice within
                            the platform. We encourage you to review this policy periodically. Your
                            continued use of our services after changes are posted constitutes your
                            acceptance of the updated policy.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section className="py-10 border-t border-[#EBEBEB]">
                        <div className="flex items-baseline gap-4 mb-6">
                            <span
                                className="text-[12px] font-medium text-[#8F8F8F] tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                            >
                                #10
                            </span>
                            <h2 className="text-[20px] font-bold text-[#171717]">
                                Contact Us
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            If you have any questions, concerns, or requests regarding this Privacy
                            Policy or how we handle your data, you can reach us through:
                        </p>
                        <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75]">
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Email:</strong>{' '}
                                    <a
                                        href="mailto:support@resumeforgeai.com"
                                        className="text-[#171717] underline underline-offset-4 hover:text-[#8F8F8F] transition-colors"
                                    >
                                        support@resumeforgeai.com
                                    </a>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>
                                    <strong className="text-[#171717]">Dashboard:</strong> Use the
                                    built-in support chat or contact form available in your account
                                    dashboard.
                                </span>
                            </li>
                        </ul>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mt-6">
                            We aim to respond to all privacy-related inquiries within 30 business days.
                        </p>
                    </section>

                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-[#EBEBEB]">
                    <p className="text-[13px] text-[#8F8F8F] leading-[1.6]">
                        © {new Date().getFullYear()} ResumeForge AI. All rights reserved. This
                        policy applies to all products and services operated under the GrowxlabsTech.
                    </p>
                </div>

            </div>
        </div>
    );
}
