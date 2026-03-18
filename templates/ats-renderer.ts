/**
 * ATS Renderer — single reusable HTML generator driven by a TemplateConfig.
 * All 50+ new templates use this instead of individual .ts files.
 */
import { ResumeData } from '@/types/resume';
import {
    esc,
    enforceOnePage,
    buildLocationLine,
    buildContactLine,
    buildSkillRows,
    buildCertSection,
    cleanBullet,
} from './utils';

// ─── Config Interface ──────────────────────────────────────────────────────────

export type TemplateFont = 'Inter' | 'Roboto' | 'Arial' | 'Times';
export type TemplateSpacing = 'compact' | 'normal';
export type TemplateHeaderAlign = 'left' | 'center';
export type TemplateDivider = 'none' | 'line' | 'dashed';
export type TemplateSection =
    | 'summary'
    | 'skills'
    | 'experience'
    | 'projects'
    | 'certifications'
    | 'education';

export type TemplateTag =
    | 'Top ATS'
    | 'Tech Roles'
    | 'Compact'
    | 'Academic'
    | 'ATS Safe';

export interface TemplateConfig {
    id: string;
    name: string;
    desc: string;
    badge: string;
    tag: TemplateTag;
    font: TemplateFont;
    spacing: TemplateSpacing;
    headerAlign: TemplateHeaderAlign;
    divider: TemplateDivider;
    sectionOrder: TemplateSection[];
}

// ─── Font Stacks ──────────────────────────────────────────────────────────────

const FONT_STACK: Record<TemplateFont, string> = {
    Inter: '"Inter",Arial,sans-serif',
    Roboto: '"Roboto",Arial,sans-serif',
    Arial: 'Arial,Helvetica,sans-serif',
    Times: '"Times New Roman",Times,serif',
};

// ─── Spacing Tokens ───────────────────────────────────────────────────────────

interface SpacingTokens {
    pageMargin: string;
    bodySize: string;
    bodyLine: string;
    namePt: string;
    contactPt: string;
    sectionMb: string;
    entryMb: string;
    secTitlePt: string;
    bulletPt: string;
    skPt: string;
    summaryPt: string;
}

const SPACING: Record<TemplateSpacing, SpacingTokens> = {
    compact: {
        pageMargin: '11mm 16mm 10mm 16mm',
        bodySize: '10pt',
        bodyLine: '1.22',
        namePt: '17pt',
        contactPt: '8pt',
        sectionMb: '7px',
        entryMb: '4px',
        secTitlePt: '9pt',
        bulletPt: '9.5pt',
        skPt: '8.8pt',
        summaryPt: '9.5pt',
    },
    normal: {
        pageMargin: '14mm 20mm 12mm 20mm',
        bodySize: '10.5pt',
        bodyLine: '1.28',
        namePt: '20pt',
        contactPt: '8.8pt',
        sectionMb: '9px',
        entryMb: '5px',
        secTitlePt: '9.2pt',
        bulletPt: '10pt',
        skPt: '9.4pt',
        summaryPt: '10pt',
    },
};

// ─── Divider Builders ─────────────────────────────────────────────────────────

function dividerCss(divider: TemplateDivider): string {
    if (divider === 'line') return 'border-top:.7px solid #555;';
    if (divider === 'dashed') return 'border-top:1px dashed #888;';
    return 'border:none;'; // 'none'
}

function dividerEl(divider: TemplateDivider): string {
    if (divider === 'none') return '';
    return '<hr>';
}

// ─── Section Renderers ────────────────────────────────────────────────────────

function renderSummary(r: ReturnType<typeof enforceOnePage>, cfg: TemplateConfig): string {
    if (!r.summary) return '';
    const d = dividerEl(cfg.divider);
    return `<div class="section"><div class="sec-title">Professional Summary</div>${d}<p class="summary">${esc(r.summary)}</p></div>`;
}

function renderSkills(r: ReturnType<typeof enforceOnePage>, cfg: TemplateConfig): string {
    const rows = buildSkillRows(r, 'sk-b', '');
    if (!rows) return '';
    const d = dividerEl(cfg.divider);
    return `<div class="section"><div class="sec-title">Technical Skills</div>${d}${rows}</div>`;
}

function renderExperience(r: ReturnType<typeof enforceOnePage>, cfg: TemplateConfig): string {
    if (!r.experience.length) return '';
    const d = dividerEl(cfg.divider);
    const entries = r.experience.map(e => `
<div class="entry">
  <div class="erow"><span class="etitle">${esc(e.role)}</span><span class="edate">${esc(e.duration)}</span></div>
  <div class="esub">${esc(e.company)}</div>
  <ul>${e.points.filter(Boolean).map(p => `<li>${esc(cleanBullet(p))}</li>`).join('')}</ul>
</div>`).join('');
    return `<div class="section"><div class="sec-title">Work Experience</div>${d}${entries}</div>`;
}

function renderProjects(r: ReturnType<typeof enforceOnePage>, cfg: TemplateConfig): string {
    if (!r.projects.length) return '';
    const d = dividerEl(cfg.divider);
    const entries = r.projects.map(p => `
<div class="entry">
  <div class="erow"><span class="etitle">${esc(p.title)}</span><span class="edate">${p.tech.slice(0, 4).map(esc).join(' \u00b7 ')}</span></div>
  ${(p.liveLink || p.githubLink) ? `<div class="plink">${[p.liveLink && esc(p.liveLink), p.githubLink && esc(p.githubLink)].filter(Boolean).join(' | ')}</div>` : ''}
  <ul>${p.description.filter(Boolean).map(d2 => `<li>${esc(cleanBullet(d2))}</li>`).join('')}</ul>
</div>`).join('');
    return `<div class="section"><div class="sec-title">Projects</div>${d}${entries}</div>`;
}

function renderCertifications(r: ReturnType<typeof enforceOnePage>, cfg: TemplateConfig): string {
    const rows = buildCertSection(r);
    if (!rows) return '';
    const d = dividerEl(cfg.divider);
    return `<div class="section"><div class="sec-title">Certifications</div>${d}${rows}</div>`;
}

function renderEducation(r: ReturnType<typeof enforceOnePage>, cfg: TemplateConfig): string {
    if (!r.education.length) return '';
    const d = dividerEl(cfg.divider);
    const entries = r.education.map(e => `
<div class="entry">
  <div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div>
  <div class="esub">${esc(e.degree)}${e.cgpa ? ` \u2014 CGPA: ${esc(e.cgpa)}` : ''}</div>
</div>`).join('');
    return `<div class="section"><div class="sec-title">Education</div>${d}${entries}</div>`;
}

const SECTION_RENDERERS: Record<
    TemplateSection,
    (r: ReturnType<typeof enforceOnePage>, cfg: TemplateConfig) => string
> = {
    summary: renderSummary,
    skills: renderSkills,
    experience: renderExperience,
    projects: renderProjects,
    certifications: renderCertifications,
    education: renderEducation,
};

// ─── Main Renderer ────────────────────────────────────────────────────────────

export function generateFromConfig(rawResume: ResumeData, cfg: TemplateConfig): string {
    const r = enforceOnePage(rawResume);
    const sp = SPACING[cfg.spacing];
    const fontStack = FONT_STACK[cfg.font];
    const align = cfg.headerAlign;

    // Google Fonts import (only sans-serif; Times is system font)
    let fontImport = '';
    if (cfg.font === 'Inter') {
        fontImport = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">`;
    } else if (cfg.font === 'Roboto') {
        fontImport = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">`;
    }

    const hrCss = dividerCss(cfg.divider);

    const css = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
@page{size:A4;margin:${sp.pageMargin};}
body{font-family:${fontStack};font-size:${sp.bodySize};line-height:${sp.bodyLine};color:#000;background:#fff;}
a{color:#000;text-decoration:none;}
.name-hd{font-size:${sp.namePt};font-weight:700;text-align:${align};letter-spacing:-.2px;margin-bottom:3px;}
.contact{text-align:${align};font-size:${sp.contactPt};color:#222;margin-bottom:8px;}
.section{margin-bottom:${sp.sectionMb};}
.sec-title{font-size:${sp.secTitlePt};font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:2px;}
hr{border:none;${hrCss}margin-bottom:5px;}
.entry{margin-bottom:${sp.entryMb};}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:8px;}
.etitle{font-weight:700;font-size:${sp.bodySize};}
.edate{font-size:8.2pt;white-space:nowrap;flex-shrink:0;}
.esub{font-size:8.8pt;color:#333;margin:1px 0 2px;}
ul{margin-left:14px;margin-top:2px;}
ul li{margin-bottom:2px;font-size:${sp.bulletPt};}
.sk-row{font-size:${sp.skPt};margin-bottom:2px;}.sk-b{font-weight:700;}
.cert-item{font-size:${sp.skPt};margin-bottom:2px;}
.plink{font-size:7.8pt;color:#333;margin:1px 0;}
.summary{font-size:${sp.summaryPt};line-height:1.32;}
`.trim();

    const contactSep = cfg.headerAlign === 'left' ? ' | ' : ' &middot; ';
    const locationLine = buildLocationLine(r);
    const contactLine = buildContactLine(r, contactSep);

    const header = `
<div class="name-hd">${esc(r.name)}</div>
<div class="contact">
  ${locationLine ? `${locationLine}<br>` : ''}
  ${contactLine}
</div>`.trim();

    const sections = cfg.sectionOrder
        .map(key => SECTION_RENDERERS[key](r, cfg))
        .join('\n');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">${fontImport}
<style>${css}</style></head><body>
${header}
${sections}
</body></html>`;
}
