"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How does ResumeForgeAI optimize resumes?",
    a: "Our AI analyzes your content against modern ATS parsing patterns, ensuring structural compatibility and semantic keyword optimization without sacrificial formatting style."
  },
  {
    q: "Can I practice coding inside the platform?",
    a: "Absolutely. CodingForge provides a dedicated environment with challenges ranging from foundational algorithms to advanced system architecture problems."
  },
  {
    q: "Does the platform provide job listings?",
    a: "Yes, JobForge aggregates opportunities from multiple global sources, matching them specifically to your forged resume and career profile."
  },
  {
    q: "How are career roadmaps generated?",
    a: "CareerForge uses AI to analyze the gap between your current skills and target role requirements, creating a structured, chronological path of learning and projects."
  },
  {
    q: "Is my data secure?",
    a: "Data security is our foundation. We use end-to-end encryption for storage and never share your personal resume data with third parties or public AI training sets."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={false}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.02] overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-lg font-bold text-white">{faq.q}</span>
                <Plus className={`w-5 h-5 text-indigo-400 transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`} />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
