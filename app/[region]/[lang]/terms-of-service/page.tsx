import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | ResumeForgeAI',
    description: 'Terms of Service for using ResumeForgeAI across global regions.',
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 py-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
                <p className="text-sm text-slate-400 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

                <p className="text-slate-300 leading-relaxed mb-8">
                    Welcome to ResumeForgeAI. By accessing or using our website, you agree to be bound by these Terms of Service. Please read them carefully.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p className="text-slate-300">
                        By registering for, accessing, or using the Service, you signify your assent to these Terms of Service. If you do not agree, do not use the Service. We reserve the right to amend these Terms at any time. Your continued use of the Service following any amendments will represent your agreement to the new Terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                    <p className="text-slate-300">
                        ResumeForgeAI provides artificial intelligence tools to format, customize, and analyze professional resumes, alongside related features like job boards, portfolios, and mock interviews. We strive to provide excellent service globally, adjusting limits and pricing depending on your region.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities & Conduct</h2>
                    <p className="text-slate-300 mb-4">As a user, you agree not to use the Service in any way that:</p>
                    <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
                        <li>Falsifies or deliberately misrepresents professional history.</li>
                        <li>Violates the law of any applicable jurisdiction (including India, the US, and the EU).</li>
                        <li>Attempts to bypass or circumvent our security or payment mechanisms.</li>
                        <li>Interferes with the normal functioning of our site through scraping, spam, or denial of service attacks.</li>
                    </ul>
                </section>

                <section className="mb-8 mt-10">
                    <h2 className="text-2xl font-bold text-white mb-4">4. Subscriptions, Payments, and Refunds</h2>
                    <p className="text-slate-300">
                        Certain portions of the Service are offered via paid subscriptions. By purchasing a subscription (processed securely by Razorpay or Stripe), you agree to pay the fees and authorize us to charge your payment method. You may cancel at any time. Due to the digital and instantaneous nature of the AI service, refunds are generally not provided and fall strictly under our discretionary evaluation.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
                    <p className="text-slate-300">
                        The structural template formats provided by ResumeForgeAI remain the intellectual property of our platform. However, the exact text and specific personal data within your resume remain entirely yours. You grant us a non-exclusive license to use, display, and process your data solely for the purpose of operating the Service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
                    <p className="text-slate-300">
                        ResumeForgeAI does not guarantee employment. We provide an advanced toolkit for users to optimize their applicant profiles. We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">7. Governing Law</h2>
                    <p className="text-slate-300">
                        These Terms shall be governed by and construed in accordance with the laws of the respective operational jurisdictions of ResumeForgeAI, irrespective of its conflict of law principles.
                    </p>
                </section>
            </div>
        </div>
    );
}
