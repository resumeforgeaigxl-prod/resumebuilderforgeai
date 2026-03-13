import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy | ResumeForgeAI',
    description: 'Learn how ResumeForgeAI uses essential, performance, and analytics cookies.',
};

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 py-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold text-white mb-8">Cookie Policy</h1>
                <p className="text-sm text-slate-400 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

                <p className="text-slate-300 leading-relaxed mb-8">
                    This Cookie Policy explains how ResumeForgeAI uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are, why we use them, and your rights to control our use of them.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">1. What are cookies?</h2>
                    <p className="text-slate-300">
                        Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used to make websites work more efficiently and to provide reporting information.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">2. Types of Cookies We Use</h2>
                    <p className="text-slate-300 mb-4">We use the following types of cookies for different core functionalities:</p>

                    <div className="space-y-6">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-xl font-bold text-purple-400 mb-2">Essential Cookies</h3>
                            <p className="text-slate-300 text-sm">
                                These cookies are strictly necessary to provide you with services available through our website. For example, they allow you to securely log in to your account, manage your session (stored securely in authenticated cookies like `resume_forge_auth`), and process payments without interruption. We do not require consent for essential cookies as the site cannot function securely without them.
                            </p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-xl font-bold text-blue-400 mb-2">Performance Cookies</h3>
                            <p className="text-slate-300 text-sm">
                                These cookies enhance the performance and functionality of our website but are non-essential to its use. Without these cookies, certain functionality may become unavailable.
                            </p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-xl font-bold text-emerald-400 mb-2">Analytics Cookies</h3>
                            <p className="text-slate-300 text-sm">
                                These cookies collect information that is used either in aggregate form to help us understand how our website is being used, how effective our marketing campaigns are, or to help us customize our website for you. We use tools like PostHog to analyze traffic securely.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-8 mt-10">
                    <h2 className="text-2xl font-bold text-white mb-4">3. Global & Regional Compliance</h2>
                    <p className="text-slate-300">
                        In adherence to regulations such as the General Data Protection Regulation (GDPR) in the EU and equivalent frameworks across the US and India, we explicitly provide you the right to consent to non-essential cookies. You can manage your preferences using the cookie consent banner presented on your first visit to the site.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">4. Updating Your Preferences</h2>
                    <p className="text-slate-300">
                        You can update your cookie preferences at any time by clearing your browser&apos;s local storage and refreshing the page, which will prompt the Cookie Consent banner again, allowing you to choose whether to <em>Accept All</em> or <em>Reject Non-Essential</em> cookies.
                    </p>
                </section>
            </div>
        </div>
    );
}
