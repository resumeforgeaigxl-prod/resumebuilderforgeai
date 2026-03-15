"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, EyeOff, Server } from "lucide-react";

const points = [
  { title: "Secure resume storage", icon: <Lock className="w-5 h-5" /> },
  { title: "Private user workspace", icon: <Server className="w-5 h-5" /> },
  { title: "Controlled data access", icon: <EyeOff className="w-5 h-5" /> },
  { title: "Encrypted data handling", icon: <ShieldCheck className="w-5 h-5" /> }
];

export default function SecurityPrivacy() {
  return (
    <section className="py-32 px-6 bg-[#0c0c14]/30">
      <div className="max-w-7xl mx-auto border border-white/[0.05] rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Your Career Data Stays Secure</h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              We prioritize your privacy and data security. Your information is encrypted and protected by enterprise-grade security protocols.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {points.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-4 group hover:bg-white/[0.05] transition-all"
              >
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                    {point.icon}
                </div>
                <span className="font-bold text-white text-sm">{point.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
