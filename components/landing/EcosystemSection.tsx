"use client";

import { motion } from "framer-motion";
import { Database, Code, Brain, Map, Search, Globe, Rocket, BookOpen } from "lucide-react";

const modules = [
  { name: "ResumeForge", icon: <Database />, color: "bg-blue-500/20 text-blue-400" },
  { name: "CodingForge", icon: <Code />, color: "bg-emerald-500/20 text-emerald-400" },
  { name: "InterviewForge", icon: <Brain />, color: "bg-purple-500/20 text-purple-400" },
  { name: "ProjectForge", icon: <Rocket />, color: "bg-orange-500/20 text-orange-400" },
  { name: "CareerForge", icon: <Map />, color: "bg-indigo-500/20 text-indigo-400" },
  { name: "LearnForge", icon: <BookOpen />, color: "bg-cyan-500/20 text-cyan-400" },
  { name: "JobForge", icon: <Search />, color: "bg-rose-500/20 text-rose-400" },
  { name: "PortfolioForge", icon: <Globe />, color: "bg-amber-500/20 text-amber-400" },
];

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="py-32 px-6 bg-white/[0.01] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">One Platform. Complete Career Ecosystem.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            ResumeForgeAI connects resume building, learning, coding practice, interview preparation, and job discovery into one integrated AI platform.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group cursor-default"
            >
              <div className={`mb-6 p-4 rounded-2xl ${module.color} group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <span className="text-lg font-bold text-white tracking-tight">{module.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
