"use client";

import { motion, Variants } from "framer-motion";
import {
  FileSearch,
  Wand2,
  LayoutTemplate,
  FileText,
  Target,
  Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: FileSearch,
    title: "ATS Analyzer",
    description:
      "Scan your resume against job descriptions and get an instant ATS compatibility score with actionable fixes.",
  },
  {
    icon: Wand2,
    title: "AI Resume Writer",
    description:
      "Generate tailored bullet points and summaries using AI trained on thousands of successful resumes.",
  },
  {
    icon: LayoutTemplate,
    title: "Resume Templates",
    description:
      "Choose from professionally designed templates optimized for readability and ATS parsing.",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description:
      "Create personalized cover letters that complement your resume for each application.",
  },
  {
    icon: Target,
    title: "Job Match Score",
    description:
      "See how well your profile matches any job posting with detailed skill gap analysis.",
  },
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    description:
      "Receive real-time recommendations to strengthen weak sections and highlight your strengths.",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <motion.div
          className="text-center"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p
            className="text-[#8F8F8F] uppercase"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "16px",
            }}
          >
            Features
          </p>
          <h2
            className="mt-3 text-[#171717]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "32px",
              fontWeight: 600,
              lineHeight: "40px",
              letterSpacing: "-1.28px",
            }}
          >
            Everything you need to land interviews
          </h2>
          <p
            className="mt-4 mx-auto max-w-2xl text-[#4D4D4D]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
            }}
          >
            A complete toolkit that transforms your resume into a job-winning
            document — powered by AI, optimized for applicant tracking systems.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              className="bg-white border border-[#EBEBEB] rounded-xl p-6 transition-shadow duration-200 hover:shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)]"
            >
              <div className="w-10 h-10 bg-[#F2F2F2] rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#171717]" />
              </div>
              <h3
                className="mt-4 text-[#171717]"
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "20px",
                  fontWeight: 600,
                  lineHeight: "28px",
                  letterSpacing: "-0.4px",
                }}
              >
                {title}
              </h3>
              <p
                className="mt-2 text-[#4D4D4D]"
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                }}
              >
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
