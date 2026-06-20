"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

interface FinalCTAProps {
  locale?: string;
}

export default function FinalCTA({ locale = "en-in" }: FinalCTAProps) {
  return (
    <section className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white py-24 md:py-32 px-6">
        <motion.div
          className="max-w-[800px] mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease }}
      >
        <h2
          className="leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "#171717",
          }}
        >
          <span
            className="block md:hidden"
            style={{
              fontSize: "32px",
              lineHeight: "40px",
              letterSpacing: "-0.01em",
            }}
          >
            Your next opportunity starts with a complete career platform.
          </span>
          <span
            className="hidden md:block"
            style={{
              fontSize: "48px",
              lineHeight: "48px",
              letterSpacing: "-0.01em",
            }}
          >
            Your next opportunity starts with a complete career platform.
          </span>
        </h2>

        <Link href={`/${locale}/signup`} className="inline-block mt-8">
          <button
            className="inline-flex items-center justify-center px-8 h-12 rounded-xl font-semibold transition-all duration-75 cursor-pointer border active:scale-95"
            style={{
              backgroundColor: "#7c3aed",
              borderColor: "#6d28d9",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Get Started Free
          </button>
        </Link>
      </motion.div>
      </div>
    </section>
  );
}
