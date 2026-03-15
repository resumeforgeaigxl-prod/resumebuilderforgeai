"use client";

import { motion } from "framer-motion";
import { FileText, Search, Target, Video, Rocket, Map } from "lucide-react";

const features = [
  {
    title: "AI Resume Builder",
    description: "Create structured resumes optimized for modern hiring systems.",
    icon: <FileText className="w-6 h-6 text-indigo-400" />
  },
  {
    title: "ATS Analyzer",
    description: "Evaluate resume compatibility with ATS systems.",
    icon: <Search className="w-6 h-6 text-emerald-400" />
  },
  {
    title: "JD Matching",
    description: "Compare resumes against job descriptions.",
    icon: <Target className="w-6 h-6 text-rose-400" />
  },
  {
    title: "AI Mock Interviews",
    description: "Practice technical and behavioral interviews.",
    icon: <Video className="w-6 h-6 text-amber-400" />
  },
  {
    title: "Project Generator",
    description: "Generate portfolio-ready project ideas.",
    icon: <Rocket className="w-6 h-6 text-purple-400" />
  },
  {
    title: "Career Roadmaps",
    description: "Create AI-generated learning paths.",
    icon: <Map className="w-6 h-6 text-blue-400" />
  }
];

export default function FeatureDeepDive() {
  return (
    <section className="py-32 px-6 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Core Functionality</h2>
          <h2 className="text-3xl md:text-5xl font-black mb-6">Feature Deep Dive</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-[#0c0c14] border border-white/[0.05] hover:border-white/10 transition-all hover:-translate-y-1"
            >
              <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] w-fit">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
