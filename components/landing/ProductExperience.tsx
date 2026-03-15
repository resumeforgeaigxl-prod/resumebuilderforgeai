"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Play } from "lucide-react";

export default function ProductExperience() {
  return (
    <section className="py-32 px-6 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-6">Experience the Platform</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-12">
          Explore how ResumeForgeAI helps candidates build resumes, learn skills, prepare for interviews, and discover jobs.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden aspect-[16/9] border border-white/10 shadow-2xl bg-[#0c0c14] group"
        >
          {/* Product Walkthrough Placeholder/Video */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <div className="p-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 h-14 rounded-2xl text-lg shadow-xl font-bold">
              Launch Ecosystem Tour
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
