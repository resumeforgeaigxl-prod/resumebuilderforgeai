"use client";

import { motion } from "framer-motion";

const modules = [
  { title: "ResumeForge", desc: "Build and optimize resumes." },
  { title: "CodingForge", desc: "Practice coding challenges." },
  { title: "InterviewForge", desc: "Prepare with AI interview simulations." },
  { title: "ProjectForge", desc: "Generate portfolio projects." },
  { title: "CareerForge", desc: "Create AI career roadmaps." },
  { title: "LearnForge", desc: "Access curated learning content." },
  { title: "JobForge", desc: "Discover aggregated job opportunities." },
  { title: "PortfolioForge", desc: "Convert resumes into portfolio websites." }
];

export default function ForgeModules() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Explore the Forge Modules</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/20 transition-all flex flex-col justify-between h-full group"
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{module.title}</h3>
                <p className="text-slate-500 text-sm">{module.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
