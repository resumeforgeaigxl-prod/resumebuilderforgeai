'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, FileText, Sparkles, Zap, Shield, Target, Layout, Upload, CheckCircle2, Lock, TrendingUp, XCircle, BrainCircuit, Briefcase, MessageSquareWarning } from 'lucide-react';
import GeoSuggestionBanner from '@/components/geo/GeoSuggestionBanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070710] text-slate-200 selection:bg-purple-500/30 overflow-hidden relative font-sans">
      {/* Geo region suggestion banner — non-intrusive, auto-detects country */}
      <GeoSuggestionBanner />
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none opacity-40" />


      <main className="relative z-10 pt-32 pb-32">
        {/* 1. Hero Section */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto mt-10 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Powered by advanced AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-white"
          >
            Craft your perfect resume with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Artificial Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl"
          >
            Generate tailored resumes in seconds. Stand out from the crowd and land your dream job with our intelligent builder that highlights your true potential.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-gray-100 hover:scale-105 transition-all w-full sm:w-auto shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Build Resume Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              View Dashboard
            </Link>
          </motion.div>
        </section>

        {/* 2. Problem Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 mb-20 border-y border-white/5 bg-black/20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why do 80% of resumes get rejected?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Applicant Tracking Systems (ATS) ruthlessly filter out candidates before human eyes ever see them.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { title: "Poor Formatting", desc: "Complex columns or unreadable fonts crash the parser." },
              { title: "Missing Keywords", desc: "Failing to match the exact terms from the job description." },
              { title: "Weak Action Verbs", desc: "Using passive language like 'helped with' or 'responsible for'." },
              { title: "No Quantified Impact", desc: "Listing duties instead of measurable achievements." }
            ].map((reason, i) => (
              <div key={i} className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                <XCircle className="w-8 h-8 text-red-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-200 mb-2">{reason.title}</h3>
                <p className="text-sm text-slate-400">{reason.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-8 md:p-12 rounded-3xl text-center max-w-4xl mx-auto relative overflow-hidden">

            <Shield className="w-12 h-12 text-purple-400 mx-auto mb-6" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">ResumeForgeAI Fixes Everything</h3>
            <p className="text-slate-300 text-lg">Our system ensures strict ATS compliance, injects powerful action verbs, and automatically cross-references the exact keywords required by your target job description.</p>
          </div>
        </section>

        {/* 3. ATS Score Demo Section */}
        <section className="max-w-6xl mx-auto px-6 py-20 mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex text-blue-400 font-bold tracking-widest text-xs uppercase mb-4">ATS Compatibility</div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">See your ATS match score before you apply.</h2>
              <p className="text-slate-400 text-lg mb-8">Paste the job description you are targeting, and our AI will instantly highlight missing keywords, evaluate your impact metrics, and grade your resume.</p>
              <ul className="space-y-4">
                {['Live keyword matching', 'Action verb analysis', 'Readability optimization', 'Recruiter scan-time estimation'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-20" />
              <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">ATS Match Score</p>
                    <p className="text-sm text-slate-500">Based on target Job Description</p>
                  </div>
                  <div className="text-5xl font-bold text-emerald-400">91%</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Keywords</span><span className="text-slate-400">25/27</span></div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[92%]" /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Action Verbs</span><span className="text-slate-400">85/100</span></div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[85%]" /></div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-xs text-red-400 font-bold mb-2">Missing Keywords Detected:</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded">Kubernetes</span>
                    <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded">CI/CD Pipeline</span>
                  </div>
                </div>
              </div>

              {/* Float badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="absolute -bottom-6 -right-6 bg-white text-black p-4 rounded-xl shadow-xl border border-gray-200 flex gap-3 items-center"
              >
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-gray-500">Improvement</p>
                  <p className="text-xl font-bold">42% → 91%</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. How It Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">Four steps to being hired</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Upload className="w-6 h-6" />, title: "Upload or Build", desc: "Upload your existing PDF to parse it instantly, or start from scratch.", num: "01" },
              { icon: <Target className="w-6 h-6" />, title: "Target the Job", desc: "Paste the Job Description to let AI understand what the recruiter wants.", num: "02" },
              { icon: <BrainCircuit className="w-6 h-6" />, title: "AI Optimization", desc: "Rewrite bullets, inject keywords, and instantly boost your ATS score.", num: "03" },
              { icon: <FileText className="w-6 h-6" />, title: "Export & Apply", desc: "Download as an ATS-friendly PDF and generate a web portfolio.", num: "04" },
            ].map((step, i) => (
              <div key={i} className="relative p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center group hover:bg-white/[0.04] transition-all">
                <div className="absolute -top-4 -left-4 text-6xl font-black text-white/[0.03] group-hover:text-purple-500/10 transition-colors pointer-events-none">{step.num}</div>
                <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">{step.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Feature Grid (8 Features) */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to succeed</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">A full suite of career tools engineered to give you the ultimate edge.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<WandIcon />} title="AI Builder" desc="FAANG-mode bullet enhancer that rewrites history for maximum impact." />
            <FeatureCard icon={<ScanIcon />} title="ATS Analyzer" desc="Real-time grading for action verbs, missing metrics, and readability." />
            <FeatureCard icon={<Target className="w-6 h-6 text-emerald-400" />} title="JD Matching" desc="Cross-reference missing keywords against any job description." />
            <FeatureCard icon={<Layout className="w-6 h-6 text-pink-400" />} title="Portfolio Generator" desc="Turn your resume into a stunning dark-mode web portfolio instantly." />
            <FeatureCard icon={<TestIcon />} title="AI Mock Tests" desc="Generate technical interview questions specific to your exact resume." />
            <FeatureCard icon={<MessageSquareWarning className="w-6 h-6 text-orange-400" />} title="JobForgeAI Chat" desc="A strict AI career coach for optimization and interview prep." />
            <FeatureCard icon={<Briefcase className="w-6 h-6 text-cyan-400" />} title="Live Job Board" desc="Curated MNC and entry-level jobs with direct ATS match scores." />
            <FeatureCard icon={<Shield className="w-6 h-6 text-yellow-400" />} title="Secure Auth" desc="OAuth logins via Google, GitHub, or Discord. Secure cloud storage." />
          </div>
        </section>

        {/* 6. Mock Test Preview */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="space-y-4">
                  {[
                    "Explain your role in implementing the CI/CD pipeline.",
                    "How did you optimize the React application by 40%?",
                    "Describe a time a deployment failed in production.",
                    "How do you handle state in large-scale applications?",
                    "Walk me through your database schema design."
                  ].map((q, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${idx < 2 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-900/50 border-slate-800/50 opacity-50 blur-[1px] select-none flex justify-between items-center'}`}>
                      <p className="text-sm text-slate-300 font-medium">Q: {q}</p>
                      {idx >= 2 && <Lock className="w-4 h-4 text-slate-500 shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent flex items-end justify-center pb-6">
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">Pro Feature</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex text-purple-400 font-bold tracking-widest text-xs uppercase mb-4">Interview Prep</div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Prepare with AI-generated Technical Interviews.</h2>
              <p className="text-slate-400 text-lg mb-8">Stop memorizing LeetCode. Our AI reads your resume and the target job description to generate custom, highly specific interview questions that recruiters will actually ask you.</p>
              <Link href="/signup" className="text-white font-medium hover:text-purple-400 flex items-center gap-2 transition-colors">Start Mock Test <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </section>

        {/* 7. Portfolio Preview */}
        <section className="max-w-7xl mx-auto px-6 py-20 bg-black/30 border-y border-white/5 my-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Your Personal Web Portfolio</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">One click turns your resume into a stunning, responsive website. Share it securely with recruiters.</p>
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-mono text-sm text-blue-400 shadow-inner">
              <GlobeIcon /> https://resumeforgeai.in/p/<span className="text-white">your-name</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto relative rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-[16/9]">
            {/* Abstract mockup of portfolio UI */}
            <div className="absolute inset-0 bg-[#0d1117]">
              <div className="h-10 border-b border-white/5 bg-[#161b22] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-xs font-mono text-slate-500">resumeforgeai.in / portfolio</span>
              </div>
              <div className="p-8 md:p-12">
                <h1 className="text-3xl font-bold text-white mb-2">Alex Developer</h1>
                <p className="text-emerald-400 font-mono text-sm mb-6">{'// '}Senior Full Stack Engineer</p>
                <div className="grid grid-cols-2 gap-4 max-w-lg mb-8">
                  <div className="h-2 bg-white/10 rounded w-full" />
                  <div className="h-2 bg-white/10 rounded w-3/4" />
                  <div className="h-2 bg-white/10 rounded w-5/6" />
                  <div className="h-2 bg-white/10 rounded w-1/2" />
                </div>
                <div className="flex gap-4">
                  <div className="w-24 h-8 bg-blue-500/20 rounded-md border border-blue-500/30" />
                  <div className="w-24 h-8 bg-white/5 rounded-md border border-white/10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Trust & Security */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 border-y border-white/5 py-12">
            {[
              { title: "Bank-Grade Encryption", desc: "Your parsing data is encrypted at rest via Supabase.", icon: <Shield className="w-5 h-5" /> },
              { title: "OAuth Secure Login", desc: "We never store your passwords locally.", icon: <Lock className="w-5 h-5" /> },
              { title: "100% Privacy", desc: "Toggle your portfolio visibility instantly.", icon: <CheckCircle2 className="w-5 h-5" /> },
              { title: "No Spam", desc: "We don't sell your data to recruiters.", icon: <Target className="w-5 h-5" /> }
            ].map((t, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 mx-auto sm:mx-0 mb-4">{t.icon}</div>
                <h4 className="font-bold text-white mb-2 text-sm">{t.title}</h4>
                <p className="text-xs text-slate-400">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Pricing */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Invest in your career today. Cancel anytime.</p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            {/* FREE */}
            <div className="p-7 rounded-3xl bg-white/5 border border-white/10 flex flex-col">
              <h3 className="font-bold text-xl text-white mb-1">Free</h3>
              <p className="text-slate-400 text-sm mb-5">Try it out, no card needed</p>
              <div className="mb-6"><span className="text-4xl font-bold text-white">₹0</span></div>
              <ul className="space-y-3 mb-8 text-sm text-slate-300 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 1 resume generation</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> No watermark</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Basic ATS score check</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 20 job listings</li>
                <li className="flex items-center gap-3 text-slate-500"><XCircle className="w-4 h-4 shrink-0" /> No mock tests</li>
                <li className="flex items-center gap-3 text-slate-500"><XCircle className="w-4 h-4 shrink-0" /> No cover letters</li>
              </ul>
              <Link href="/signup" className="block w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-center rounded-xl font-bold transition-colors border border-white/10">Start Free</Link>
            </div>

            {/* PRO — highlighted */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-blue-900/40 to-[#070710] border border-blue-500/50 relative shadow-[0_0_30px_rgba(59,130,246,0.2)] flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full whitespace-nowrap">Most Popular</div>
              <h3 className="font-bold text-xl text-white mb-1">Pro</h3>
              <p className="text-slate-400 text-sm mb-5">Full access for 24 hours</p>
              <div className="mb-1 flex items-baseline gap-1"><span className="text-4xl font-bold text-white">₹29</span><span className="text-slate-400 text-sm">/one-time</span></div>
              <p className="text-xs text-blue-400 font-bold mb-5">⏱ Expires 24 hours after purchase</p>
              <ul className="space-y-3 mb-8 text-sm text-slate-300 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Unlimited resumes (24h)</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Unlimited cover letters (24h)</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Unlimited mock tests (24h)</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Full ATS score analysis</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Full job access</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Watermark-free PDF</li>
              </ul>
              <Link href="/billing?plan=PRO" className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-center rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/25">Unlock 24h Access</Link>
            </div>

            {/* PREMIUM */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-purple-900/30 to-[#070710] border border-purple-500/40 flex flex-col">
              <h3 className="font-bold text-xl text-white mb-1">Premium</h3>
              <p className="text-slate-400 text-sm mb-5">Daily limits, reset every 24h</p>
              <div className="mb-1 flex items-baseline gap-1"><span className="text-4xl font-bold text-white">₹199</span><span className="text-slate-400 text-sm">/month</span></div>
              <p className="text-xs text-purple-400 font-bold mb-5">30-day subscription</p>
              <ul className="space-y-3 mb-8 text-sm text-slate-300 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 10 resumes / day</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 10 mock tests / day</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 10 cover letters / day</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Advanced ATS insights</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Full job access</li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Job recommendations <span className="inline-flex items-center gap-1 ml-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full"><Briefcase className="w-3 h-3" /> JobForgeAI</span></span>
                </li>
              </ul>
              <Link href="/billing?plan=PREMIUM" className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white text-center rounded-xl font-bold transition-colors shadow-lg shadow-purple-500/25">Upgrade Monthly</Link>
            </div>

            {/* CAREER */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-amber-900/30 to-[#070710] border border-amber-500/40 flex flex-col">
              <h3 className="font-bold text-xl text-white mb-1">Career</h3>
              <p className="text-slate-400 text-sm mb-5">Serious job seekers only</p>
              <div className="mb-1 flex items-baseline gap-1"><span className="text-4xl font-bold text-white">₹499</span><span className="text-slate-400 text-sm">/month</span></div>
              <p className="text-xs text-amber-400 font-bold mb-5">30-day subscription</p>
              <ul className="space-y-3 mb-8 text-sm text-slate-300 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Unlimited resumes</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Unlimited mock tests</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Unlimited cover letters</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Advanced ATS optimization</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Priority AI processing</li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>AI job assistant <span className="inline-flex items-center gap-1 ml-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full"><Briefcase className="w-3 h-3" /> JobForgeAI</span></span>
                </li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> MNC &amp; fresher job alerts</li>
              </ul>
              <Link href="/billing?plan=CAREER" className="block w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-center rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/25">Unlock Unlimited</Link>
            </div>
          </div>

          {/* JobForgeAI explanation strip */}
          <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Powered by JobForgeAI</p>
              <p className="text-slate-400 text-xs mt-0.5">Finds jobs from multiple sources · ATS match score per job · MNC &amp; fresher opportunities · Resume-based job suggestions</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full shrink-0">Premium &amp; Career</span>
          </div>
        </section>

        {/* 10. Testimonials */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Developers love us. ATS bots don&apos;t.</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { name: "Sarah J.", role: "Frontend Dev", company: "Hired at Startup", body: "I spent hours writing my resume. RFAI parsed it, fixed my weak verbs automatically, and generated a clean PDF. Landed interviews within a week." },
              { name: "Michael R.", role: "Data Scientist", company: "Hired at FAANG", body: "The JD matcher is insane. I just pasted the job descriptions, and it highlighted exactly what I was missing. The mock test also asked me SQL questions that actually came up." },
              { name: "Priya M.", role: "Software Engineer", company: "Recent Grad", body: "The web portfolio feature is chef's kiss. Sent the custom URL instead of a boring PDF attached to emails. Looks incredibly professional." }
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex text-yellow-500 mb-4 text-sm">★★★★★</div>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">&quot;{t.body}&quot;</p>
                <div>
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} · {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 11. Final CTA */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-10 text-center">
          <div className="p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 blur-[80px] rounded-full pointer-events-none" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to stop getting rejected?</h2>
            <p className="text-lg text-blue-200 mb-10 relative z-10 max-w-xl mx-auto">Build your AI-powered resume today. Generate clean PDFs and stunning portfolios in minutes.</p>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-white text-black font-bold hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] relative z-10">
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center bg-[#05050a] relative z-10">
        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} ResumeForge AI. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500 font-medium">
          <Link href="/privacy" className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</Link>
          <Link href="/dashboard/support" className="hover:text-slate-300 transition-colors cursor-pointer underline decoration-purple-500/30">Support</Link>
        </div>
      </footer>
    </div>
  );
}

// Micro components
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function WandIcon() { return <Sparkles className="w-6 h-6 text-purple-400" />; }
function ScanIcon() { return <Zap className="w-6 h-6 text-blue-400" />; }
function TestIcon() { return <BrainCircuit className="w-6 h-6 text-orange-400" />; }
function GlobeIcon() { return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
