export const dynamic = 'force-dynamic';
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowRight, FileText, Briefcase, Code, MessageSquare, Terminal, BookOpen, Search, Zap, GraduationCap, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: "AI Tech Career Tools | ResumeForgeAI",
  description: "Explore our comprehensive suite of AI-powered tools for developers. From resume builders to interview practice, we cover all your tech career needs.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, ai developer tools",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/ai-tools',
  },
};

const tools = [
  { name: "ResumeForge", icon: <FileText />, desc: "ATS-optimized AI resume builder.", link: "/en-in/resumeforge" },
  { name: "JobForge", icon: <Search />, desc: "AI-powered job discovery and matching.", link: "/en-in/jobforge" },
  { name: "CodingForge", icon: <Terminal />, desc: "Interactive AI coding practice platform.", link: "/en-in/codingforge" },
  { name: "InterviewForge", icon: <MessageSquare />, desc: "Realistic AI mock interviews and feedback.", link: "/en-in/interviewforge" },
  { name: "ProjectForge", icon: <Code />, desc: "AI-guided technical portfolio projects.", link: "/en-in/projectforge" },
  { name: "LearnForge", icon: <GraduationCap />, desc: "Structured AI learning paths and materials.", link: "/en-in/learnforge" },
  { name: "KnowledgeForge", icon: <BookOpen />, desc: "Expert technical guides and documentation.", link: "/en-in/knowledgeforge" },
  { name: "ExplainForge", icon: <Zap />, desc: "Simple AI explanations for any code snippet.", link: "/en-in/explainforge" },
  { name: "StudyForge", icon: <Users />, desc: "AI-powered technical study materials.", link: "/en-in/studyforge" },
  { name: "CareerForge", icon: <Briefcase />, desc: "Comprehensive AI career planning hub.", link: "/en-in/careerforge" },
  { name: "MentorForge", icon: <Users />, desc: "Dedicated 24/7 AI technical mentorship.", link: "/en-in/mentorforge" },
  { name: "CompanyPrep", icon: <Sparkles />, desc: "Targeted interview prep for top companies.", link: "/en-in/company-prep" },
];

export default function AIToolsSEO() {
  return (
    <article className="max-w-6xl mx-auto px-6 py-20">
      <header className="mb-20 text-center space-y-8">
        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight">
          The Hub for Modern <span className="text-indigo-500">Tech Careers</span>
        </h1>
        <p className="text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Explore a comprehensive suite of AI-powered tools designed to help every developer grow, learn, and land their dream role. We combine deep technical insights with intuitive design to give you a professional edge.
        </p>
        <div className="prose prose-invert prose-lg max-w-4xl mx-auto text-slate-300 leading-relaxed text-left">
          <p>
            The technology industry moves faster than almost any other professional field. To stay ahead, developers need more than just coding skills; they need a strategic approach to their career, continuous learning, and a way to stand out in a crowded market. ResumeForgeAI was built to provide that unfair advantage by leveraging the power of advanced AI across every stage of the professional journey.
          </p>
          <p>
            From your first resume build to preparing for a senior-level interview at a global tech giant, our platform provides professional guidance, realistic practice, and actionable feedback. Our tools are designed by experienced engineers and career specialists who understand the specific challenges of the modern tech landscape. We focus on results, simplifying the complex parts of career growth so you can focus on building amazing things.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool, i) => (
          <Link key={i} href={tool.link} className="group p-8 bg-slate-900/50 border border-white/5 rounded-[3rem] hover:border-indigo-500/50 transition-all active:scale-[0.98]">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              {React.cloneElement(tool.icon as React.ReactElement, { size: 28 })}
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              {tool.name} <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              {tool.desc}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-40 p-12 md:p-20 bg-indigo-600 rounded-[4rem] text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tight">Ready to build your career?</h2>
          <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl mx-auto">
            Join thousands of developers using our AI forges to land top-tier tech roles.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/en-in/(auth)/login" className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-slate-200 transition-all active:scale-95 shadow-2xl">
              Get Started Free
            </Link>
            <Link href="/en-in/jobs" className="px-12 py-6 bg-black/20 backdrop-blur-md text-white border border-white/20 font-black uppercase tracking-widest rounded-3xl hover:bg-white/10 transition-all active:scale-95">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
