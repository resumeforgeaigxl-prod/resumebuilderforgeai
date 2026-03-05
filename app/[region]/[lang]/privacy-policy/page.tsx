import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | ResumeForgeAI',
    description: 'Privacy Policy for ResumeForgeAI detailing data collection, usage, third-party services, and security practices.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 py-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
                <p className="text-sm text-slate-400 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">1. Data We Collect</h2>
                    <p className="text-slate-300">We collect the following types of information when you use ResumeForgeAI:</p>
                    <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
                        <li><strong>Account Data:</strong> Email address, name, and basic profile information provided during signup.</li>
                        <li><strong>Resume Content:</strong> Any data you input into our resume builder, including work experience, education, skills, and personal details.</li>
                        <li><strong>Usage Data:</strong> Information about how you interact with our website to help us improve the experience.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">2. How Data is Used</h2>
                    <p className="text-slate-300">Your data is strictly used for the following purposes:</p>
                    <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
                        <li>To generate, format, and optimize your resumes and cover letters using AI.</li>
                        <li>To provide job matching and personalized interview coaching.</li>
                        <li>To communicate with you regarding your account, updates, and billing.</li>
                        <li>To maintain and improve the security and performance of our services.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">3. Third-Party Services</h2>
                    <p className="text-slate-300">We do not sell your data. We share necessary data only with trusted third-party providers to operate our services:</p>
                    <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
                        <li><strong>Brevo:</strong> Used for transactional and marketing email delivery.</li>
                        <li><strong>Razorpay & Stripe:</strong> Used securely for processing payments and managing subscriptions. We do not store your full card details.</li>
                        <li><strong>Job APIs:</strong> Used to fetch direct job listings and provide ATS match scores.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">4. Security Practices</h2>
                    <p className="text-slate-300">
                        We prioritize the security of your data. We use industry-standard encryption protocols (like HTTPS and secure database storage) to protect your resume content and personal information at rest and in transit. Auth tokens are managed securely, and we employ best practices to prevent unauthorized access.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">5. Data Deletion & Your Rights</h2>
                    <p className="text-slate-300">
                        You have the right to access, update, and request the deletion of your personal data at any time. For full instructions on how to permanently delete your account and all associated data, please visit our <a href="data-deletion" className="text-purple-400 hover:text-purple-300">Data Deletion</a> page.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">6. Contact Us</h2>
                    <p className="text-slate-300">
                        If you have any questions or concerns regarding this Privacy Policy, please contact our support team through the dashboard or by emailing us directly.
                    </p>
                </section>
            </div>
        </div>
    );
}
