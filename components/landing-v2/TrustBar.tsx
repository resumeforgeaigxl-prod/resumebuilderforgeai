"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "12,400+", label: "Resumes generated" },
  { value: "92%", label: "Average ATS pass rate" },
  { value: "1.2s", label: "Average build time" },
  { value: "4.8★", label: "User satisfaction rating" },
];

export default function TrustBar() {
  return (
    <section className="w-full border-y border-[#e5e5e5] bg-white select-none">
      {/* Stats Grid — AutoSend bordered grid pattern */}
      <div className="max-w-[1200px] mx-auto border-x border-[#e5e5e5]">
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#e5e5e5]">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex flex-col justify-center items-center gap-1.5 px-4 sm:px-6 py-6 border-[#e5e5e5] odd:border-r [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0 md:[&:nth-child(-n+3)]:border-r"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: index * 0.08 }}
            >
              <p
                className="text-center"
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#171717",
                }}
              >
                {stat.value}
              </p>
              <p
                className="text-center"
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "#737373",
                }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust message row */}
        <div className="flex justify-center items-center px-6 py-4 bg-[#FAFAFA] border-b border-[#e5e5e5]">
          <p
            className="text-center"
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.12em",
              color: "#737373",
            }}
          >
            Trusted by developers, designers & job seekers worldwide
          </p>
        </div>

        {/* Logo / Institution Row — AutoSend pattern */}
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {["IIT Delhi", "IIM Bangalore", "BITS Pilani", "NIT Trichy"].map((name, i) => (
            <div
              key={name}
              className="flex items-center justify-center px-4 sm:px-6 py-5 border-[#e5e5e5] odd:border-r [&:nth-child(-n+2)]:border-b sm:[&:nth-child(-n+2)]:border-b-0 sm:[&:nth-child(-n+3)]:border-r"
            >
              <span
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#a8a29e",
                  letterSpacing: "-0.01em",
                }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
