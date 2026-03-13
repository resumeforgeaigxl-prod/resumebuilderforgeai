"use client";

import { Card } from "@/components/ui/Card";

export default function FAQSection() {
  const faqs = [
    { 
        q: "How does the AI optimize for ATS?", 
        a: "We analyze thousands of successful resumes against top-tier ATS parsers. Our engine injects the exact semantic markers and structural tags needed to maximize visibility." 
    },
    { 
        q: "Can I manage my entire job hunt here?", 
        a: "Yes. From building the resume to practicing for coding rounds and behavioral interviews, every step is integrated into the Forge ecosystem." 
    },
    { 
        q: "Is my data secure?", 
        a: "We use enterprise-grade encryption. Your career data is strictly yours—we never sell data or use your documents to train public models." 
    }
  ];

  return (
    <section className="py-32 px-6 border-t border-white/5 relative">
       <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent pointer-events-none" />
       
       <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tighter italic">Foundational Intel.</h2>
          <div className="space-y-4">
             {faqs.map((faq, i) => (
                <Card key={i} glass className="p-8 border-white/5 hover:bg-white/[0.04] transition-all cursor-default">
                   <h4 className="font-bold text-white mb-3 text-lg">{faq.q}</h4>
                   <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                </Card>
             ))}
          </div>
       </div>
    </section>
  );
}
