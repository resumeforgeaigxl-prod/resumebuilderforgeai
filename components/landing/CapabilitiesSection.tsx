"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const capabilities = [
  "Resume Optimization",
  "Coding Practice",
  "Interview Preparation",
  "Project Development",
  "Career Roadmaps",
  "Job Discovery",
  "Portfolio Creation",
  "Learning Resources"
];

export default function CapabilitiesSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Platform Capabilities</h2>
          <p className="text-slate-400 text-lg">Everything you need to succeed in the modern hiring landscape.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="font-semibold text-white">{capability}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
