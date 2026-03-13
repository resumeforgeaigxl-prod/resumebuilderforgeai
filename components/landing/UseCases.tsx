"use client";

import { Card } from "@/components/ui/Card";

export default function UseCases() {
  const cases = [
    { 
      title: "Career Switchers", 
      desc: "Automatically map transferable skills from your previous domain to high-paying tech roles.",
      accent: "border-l-indigo-500"
    },
    { 
      title: "Senior Architects", 
      desc: "Quantify complex architectural impact into executive-level metrics that bypass ATS filters.",
      accent: "border-l-purple-500"
    },
    { 
      title: "Recent Graduates", 
      desc: "Transform academic projects into professional-grade industry signals that prove day-one readiness.",
      accent: "border-l-pink-500"
    }
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((useCase, i) => (
            <Card key={i} className={`p-8 bg-white/[0.01] border-white/5 border-l-4 ${useCase.accent} hover:bg-white/[0.03] transition-all`}>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{useCase.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{useCase.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
