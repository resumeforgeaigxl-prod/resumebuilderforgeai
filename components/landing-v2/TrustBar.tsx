"use client";

import { motion, Variants } from "framer-motion";
import { Shield, Sparkles, LayoutTemplate, FileDown, Target } from "lucide-react";

const capabilities = [
  { icon: Shield, label: "ATS Optimization" },
  { icon: Sparkles, label: "AI Tailored Content" },
  { icon: LayoutTemplate, label: "Multiple Templates" },
  { icon: FileDown, label: "PDF Export" },
  { icon: Target, label: "Job Matching" },
] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function TrustBar() {
  return (
    <section className="py-20 px-6">
      <motion.div
        className="mx-auto max-w-[1200px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {capabilities.map(({ icon: Icon, label }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="bg-white border border-[#EBEBEB] rounded-xl p-6"
          >
            <Icon className="w-5 h-5 text-[#171717]" />
            <p
              className="mt-3 text-[#171717]"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                letterSpacing: "-0.28px",
              }}
            >
              {label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
