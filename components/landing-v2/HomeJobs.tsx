"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ArrowRight, MapPin, Briefcase, Check, Code2, Layers, Cpu } from "@/components/icons";
import { generateJobSlug } from "@/lib/jobs/slug";
import styles from "./HomeJobs.module.css";

export interface HomeJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote_type: string | null;
  employment_type: string | null;
  skills: string[] | null;
  slug: string | null;
}

function label(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initial(company: string) {
  const letter = company.trim().charAt(0);
  return letter ? letter.toUpperCase() : "H";
}

function tidyTitle(title: string) {
  return title.replace(/\s*\([^)]{12,}\)/g, "").replace(/\s+/g, " ").trim();
}

const paths = [
  { title: "Engineering", detail: "Build the products people use every day.", tags: ["Frontend", "Backend", "Full stack"], icon: Code2 },
  { title: "Product & design", detail: "Shape how people experience technology.", tags: ["Product", "UX", "Design systems"], icon: Layers },
  { title: "Data & AI", detail: "Turn complex problems into new possibilities.", tags: ["Machine learning", "Data", "AI"], icon: Cpu },
];

export default function HomeJobs({ locale, jobs = [] }: { locale: string; jobs?: HomeJob[] }) {
  const [paused, setPaused] = useState(false);
  const moving = jobs.length > 1;
  return (
    <section className={`${styles.section} rf-dark`} aria-labelledby="home-jobs-title">
      <div className={styles.frame}>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>THE OPPORTUNITY BOARD</p><h2 id="home-jobs-title">Good work starts with<br /><em>the right opportunity.</em></h2></div>
          <div className={styles.intro}><p>Find a role worth your next chapter.<br />Explore openings. Make your next move.</p><Link href={`/${locale}/jobs`} className={styles.browse}>Explore all jobs <ArrowUpRight aria-hidden="true" /></Link></div>
        </header>
        <div className={styles.sectionLabel}><span>{jobs.length ? `${jobs.length} OPEN ROLES` : 'EXPLORE CAREER PATHS'}</span>{moving && <button type="button" className={styles.motionControl} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume scrolling' : 'Pause scrolling'}</button>}</div>
        <div className={styles.marquee} data-paused={paused} data-moving={moving}>
        <div className={styles.track} style={{ animationDuration: `${Math.max(jobs.length, 3) * 9}s` }}>
        {Array.from({ length: moving ? 2 : 1 }, (_, copy) => (
        <div className={styles.grid} key={copy} aria-hidden={copy === 1 ? true : undefined} data-copy={copy}>
          {jobs.length ? jobs.map((job) => {
            const company = job.company || "Hiring team";
            return (
            <article key={job.id} className={styles.card}>
              <div className={styles.top}>
                <span className={styles.mark} data-tone={company.length % 3} aria-hidden="true">{initial(company)}</span>
                <p className={styles.company}>{company}</p>
                {job.employment_type && <span className={styles.badge}>{label(job.employment_type)}</span>}
              </div>
              <h3>{tidyTitle(job.title)}</h3>
              <p className={styles.meta}>
                <span><MapPin aria-hidden="true" />{job.location || "Location not listed"}</span>
                {job.remote_type && job.remote_type.toUpperCase() !== "UNKNOWN" && <span><Briefcase aria-hidden="true" />{label(job.remote_type)}</span>}
              </p>
              {(job.skills || []).length > 0 && <ul className={styles.tags}>{(job.skills || []).slice(0, 3).map(skill => <li key={skill}><Check aria-hidden="true" />{skill}</li>)}</ul>}
              <Link className={styles.view} tabIndex={copy === 1 ? -1 : undefined} href={`/${locale}/jobs/${job.slug || generateJobSlug(job)}`} aria-label={`View ${job.title} at ${company}`}>View role <ArrowUpRight aria-hidden="true" /></Link>
            </article>
            );
          }) : paths.map((path) => (
            <article key={path.title} className={styles.card}>
              <div className={styles.top}>
                <span className={styles.mark} aria-hidden="true"><path.icon /></span>
                <p className={styles.company}>Find your direction</p>
                <span className={styles.badge}>Career path</span>
              </div>
              <h3>{path.title}</h3>
              <p className={styles.pathDetail}>{path.detail}</p>
              <div className={styles.tags}>{path.tags.map(tag => <span key={tag}><Check aria-hidden="true" />{tag}</span>)}</div>
              <Link className={styles.view} href={`/${locale}/jobs`}>Explore jobs <ArrowUpRight aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
        ))}
        </div>
        </div>
        <div className={styles.bottom}><p>A role caught your eye? Give your application a clearer direction.</p><Link href={`/${locale}/omni`}>Prepare with Omni <ArrowRight aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
