import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — ResumeForge' };

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 py-16 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 text-sm mb-8 inline-block">← Back to Sign Up</Link>

                <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-slate-500 text-sm mb-10">Last updated: February 2026</p>

                <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
                        <p>When you use ResumeForge, we collect:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 text-slate-400">
                            <li><strong className="text-slate-300">Account data:</strong> Email address, phone number (optional), password hash.</li>
                            <li><strong className="text-slate-300">Resume data:</strong> Content you enter or upload to build your resume.</li>
                            <li><strong className="text-slate-300">Usage data:</strong> Pages visited, features used, timestamps.</li>
                            <li><strong className="text-slate-300">Technical data:</strong> IP address (recorded at T&amp;C acceptance), browser type, device info.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
                        <p>We use your data to:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 text-slate-400">
                            <li>Provide and improve the ResumeForge service.</li>
                            <li>Generate AI-powered resume content on your behalf.</li>
                            <li>Send transactional emails (account verification, password reset).</li>
                            <li>Ensure platform security and prevent abuse.</li>
                            <li>Comply with legal obligations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Data Storage</h2>
                        <p>Your data is stored securely using Supabase infrastructure with encryption at rest and in transit. We do not sell your personal data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. AI Processing</h2>
                        <p>Resume content you enter may be sent to AI providers (e.g. OpenRouter/GPT models) to generate optimised content. These providers process data in accordance with their own privacy policies. We do not share personally identifiable information beyond what is necessary for resume generation.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
                        <p>We use session cookies for authentication only. We do not use tracking or advertising cookies. You can disable cookies in your browser, but this may affect functionality.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2 text-slate-400">
                            <li>Access the personal data we hold about you.</li>
                            <li>Request correction of inaccurate data.</li>
                            <li>Request deletion of your account and associated data.</li>
                            <li>Object to processing of your data in certain circumstances.</li>
                        </ul>
                        <p className="mt-3">To exercise these rights, contact us at <span className="text-purple-400">support@resumeforge.ai</span>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">7. Data Retention</h2>
                        <p>We retain your data for as long as your account is active. If you delete your account, your data is permanently removed within 30 days, except where retention is required by law.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">8. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
                        <p>For privacy-related questions: <span className="text-purple-400">support@resumeforge.ai</span></p>
                    </section>
                </div>
            </div>
        </div>
    );
}
