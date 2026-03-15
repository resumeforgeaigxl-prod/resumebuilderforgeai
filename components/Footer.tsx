import Link from "next/link";
import { DEFAULT_LOCALE, aiToolCards, moduleCards } from "@/lib/constants";

type FooterProps = {
  locale?: string;
};

export default function Footer({ locale = DEFAULT_LOCALE }: FooterProps) {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-slate-950/[0.55] px-6 py-16 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.8fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(56,189,248,0.95),rgba(245,158,11,0.85))] text-sm font-semibold tracking-[0.18em] text-slate-950">
                RF
              </span>
              <span className="text-xl font-semibold tracking-tight text-white">
                ResumeForgeAI
              </span>
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-300">
              AI-powered career platform for developers and students.
            </p>
            <div className="mt-8">
              <Link
                href={`/${locale}/signup`}
                className="btn-secondary inline-flex rounded-full px-5 py-3 text-sm font-medium"
              >
                Build My Resume Free
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
              Modules
            </h3>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {moduleCards.map((module) => (
                <li key={module.title}>{module.title}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
              AI Tools
            </h3>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {aiToolCards
                .filter((tool) =>
                  [
                    "ExplainForge AI",
                    "StudyForge AI",
                    "JobForge AI Assistant",
                    "AI Company Prep",
                  ].includes(tool.title),
                )
                .map((tool) => (
                  <li key={tool.title}>{tool.title}</li>
                ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
              Legal
            </h3>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li>
                <Link
                  href={`/${locale}/privacy-policy`}
                  className="transition-colors duration-200 hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms-of-service`}
                  className="transition-colors duration-200 hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/cookie-policy`}
                  className="transition-colors duration-200 hover:text-white"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.08] pt-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ResumeForgeAI</p>
          <p>Built to connect resumes, coding, interviews, learning, and jobs.</p>
        </div>
      </div>
    </footer>
  );
}
