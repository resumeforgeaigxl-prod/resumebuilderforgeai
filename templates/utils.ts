/**
 * Shared template utilities
 * — used by all 8 print template generators
 */
import { ResumeData, SkillCategory } from '@/types/resume';

export function esc(s: string | undefined | null): string {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function limitWords(s: string, max = 22): string {
    const words = s.trim().split(/\s+/);
    return words.length > max ? words.slice(0, max).join(' ') + '…' : s;
}

export function enforceOnePage(r: ResumeData): ResumeData {
    const d: ResumeData = JSON.parse(JSON.stringify(r));
    if (d.projects.length > 4) d.projects = d.projects.slice(0, 4);
    d.projects = d.projects.map(p => ({
        ...p,
        description: p.description.slice(0, 3).map(s => limitWords(s, 20)),
    }));
    d.experience = d.experience.map(e => ({
        ...e,
        points: e.points.slice(0, 4).map(s => limitWords(s, 20)),
    }));
    return d;
}

export function buildContactLine(r: ResumeData, sep = ' &bull; '): string {
    const parts: string[] = [];
    if (r.phone) parts.push(esc(r.phone));
    if (r.email) parts.push(`<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>`);
    if (r.linkedin) parts.push(`<a href="${esc(r.linkedin)}">LinkedIn</a>`);
    if (r.github) parts.push(`<a href="${esc(r.github)}">GitHub</a>`);
    return parts.join(sep);
}

export function buildSkillRows(r: ResumeData, catStyle: string, valStyle: string): string {
    const cats: SkillCategory[] = (r.skillCategories ?? []).filter(c => c.skills.length > 0);
    if (cats.length > 0) {
        return cats.map(c =>
            `<p class="sk-row"><span class="${catStyle}">${esc(c.category)}:</span><span class="${valStyle}"> ${c.skills.map(esc).join(', ')}</span></p>`
        ).join('');
    }
    if (r.skills?.length > 0) {
        return `<p class="sk-row"><span class="${catStyle}">Technical Skills:</span><span class="${valStyle}"> ${r.skills.map(esc).join(', ')}</span></p>`;
    }
    return '';
}

export function buildCertSection(r: ResumeData): string {
    if (!r.certifications?.length) return '';
    return r.certifications.map(c =>
        `<div class="cert-item">${esc(c.title)}${c.issuer ? ` &mdash; ${esc(c.issuer)}` : ''}${c.year ? ` (${esc(c.year)})` : ''}</div>`
    ).join('');
}

/**
 * Graduated compression stages for single-page enforcement.
 * Applied iteratively by the download route until content fits A4.
 *
 * Stage 1 — Tighten spacing only (conservative, preserves typography)
 * Stage 2 — Also reduce line-height (moderate)
 * Stage 3 — Also reduce font-size to min 10.5pt (last resort)
 */

/** Stage 1: reduce section/entry/bullet spacing only */
export const COMPRESS_STAGE_1 = `
  .section, .sec  { margin-bottom: 6px !important; }
  .entry           { margin-bottom: 4px !important; }
  ul               { margin-top: 1px !important; }
  ul li            { margin-bottom: 1px !important; }
  .sk-row          { margin-bottom: 1px !important; }
  .cert-item       { margin-bottom: 1px !important; }
  .plink           { margin-top: 0 !important; margin-bottom: 1px !important; }
  .header-block    { padding-bottom: 5px !important; margin-bottom: 7px !important; }
  .contact         { margin-bottom: 7px !important; }
  hr               { margin: 5px 0 !important; }
  .center-rule     { margin: 4px auto 7px !important; }
`;

/** Stage 2: Stage 1 + reduce line-height */
export const COMPRESS_STAGE_2 = `
  ${COMPRESS_STAGE_1}
  body             { line-height: 1.20 !important; }
  ul li            { line-height: 1.20 !important; margin-bottom: 0 !important; }
  .sk-row          { line-height: 1.20 !important; }
  .summary, .summary-text { line-height: 1.22 !important; }
`;

/** Stage 3: Stage 2 + shrink font-size to 10.5pt minimum */
export const COMPRESS_STAGE_3 = `
  ${COMPRESS_STAGE_2}
  body             { font-size: 10.5pt !important; line-height: 1.18 !important; }
  .name-hd         { font-size: 17pt !important; }
  .etitle          { font-size: 10.5pt !important; }
  ul li            { font-size: 10.2pt !important; }
  .sec-title       { font-size: 9pt !important; }
  .esub            { font-size: 8.8pt !important; }
  .contact         { font-size: 8.5pt !important; }
  .sk-row          { font-size: 9pt !important; }
  .cert-item       { font-size: 9pt !important; }
  .edate           { font-size: 8.2pt !important; }
  .plink           { font-size: 7.8pt !important; }
  .section, .sec   { margin-bottom: 5px !important; }
  .entry           { margin-bottom: 2px !important; }
`;

/** @deprecated use COMPRESS_STAGE_* instead */
export const OVERFLOW_GUARD_CSS = COMPRESS_STAGE_3;
