export const dynamic = 'force-dynamic';
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Data Deletion & Your Rights | ResumeForgeAI',
    description: 'Instructions on how to securely permanently delete your account and personal data from ResumeForgeAI.',
};

export default function DataDeletionPage() {
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
                        Data Deletion &amp; Your Rights
                    </h1>
                    <p className="text-[14px] text-[#8F8F8F]">
                        Last updated — June 20, 2026
                    </p>
                </div>

                {/* Intro */}
                <div className="mb-12">
                    <p className="text-[16px] text-[#4D4D4D] leading-[1.75]">
                        In compliance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and similar global regulations, you have the fundamental right to be forgotten. This means you can request the permanent and irreversible deletion of all your personal data stored on ResumeForge AI.
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
                                Warning: Irreversible Action
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            When you request data deletion, the following data is permanently purged from our servers within 30 days of the request:
                        </p>
                        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6 mb-6">
                            <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75]">
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">Auth Data</strong> — Your account, login details, email, and password hashes connected to our Supabase database.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">Generated Documents</strong> — Every resume, cover letter, and associated drafts you created.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">Activity History</strong> — Job applications tracked, mock test history, and job search interactions.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                    <span>
                                        <strong className="text-[#171717]">Portfolio</strong> — Your public or private web-portfolio page.
                                    </span>
                                </li>
                            </ul>
                        </div>
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
                                How to Request Deletion
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-6">
                            There are two ways to request deletion of your account and personal data from our platform:
                        </p>

                        <h3 className="text-[16px] font-semibold text-[#171717] mb-2 mt-6">Method 1: Immediate Self-Serve (Recommended)</h3>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-4">
                            If you have access to your account, you can initiate immediate data deletion straight from your dashboard settings:
                        </p>
                        <ol className="list-decimal pl-6 text-[16px] text-[#4D4D4D] leading-[1.75] space-y-3 mb-6">
                            <li>Log in to your ResumeForge AI account.</li>
                            <li>Navigate to the <Link href="/account" className="text-[#171717] underline underline-offset-4 hover:text-[#8F8F8F] transition-colors">Account Settings</Link> page.</li>
                            <li>Scroll down to the &quot;Danger Zone&quot; block.</li>
                            <li>Click &quot;Delete Account &amp; Data&quot; and re-authenticate to confirm.</li>
                        </ol>
                        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-5 mb-8">
                            <p className="text-[14px] text-[#4D4D4D] leading-[1.7]">
                                *Note: Self-serve deletion immediately cascades the deletion of connected data across our databases. Your active subscriptions via Stripe or Razorpay will also be formally canceled, though existing time left will not be refunded.
                            </p>
                        </div>

                        <h3 className="text-[16px] font-semibold text-[#171717] mb-2 mt-6">Method 2: Email Request</h3>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75] mb-4">
                            If you cannot access your account, you may submit a formal Data Deletion request by emailing our Data Protection Officer:
                        </p>
                        <ul className="space-y-3 text-[16px] text-[#4D4D4D] leading-[1.75]">
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>Send an email to <a href="mailto:privacy@resumeforgeai.com" className="text-[#171717] underline underline-offset-4 hover:text-[#8F8F8F] transition-colors">privacy@resumeforgeai.com</a>.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>Subject line: &quot;Request for Data Deletion - [Your Name]&quot;.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#D4D4D4] flex-shrink-0" />
                                <span>Include the exact email address associated with your account.</span>
                            </li>
                        </ul>
                        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-5 mt-6">
                            <p className="text-[14px] text-[#4D4D4D] leading-[1.7]">
                                We may require additional identity verification before processing the request to protect users against malicious attacks.
                            </p>
                        </div>
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
                                Exceptions to Deletion
                            </h2>
                        </div>
                        <p className="text-[16px] text-[#4D4D4D] leading-[1.75]">
                            Please note that certain financial and transactional logs (e.g., invoices from Razorpay or Stripe) must be retained by law for taxation and fraud prevention purposes for a minimum period mandated by Indian, US, or European financial regulations.
                        </p>
                    </section>

                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-[#EBEBEB]">
                    <p className="text-[13px] text-[#8F8F8F] leading-[1.6]">
                        © {new Date().getFullYear()} ResumeForge AI. All rights reserved. This policy applies to all products and services operated under the GrowxlabsTech.
                    </p>
                </div>

            </div>
        </div>
    );
}
