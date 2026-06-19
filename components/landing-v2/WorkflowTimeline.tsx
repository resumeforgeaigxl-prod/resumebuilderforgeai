"use client";

import { motion, Variants } from "framer-motion";

interface Step {
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    title: "Upload Resume",
    description:
      "Drop your existing resume or start from scratch. We support PDF, DOCX, and plain text.",
  },
  {
    title: "AI Analysis",
    description:
      "Our AI engine parses your content, identifies strengths, and flags areas for improvement.",
  },
  {
    title: "Content Enhancement",
    description:
      "Get AI-generated suggestions for stronger bullet points, better keywords, and clearer formatting.",
  },
  {
    title: "ATS Optimization",
    description:
      "Automatically optimize your resume to pass applicant tracking systems used by top companies.",
  },
  {
    title: "Export PDF",
    description:
      "Download your polished, ATS-optimized resume as a professional PDF ready to submit.",
  },
];

const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardLeftVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.1,
    },
  },
};

const cardRightVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.1,
    },
  },
};

const mobileCardVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.1,
    },
  },
};

function StepCard({ title, description }: Step) {
  return (
    <div className="bg-white border border-[#EBEBEB] rounded-xl p-5">
      <h3
        className="text-[#171717]"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: "24px",
          letterSpacing: "-0.28px",
        }}
      >
        {title}
      </h3>
      <p
        className="mt-1.5 text-[#4D4D4D]"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "20px",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function StepCircle({ number }: { number: number }) {
  return (
    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#171717] flex items-center justify-center flex-shrink-0 z-10">
      <span
        className="text-[#171717]"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
        }}
      >
        {number}
      </span>
    </div>
  );
}

export default function WorkflowTimeline() {
  return (
    <section id="workflow" className="py-24 px-6">
      <div className="mx-auto max-w-[800px]">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
            Workflow
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
            How ResumeForge Works
          </h2>
        </motion.div>

        {/* Mobile Timeline (left-aligned) */}
        <div className="md:hidden relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#EBEBEB]" />

          <div className="flex flex-col gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="flex items-start gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ staggerChildren: 0.05, delayChildren: i * 0.15 }}
              >
                <motion.div variants={nodeVariants}>
                  <StepCircle number={i + 1} />
                </motion.div>
                <motion.div className="flex-1 pt-1" variants={mobileCardVariants}>
                  <StepCard {...step} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Timeline (centered, alternating) */}
        <div className="hidden md:block relative">
          {/* Vertical center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#EBEBEB] -translate-x-px" />

          <div className="flex flex-col gap-12">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  className="relative flex items-center"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    staggerChildren: 0.05,
                    delayChildren: i * 0.15,
                  }}
                >
                  {isLeft ? (
                    <>
                      {/* Card on the left */}
                      <motion.div
                        className="w-[calc(50%-36px)] pr-2"
                        variants={cardRightVariants}
                      >
                        <StepCard {...step} />
                      </motion.div>

                      {/* Circle center */}
                      <motion.div
                        className="absolute left-1/2 -translate-x-1/2"
                        variants={nodeVariants}
                      >
                        <StepCircle number={i + 1} />
                      </motion.div>

                      {/* Empty right */}
                      <div className="w-[calc(50%-36px)] ml-auto" />
                    </>
                  ) : (
                    <>
                      {/* Empty left */}
                      <div className="w-[calc(50%-36px)]" />

                      {/* Circle center */}
                      <motion.div
                        className="absolute left-1/2 -translate-x-1/2"
                        variants={nodeVariants}
                      >
                        <StepCircle number={i + 1} />
                      </motion.div>

                      {/* Card on the right */}
                      <motion.div
                        className="w-[calc(50%-36px)] ml-auto pl-2"
                        variants={cardLeftVariants}
                      >
                        <StepCard {...step} />
                      </motion.div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
