"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { pricingTiers } from "@/lib/constants";

const ease = [0.16, 1, 0.3, 1] as const;

interface PricingSectionProps {
  locale?: string;
}

export default function PricingSection({ locale = "en-in" }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
        >
          <p
            className="uppercase text-[#8F8F8F]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.05em",
            }}
          >
            #05 — Pricing
          </p>
          <h2
            className="mt-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: "40px",
              letterSpacing: "-0.01em",
              color: "#171717",
            }}
          >
            Simple, transparent pricing
          </h2>
          <p
            className="mt-3"
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#4D4D4D",
            }}
          >
            Start free. Upgrade when you need more.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {pricingTiers
            .filter((tier) =>
              ["Free", "Monthly", "Professional"].includes(tier.name)
            )
            .map((tier, index) => (
              <motion.div
                key={tier.name}
                className="rounded-2xl p-8 flex flex-col transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_16px_32px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                style={{
                  backgroundColor: tier.featured ? "#171717" : "#FFFFFF",
                  border: tier.featured
                    ? "1px solid #171717"
                    : "1px solid #EBEBEB",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  ease,
                  delay: index * 0.08,
                }}
              >
                {/* Badge */}
                {tier.featured && (
                  <span
                    className="self-start inline-flex items-center px-2.5 py-0.5 rounded-full mb-4 text-[10px] font-semibold tracking-wider uppercase"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "#FFFFFF",
                    }}
                  >
                    Popular
                  </span>
                )}

                {/* Tier name */}
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: "28px",
                    letterSpacing: "-0.4px",
                    color: tier.featured ? "#FFFFFF" : "#171717",
                  }}
                >
                  {tier.name}
                </h3>

                {/* Price */}
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span
                    style={{
                      fontSize: "32px",
                      fontWeight: 600,
                      lineHeight: "40px",
                      letterSpacing: "-1.28px",
                      color: tier.featured ? "#FFFFFF" : "#171717",
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.cadence && (
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 400,
                        color: tier.featured
                          ? "rgba(255, 255, 255, 0.6)"
                          : "#8F8F8F",
                      }}
                    >
                      {tier.cadence}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p
                  className="mt-1 min-h-[40px]"
                  style={{
                    fontSize: "13px",
                    lineHeight: "18px",
                    fontWeight: 400,
                    color: tier.featured
                      ? "rgba(255, 255, 255, 0.7)"
                      : "#4D4D4D",
                  }}
                >
                  {tier.description}
                </p>

                {/* Divider */}
                <div
                  className="my-6"
                  style={{
                    height: "1px",
                    backgroundColor: tier.featured
                      ? "rgba(255, 255, 255, 0.2)"
                      : "#EBEBEB",
                  }}
                />

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{
                          color: tier.featured ? "#FFFFFF" : "#171717",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          lineHeight: "20px",
                          fontWeight: 400,
                          color: tier.featured
                            ? "rgba(255, 255, 255, 0.8)"
                            : "#4D4D4D",
                        }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={`/${locale}${tier.href}`} className="block w-full mt-auto">
                  <button
                    className="w-full h-10 rounded-full font-medium transition-colors duration-200 cursor-pointer text-center"
                    style={{
                      fontSize: "14px",
                      backgroundColor: "#FFFFFF",
                      color: "#171717",
                      border: tier.featured ? "none" : "1px solid #EBEBEB",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        "#F2F2F2";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor =
                        "#FFFFFF";
                    }}
                  >
                    {tier.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}

