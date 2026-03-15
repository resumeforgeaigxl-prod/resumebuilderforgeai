"use client";

import { motion } from "framer-motion";
import { FileSearch, Hash, Zap, MessageSquare } from "lucide-react";

const problems = [
  {
    title: "Parser Failures",
    description: "Many resumes fail ATS parsing systems.",
    icon: <FileSearch className="w-6 h-6 text-rose-400" />,
  },
  {
    title: "Keyword Gaps",
    description: "Resumes miss important keywords required by hiring systems.",
    icon: <Hash className="w-6 h-6 text-amber-400" />,
  },
  {
    title: "Generic Content",
    description: "Resumes fail to demonstrate real impact.",
    icon: <Zap className="w-6 h-6 text-emerald-400" />,
  },
  {
    title: "Zero Feedback",
    description: "Candidates rarely receive actionable feedback on applications.",
    icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
  },
];

export default function ProblemSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">The Modern Hiring Crisis</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Candidates face systemic barriers in the modern job market that traditional tools simply don&apos;t address.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all group"
            >
              <div className="mb-6 p-3 rounded-2xl bg-white/[0.03] w-fit group-hover:scale-110 transition-transform">
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{problem.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
