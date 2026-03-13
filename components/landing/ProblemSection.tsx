"use client";

import { Target, Zap, TrendingUp, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function ProblemSection() {
  const painPoints = [
    {
      icon: <XCircle className="w-6 h-6 text-rose-500" />,
      title: "Parser Failures",
      desc: "Legacy ATS systems can't read complex PDF layouts, rejecting talent instantly."
    },
    {
      icon: <Target className="w-6 h-6 text-amber-500" />,
      title: "Keyword Gaps",
      desc: "Missing the hyper-specific semantic signals recruiters use to filter thousands of resumes."
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-500" />,
      title: "Generic Content",
      desc: "Vague descriptions fail to communicate your unique architectural impact and leadership."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
      title: "Zero Feedback",
      desc: "Applying blind without knowing how your profile actually scores against the job description."
    }
  ];

  return (
    <section className="py-32 px-6 relative border-y border-white/5 bg-[#05050a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
            The Modern <span className="text-rose-500">Hiring Crisis.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Applicant Tracking Systems filter out 75% of candidates before a human ever sees them.
            The problem isn&apos;t your skill; it&apos;s your visibility.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {painPoints.map((item, i) => (
            <Card key={i} glass className="p-8 border-white/[0.03] hover:border-white/10 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
