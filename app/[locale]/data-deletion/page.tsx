export const dynamic = 'force-dynamic';
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Data Deletion & Your Rights | ResumeForgeAI',
    description: 'Instructions on how to securely permanently delete your account and personal data from ResumeForgeAI.',
};

export default function DataDeletionPage() {
    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 py-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold text-white mb-8">Data Deletion & Your Rights</h1>
                <p className="text-sm text-slate-400 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

                <p className="text-slate-300 leading-relaxed mb-8">
                    In compliance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and similar global regulations, you have the fundamental right to be forgotten. This means you can request the permanent and irreversible deletion of all your personal data stored on ResumeForgeAI.
                </p>

                <section className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Warning: Irreversible Action</h2>
                    <p className="text-slate-300">
                        When you request data deletion, the following data is permanently purged from our servers within 30 days of the request:
                    </p>
                    <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
                        <li><strong>Auth Data:</strong> Your account, login details, email, and password hashes connected to our Supabase database.</li>
                        <li><strong>Generated Documents:</strong> Every resume, cover letter, and associated drafts you created.</li>
                        <li><strong>Activity History:</strong> Job applications tracked, mock test history, and job search interactions.</li>
                        <li><strong>Portfolio:</strong> Your public or private web-portfolio page.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">How to Request Deletion</h2>

                    <h3 className="text-xl font-bold text-purple-400 mt-6 mb-2">Method 1: Immediate Self-Serve (Recommended)</h3>
                    <p className="text-slate-300 mb-4">
                        If you have access to your account, you can initiate immediate data deletion straight from your dashboard settings.
                    </p>
                    <ol className="list-decimal pl-6 text-slate-300 space-y-2">
                        <li>Log in to your ResumeForgeAI account.</li>
                        <li>Navigate to the <Link href="/account" className="text-purple-400 hover:text-purple-300">Account Settings</Link> page.</li>
                        <li>Scroll to the &quot;Danger Zone&quot; block.</li>
                        <li>Click &quot;Delete Account & Data&quot; and re-authenticate to confirm.</li>
                    </ol>
                    <p className="text-sm text-slate-400 mt-2">
                        *Note: Self-serve deletion immediately cascades the deletion of connected data across our databases. Your active subscriptions via Stripe or Razorpay will also be formally canceled, though existing time left will not be refunded.
                    </p>

                    <h3 className="text-xl font-bold text-blue-400 mt-8 mb-2">Method 2: Email Request</h3>
                    <p className="text-slate-300 mb-4">
                        If you cannot access your account, you may submit a formal Data Deletion request by emailing our Data Protection Officer.
                    </p>
                    <ul className="list-disc pl-6 text-slate-300 space-y-2">
                        <li>Send an email to <strong>privacy@resumeforgeai.in</strong>.</li>
                        <li>Subject line: &quot;Request for Data Deletion - [Your Name]&quot;.</li>
                        <li>Include the exact email address associated with your account.</li>
                        <li>We may require additional identity verification before processing the request to protect users against malicious attacks.</li>
                    </ul>
                </section>

                <section className="mb-8 mt-10">
                    <h2 className="text-2xl font-bold text-white mb-4">Exceptions to Deletion</h2>
                    <p className="text-slate-300">
                        Please note that certain financial and transactional logs (e.g., invoices from Razorpay or Stripe) must be retained by law for taxation and fraud prevention purposes for a minimum period mandated by Indian, US, or European financial regulations.
                    </p>
                </section>

                <div className="mt-12 text-center">
                    <p className="text-slate-500 text-sm">Return to <Link href="/" className="text-purple-400 hover:text-purple-300 underline">Home</Link></p>
                </div>
            </div>
        </div>
    );
}
