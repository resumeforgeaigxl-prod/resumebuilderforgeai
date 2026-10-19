"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, FileText, Layout, Zap } from "@/components/icons";
import Link from "next/link";

interface NavbarProps {
  locale?: string;
}

export default function Navbar({ locale = "en-in" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const staticLinks = [
    { label: "Project Services", href: `/${locale}/project-services` },
    { label: "Blog", href: `/${locale}/blogs` },
    { label: "Pricing", href: `/${locale}/pricing` },
  ];

  const mobileLinks = [
    { label: "Resume Builder", href: `/${locale}/resumes` },
    { label: "Resume Templates", href: `/${locale}/resumes` },
    { label: "ATS Scanner", href: `/${locale}/ats-live` },
    { label: "Project Services", href: `/${locale}/project-services` },
    { label: "Blog", href: `/${locale}/blogs` },
    { label: "Pricing", href: `/${locale}/pricing` },
  ];

  const dropdownItems = [
    {
      label: "Builder",
      desc: "Write and tailor the resume.",
      href: `/${locale}/resumes`,
      icon: FileText,
    },
    {
      label: "Layouts",
      desc: "Choose how the page looks.",
      href: `/${locale}/resumes`,
      icon: Layout,
    },
    {
      label: "ATS check",
      desc: "See how the resume reads to a screen.",
      href: `/${locale}/ats-live`,
      icon: Zap,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0c0d10]">
      <nav
        className={`mx-auto flex h-14 max-w-[1120px] items-center justify-between px-8 transition-all duration-300 ${
          scrolled
            ? "bg-[#0c0d10]/90 backdrop-blur-md border-b border-[#2a2c33]"
            : "bg-[#0c0d10] border-b border-transparent"
        }`}
      >
        {/* ── Logo ── */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 select-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2e3138]">
            <span
              className="text-[#f4f5f7]"
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
            className="text-[#f4f5f7]"
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

        {/* ── Center links (desktop dropdown + static links) ── */}
        <ul className="hidden lg:flex items-center gap-8 text-[#f4f5f7]">
          <li 
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className="flex items-center gap-1 text-[#8b909a] transition-colors duration-200 hover:text-[#f4f5f7] font-mono text-[13px] uppercase font-semibold tracking-[0.04em] h-14 focus:outline-none"
            >
              Resume <ChevronDown className="w-3.5 h-3.5 text-[#8b909a]" />
            </button>
            
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 top-14 z-50 grid w-[520px] -translate-x-1/2 grid-cols-[1fr_200px] overflow-hidden rounded-2xl border border-[#2a2c33] bg-[#0c0d10] text-left shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
                >
                  <div className="p-2">
                    {dropdownItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[#16171b]"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2a2c33] bg-[#16171b]">
                            <Icon className="h-4 w-4 text-[#d7e4f0]" />
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-[#f4f5f7]">{item.label}</span>
                            <span className="mt-0.5 block text-[13px] leading-5 text-[#8b909a]">{item.desc}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="relative min-h-[220px]">
                    <img src="/cta-night.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-[#050505]/10" />
                    <p
                      className="absolute bottom-4 left-4 right-4 text-[22px] font-normal leading-[1.1] tracking-[-0.03em] text-[#f4f5f7]"
                      style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                    >
                      Write it. Then send it.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {staticLinks.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="text-[#8b909a] transition-colors duration-200 hover:text-[#f4f5f7] font-mono text-[13px] uppercase font-semibold tracking-[0.04em]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Right actions (desktop) ── */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href={`/${locale}/login`}
            className="text-[13px] font-medium text-[#b4b8c2] transition-colors hover:text-[#f4f5f7]"
          >
            Sign in
          </Link>
          <Link
            href={`/${locale}/resumes`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2e3138] px-3.5 text-[13px] font-medium text-[#f4f5f7] transition-colors hover:bg-[#16171b]"
          >
            Generate resume
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden inline-flex items-center justify-center rounded-[6px] border border-[#2e3138] bg-transparent h-9 w-9 text-[#f4f5f7] transition-colors duration-200 hover:bg-[#16171b]"
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
            className="lg:hidden overflow-hidden border-b border-[#2a2c33] bg-[#0c0d10]"
          >
            <div className="mx-auto max-w-[1200px] px-6 py-6 flex flex-col gap-4">
              {mobileLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#b4b8c2] transition-colors duration-200 hover:text-[#f4f5f7] font-mono py-1 text-[13px] uppercase font-semibold tracking-[0.04em]"
                >
                  {label}
                </Link>
              ))}

              <div className="flex flex-col gap-3 pt-4 border-t border-[#2a2c33]">
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center text-[14px] font-medium text-[#b4b8c2]"
                >
                  Sign in
                </Link>
                <Link
                  href={`/${locale}/resumes`}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2e3138] px-4 text-[14px] font-medium text-[#f4f5f7]"
                >
                  Generate resume
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
