"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const getNavLinks = (locale: string) => [
  { label: "Features", href: `/${locale}#features` },
  { label: "Templates", href: `/${locale}#templates` },
  { label: "ATS Score", href: `/${locale}#ats-score` },
  { label: "Blog", href: `/${locale}/posts` },
  { label: "Pricing", href: `/${locale}/pricing` },
] as const;

interface NavbarProps {
  locale?: string;
}

export default function Navbar({ locale = "en-in" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = getNavLinks(locale);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full bg-[#fafaf9]"
    >
      <nav
        className={`mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 border-x border-[#e7e5e4] transition-all duration-300 ${
          scrolled
            ? "bg-[#FAFAFA]/80 backdrop-blur-md border-b border-[#e7e5e4]"
            : "bg-[#FAFAFA] border-b border-transparent"
        }`}
      >
        {/* ── Logo ── */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 select-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171717]">
            <span
              className="text-white"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "12px",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              RF
            </span>
          </div>
          <span
            className="text-[#171717]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            ResumeForge AI
          </span>
        </Link>

        {/* ── Center links (desktop) ── */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono"
                style={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  fontWeight: 600,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.04em",
                  lineHeight: "20px",
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* ── Right actions (desktop) ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center justify-center rounded-xl border border-[#EBEBEB] bg-white px-3 h-9 text-[#171717] transition-all duration-75 hover:bg-[#F2F2F2] active:scale-95 font-mono text-[13px] uppercase font-semibold"
            style={{
              fontFamily: "monospace",
              letterSpacing: "0.04em",
              lineHeight: "20px",
            }}
          >
            Sign In
          </Link>
          <Link
            href={`/${locale}/ai-resume-builder`}
            className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-5 h-10 text-white transition-all duration-75 hover:bg-[#6d28d9] active:scale-95 font-mono text-[13px] uppercase font-semibold"
            style={{
              fontFamily: "monospace",
              letterSpacing: "0.04em",
              lineHeight: "20px",
            }}
          >
            Generate Resume
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center rounded-[6px] border border-[#EBEBEB] bg-white h-9 w-9 text-[#171717] transition-colors duration-200 hover:bg-[#F2F2F2]"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-b border-[#EBEBEB] bg-[#FAFAFA]"
          >
            <div className="mx-auto max-w-[1200px] px-6 py-6 flex flex-col gap-4">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono py-1"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.04em",
                    lineHeight: "20px",
                  }}
                >
                  {label}
                </a>
              ))}

              <div className="flex flex-col gap-3 pt-4 border-t border-[#EBEBEB]">
                <Link
                  href={`/${locale}/signup`}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#EBEBEB] bg-white px-3 h-9 text-[#171717] transition-all duration-75 hover:bg-[#F2F2F2] active:scale-95 font-mono text-[13px] uppercase font-semibold"
                  style={{
                    fontFamily: "monospace",
                    letterSpacing: "0.04em",
                    lineHeight: "20px",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href={`/${locale}/ai-resume-builder`}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-5 h-10 text-white transition-all duration-75 hover:bg-[#6d28d9] active:scale-95 font-mono text-[13px] uppercase font-semibold"
                  style={{
                    fontFamily: "monospace",
                    letterSpacing: "0.04em",
                    lineHeight: "20px",
                  }}
                >
                  Generate Resume
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
