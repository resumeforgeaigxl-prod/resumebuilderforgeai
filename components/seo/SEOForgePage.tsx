import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface SEOForgePageProps {
  title: string;
  description: string;
  h1: string;
  content: React.ReactNode;
  features: string[];
  ctaText: string;
  ctaLink: string;
  schemaName: string;
  schemaDescription: string;
}

export const SEOForgePage: React.FC<SEOForgePageProps> = ({
  title,
  description,
  h1,
  content,
  features,
  ctaText,
  ctaLink,
  schemaName,
  schemaDescription,
}) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": schemaName,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "description": schemaDescription
  };

  return (
    <article aria-label={title} className="max-w-4xl mx-auto px-6 py-20 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <header className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
          {h1}
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
          {description}
        </p>
      </header>

      <section className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed space-y-6">
        {content}
      </section>

      <section className="space-y-8 bg-slate-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12">
        <h2 className="text-2xl font-bold text-white">What you get with {schemaName}</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-indigo-500 shrink-0" />
              <span className="text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-8 flex flex-col sm:flex-row items-center gap-6">
        <Link 
          href={ctaLink}
          className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center"
        >
          {ctaText} <ArrowRight className="w-5 h-5" />
        </Link>
        <Link 
          href="/en-in/ai-tools"
          className="text-slate-400 hover:text-white font-bold transition-colors"
        >
          Explore all AI Tools
        </Link>
      </section>

      <footer className="pt-20 border-t border-white/5">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Related Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/en-in/resumeforge" className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-colors text-slate-300 font-bold text-center">ResumeForge</Link>
          <Link href="/en-in/jobforge" className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-colors text-slate-300 font-bold text-center">JobForge</Link>
          <Link href="/en-in/codingforge" className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-colors text-slate-300 font-bold text-center">CodingForge</Link>
          <Link href="/en-in/interviewforge" className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-colors text-slate-300 font-bold text-center">InterviewForge</Link>
        </div>
      </footer>
    </article>
  );
};
