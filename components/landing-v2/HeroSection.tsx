"use client";

import Link from "next/link";
import styles from "./HeroSection.module.css";
import { ArrowRight } from "@/components/icons";

const BOTS = [
  { name: "Omni", time: "now", line: "4 roles match your profile.", color: "#34d399", href: "omni" },
  { name: "Job Scout", time: "2m", line: "Frontend Engineer is a 96% fit.", color: "#38bdf8", href: "jobs", active: true },
  { name: "Resume", time: "8m", line: "Tailored the Acme resume.", color: "#a78bfa", href: "resumes" },
  { name: "Interview", time: "14m", line: "Mock round is ready.", color: "#fb923c", href: "interview-prep" },
];

function OmniProductWindow({ locale }: { locale: string }) {
  return (
    <article aria-label="Omni job matching preview" className={styles.card}>
      <div className={styles.well}>
      <div className={styles.shot}>
        <header className={styles.chrome}>
          <span className={styles.dots} aria-hidden="true">
            <i /><i /><i />
          </span>
        </header>

        <div className={styles.desk}>
          <aside className={styles.rail} aria-label="Omni bots">
            <div className={styles.railTop}>
              <span className={styles.search}>Search</span>
              <Link href={"/" + locale + "/omni"} className={styles.addBot} aria-label="Open Omni">+</Link>
            </div>
            <ul className={styles.botList}>
              {BOTS.map((bot) => (
                <li key={bot.name}>
                  <Link
                    href={"/" + locale + "/" + bot.href}
                    className={bot.active ? styles.botRowActive : styles.botRow}
                    aria-current={bot.active ? "true" : undefined}
                  >
                    <span className={styles.avatar} style={{ background: bot.color }} aria-hidden="true" />
                    <span className={styles.botCopy}>
                      <span className={styles.botMeta}>
                        <span className={styles.botName}>{bot.name}</span>
                        <span className={styles.botTime}>{bot.time}</span>
                      </span>
                      <span className={styles.botLine}>{bot.line}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <section className={styles.convo} aria-label="Job Scout">
            <header className={styles.convoHead}>
              <span className={styles.avatar} style={{ background: "#38bdf8" }} aria-hidden="true" />
              <span className={styles.convoName}>Job Scout</span>
            </header>
            <div className={styles.checks}>
              <p>Profile read</p>
              <p>4 matches ranked</p>
              <p>Resume gap noted</p>
              <p>Interview prep queued</p>
            </div>
            <p className={styles.handoff}>
              <span className={styles.avatar} style={{ background: "#34d399" }} aria-hidden="true" />
              Omni handed over the shortlist. Frontend Engineer at Acme is a 96% fit.
            </p>
            <Link href={"/" + locale + "/omni"} className={styles.reply}>
              Message Job Scout
            </Link>
          </section>
        </div>
      </div>
      </div>
    </article>
  );
}

export default function HeroSection({ locale = "en-in" }: { locale?: string }) {
  return (
    <section className={`${styles.hero} rf-dark`}>
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Your AI career assistant</p>
          <h1 className={styles.headline}>
            Find your next opportunity with <em>Omni.</em>
          </h1>
          <p className={styles.description}>
            Find matching jobs and tailor your resume—in one conversation.
          </p>
          <div className={styles.actions}>
            <Link href={"/" + locale + "/omni"} className={styles.primary}>
              Try Omni
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href={"/" + locale + "/resumes"} className={styles.secondary}>
              Create resume
            </Link>
          </div>
        </div>

        <div className={styles.scene}>
          <div className={styles.preview}>
            <OmniProductWindow locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
