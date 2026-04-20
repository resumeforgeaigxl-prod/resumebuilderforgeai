/** Template 8: Ultra ATS Light — Courier/monospace structure, maximum plain-text ATS parsing */
import { ResumeData } from '@/types/resume';
import { esc, enforceOnePage, buildLocationLine, buildContactLine, buildSkillRows, buildCertSection, cleanBullet, GLOBAL_PRINT_CSS } from './utils';

export function generateAtsLightHtml(rawResume: ResumeData): string {
    const r = enforceOnePage(rawResume);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
${GLOBAL_PRINT_CSS}
body{font-family:"Inter",Arial,sans-serif;font-size:10.5pt;line-height:1.2;color:#000;background:#fff;}
@page{margin:15mm 18mm 13mm 18mm;}
a{color:#000;text-decoration:none;}
.name-hd{font-size:15pt;font-weight:700;text-align:left;margin-bottom:2px;text-transform:uppercase;}
.contact{text-align:left;font-size:8.5pt;margin-bottom:9px;border-bottom:1px dotted #000;padding-bottom:5px;}
.section{margin-bottom:8px;}
.sec-title{font-size:9.8pt;font-weight:700;text-transform:uppercase;margin-bottom:3px;border-bottom:1px solid #000;}
.sec-rule{display:none;}
.entry{margin-bottom:5px;}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:6px;}
.etitle{font-weight:700;font-size:9.8pt;}
.edate{font-size:8.5pt;white-space:nowrap;flex-shrink:0;}
.esub{font-size:8.8pt;color:#333;margin:1px 0 2px;}
ul{margin-left:14px;margin-top:1px;}
ul li{margin-bottom:1px;font-size:9.5pt;list-style-type:none;}
.sk-row{font-size:9.2pt;margin-bottom:2px;}.sk-b{font-weight:700;}
.cert-item{font-size:9.2pt;margin-bottom:2px;}
.plink{font-size:8pt;color:#333;margin:1px 0;}
.summary{font-size:9.5pt;line-height:1.28;}
</style>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
</head><body>
<header>
<h1 class="name-hd">${esc(r.name)}</h1>
<div class="contact">
    ${buildLocationLine(r) ? `${buildLocationLine(r)}<br>` : ''}
    ${buildContactLine(r, ' | ')}
</div>
</header>
${r.summary ? `<section class="section"><h2 class="sec-title">SUMMARY</h2><hr class="sec-rule"><p class="summary">${esc(r.summary)}</p></section>` : ''}
${buildSkillRows(r, 'sk-b', '') ? `<section class="section"><h2 class="sec-title">TECHNICAL SKILLS</h2><hr class="sec-rule">${buildSkillRows(r, 'sk-b', '')}</section>` : ''}
${r.experience.length ? `<section class="section"><h2 class="sec-title">EXPERIENCE</h2><hr class="sec-rule">${r.experience.map(e => `<article class="entry"><div class="erow"><span class="etitle">${esc(e.role)} @ ${esc(e.company)}</span><span class="edate">${esc(e.duration)}</span></div><ul>${e.points.filter(Boolean).map(p => `<li>&gt; ${esc(cleanBullet(p))}</li>`).join('')}</ul></article>`).join('')}</section>` : ''}
${r.projects.length ? `<section class="section"><h2 class="sec-title">PROJECTS</h2><hr class="sec-rule">${r.projects.map(p => `<article class="entry"><div class="erow"><span class="etitle">${esc(p.title)} [${p.tech.slice(0, 4).map(esc).join(', ')}]</span><span class="edate"></span></div>${p.liveLink || p.githubLink ? `<div class="plink">${[p.liveLink && esc(p.liveLink), p.githubLink && esc(p.githubLink)].filter(Boolean).join(' | ')}</div>` : ''}<ul>${p.description.filter(Boolean).map(d => `<li>&gt; ${esc(cleanBullet(d))}</li>`).join('')}</ul></article>`).join('')}</section>` : ''}
${buildCertSection(r) ? `<section class="section"><h2 class="sec-title">CERTIFICATIONS</h2><hr class="sec-rule">${buildCertSection(r)}</section>` : ''}
${r.education.length ? `<section class="section"><h2 class="sec-title">EDUCATION</h2><hr class="sec-rule">${r.education.map(e => `<article class="entry"><div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.degree)}${e.cgpa ? ` | CGPA: ${esc(e.cgpa)}` : ''}</div></article>`).join('')}</section>` : ''}
</body></html>`;
}
