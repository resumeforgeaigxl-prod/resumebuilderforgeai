"use client";

import Link from "next/link";

interface FooterSectionProps {
  locale?: string;
}

const columns = (locale: string) => [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Templates", href: "#templates" },
      { label: "ATS Score", href: "#ats-score" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Forges",
    links: [
      { label: "ResumeForge", href: `/${locale}/ai-resume-builder` },
      { label: "CodingForge", href: `/${locale}/codingforge` },
      { label: "InterviewForge", href: `/${locale}/interview-prep` },
      { label: "PrepForge", href: `/${locale}/prepforge` },
      { label: "LearnForge", href: `/${locale}/learnforge` },
      { label: "ProjectForge", href: `/${locale}/projectforge` },
      { label: "CareerForge", href: `/${locale}/careerforge` },
      { label: "JobForge", href: `/${locale}/jobs` },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "https://careers.growxlabs.tech/" },
      { label: "Contact", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: `/${locale}/privacy-policy` },
      { label: "Terms of Service", href: `/${locale}/terms-of-service` },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

export default function FooterSection({ locale = "en-in" }: FooterSectionProps) {
  const footerColumns = columns(locale);

  return (
    <footer
      className="py-16 px-6"
      style={{ borderTop: "1px solid #EBEBEB" }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Column grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4
                className="mb-4"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#171717",
                }}
              >
                {column.title}
              </h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block py-1.5 transition-colors duration-200"
                      style={{
                        fontSize: "14px",
                        fontWeight: 400,
                        color: "#4D4D4D",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLAnchorElement).style.color = "#171717";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLAnchorElement).style.color = "#4D4D4D";
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid #EBEBEB" }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#8F8F8F",
            }}
          >
            © 2026 ResumeForge AI
          </span>
          <a
            href="https://growxlabs.tech"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#8F8F8F",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.color = "#171717";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.color = "#8F8F8F";
            }}
          >
            Built By Growxlabstech.
          </a>
        </div>
      </div>
    </footer>
  );
}
