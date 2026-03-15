"use client";

import { motion } from "framer-motion";
import { Code, Server, Layout, ShieldCheck, Cpu, Braces, BarChart, Cloud } from "lucide-react";

const paths = [
  { role: "Frontend Developer", icon: <Layout /> },
  { role: "Backend Developer", icon: <Server /> },
  { role: "Full Stack Developer", icon: <Braces /> },
  { role: "DevOps Engineer", icon: <ShieldCheck /> },
  { role: "AI / ML Engineer", icon: <Cpu /> },
  { role: "Software Engineer", icon: <Code /> },
  { role: "Data Analyst", icon: <BarChart /> },
  { role: "Cloud Engineer", icon: <Cloud /> }
];

export default function CareerPaths() {
  return (
    <section className="py-32 px-6 bg-[#0c0c14]/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Supported Career Paths</h2>
          <p className="text-slate-400 text-lg">Our ecosystem is built for modern technology roles.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {paths.map((path, index) => (
            <motion.div
              key={path.role}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center gap-4 hover:bg-white/[0.04] transition-all group"
            >
              <div className="text-indigo-400 group-hover:scale-110 transition-transform">
                {path.icon}
              </div>
              <span className="font-bold text-white text-center">{path.role}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
