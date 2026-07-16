"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
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
    { label: "Blog", href: `/${locale}/blogs` },
    { label: "Pricing", href: `/${locale}/pricing` },
  ];

  const mobileLinks = [
    { label: "Resume Builder", href: `/${locale}/resumes` },
    { label: "Resume Templates", href: `/${locale}#templates` },
    { label: "ATS Scanner", href: `/${locale}#ats-score` },
    { label: "Project Services", href: `/${locale}/project-services` },
    { label: "Blog", href: `/${locale}/blogs` },
    { label: "Pricing", href: `/${locale}/pricing` },
  ];

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

        {/* ── Center links (desktop dropdown + static links) ── */}
        <ul className="hidden md:flex items-center gap-8">
          <li 
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className="flex items-center gap-1 text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono text-[13px] uppercase font-semibold tracking-[0.04em] h-16 focus:outline-none"
            >
              Services <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#171717] transition-transform duration-200" />
            </button>
            
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-14 left-1/2 -translate-x-1/2 w-64 bg-white border border-[#EBEBEB] rounded-xl shadow-lg p-3 z-50 text-left"
                >
                  <div className="flex flex-col gap-1">
                    {[
                      { label: "Resume Builder", desc: "Build ATS-friendly resumes", href: `/${locale}/resumes` },
                      { label: "Resume Templates", desc: "Browse curated designs", href: `/${locale}#templates` },
                      { label: "ATS Scanner", desc: "Check score instantly", href: `/${locale}#ats-score` },
                      { label: "Project Services", desc: "Final year B.Tech projects", href: `/${locale}/project-services` }
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex flex-col p-2.5 rounded-lg hover:bg-stone-50 transition-colors"
                      >
                        <span className="text-[12px] font-sans font-bold text-[#171717]">{item.label}</span>
                        <span className="text-[10px] font-sans text-stone-400 font-medium mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {staticLinks.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono text-[13px] uppercase font-semibold tracking-[0.04em]"
              >
                {label}
              </Link>
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
            href={`/${locale}/resumes`}
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
              {mobileLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono py-1 text-[13px] uppercase font-semibold tracking-[0.04em]"
                >
                  {label}
                </Link>
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
                  href={`/${locale}/resumes`}
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
