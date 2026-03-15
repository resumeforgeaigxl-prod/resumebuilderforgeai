"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const steps = [
  "ResumeForge",
  "CareerForge",
  "LearnForge",
  "CodingForge",
  "InterviewForge",
  "JobForge",
  "PortfolioForge"
];

export default function WorkflowSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">How The Platform Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            The ecosystem guides users from building a resume to learning skills, practicing coding, preparing for interviews, and discovering job opportunities.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="w-full max-w-sm p-6 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-center font-bold text-xl text-indigo-100 shadow-lg hover:border-indigo-500/50 transition-colors"
              >
                {step}
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: index * 0.1 + 0.2 }}
                   className="py-4"
                >
                  <ChevronDown className="w-6 h-6 text-slate-600" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
