"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

interface FinalCTAProps {
  locale?: string;
}

export default function FinalCTA({ locale = "en-in" }: FinalCTAProps) {
  return (
    <section className="py-24 md:py-32 px-6">
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
            fontWeight: 600,
            color: "#171717",
          }}
        >
          <span
            className="block md:hidden"
            style={{
              fontSize: "32px",
              lineHeight: "40px",
              letterSpacing: "-1.28px",
            }}
          >
            Your next opportunity starts with a complete career platform.
          </span>
          <span
            className="hidden md:block"
            style={{
              fontSize: "48px",
              lineHeight: "48px",
              letterSpacing: "-2.4px",
            }}
          >
            Your next opportunity starts with a complete career platform.
          </span>
        </h2>

        <Link href={`/${locale}/signup`} className="inline-block mt-8">
          <button
            className="inline-flex items-center justify-center px-8 h-12 rounded-full font-medium transition-colors duration-200 cursor-pointer"
            style={{
              backgroundColor: "#171717",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            Get Started Free
          </button>
        </Link>
      </motion.div>
    </section>
  );
}
