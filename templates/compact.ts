/** Template 4: Compact Engineer — Calibri, tightest spacing, maximises SDE content per page */
import { ResumeData } from '@/types/resume';
import { esc, enforceOnePage, buildContactLine, buildSkillRows, buildCertSection } from './utils';

export function generateCompactHtml(rawResume: ResumeData): string {
  const r = enforceOnePage(rawResume);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
@page{size:A4;margin:11mm 16mm 10mm 16mm;}
body{font-family:"Calibri",Arial,sans-serif;font-size:10pt;line-height:1.22;color:#000;background:#fff;}
a{color:#000;text-decoration:none;}
.name-hd{font-size:17pt;font-weight:700;text-align:center;margin-bottom:2px;}
.contact{text-align:center;font-size:8.2pt;margin-bottom:7px;}
.section{margin-bottom:7px;}
.sec-title{font-size:9.2pt;font-weight:700;text-transform:uppercase;letter-spacing:.7px;border-bottom:1px solid #000;padding-bottom:1px;margin-bottom:4px;}
.entry{margin-bottom:4px;}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:6px;}
.etitle{font-weight:700;font-size:9.8pt;}
.edate{font-size:8pt;white-space:nowrap;flex-shrink:0;}
.esub{font-size:8.5pt;color:#333;font-style:italic;margin:1px 0;}
ul{margin-left:13px;margin-top:2px;}
ul li{margin-bottom:1px;font-size:9.6pt;}
.sk-row{font-size:9pt;margin-bottom:2px;}.sk-b{font-weight:700;}
.cert-item{font-size:9pt;margin-bottom:2px;}
.plink{font-size:7.8pt;color:#333;margin:1px 0;}
.summary{font-size:9.5pt;}
</style></head><body>
<div class="name-hd">${esc(r.name)}</div>
<div class="contact">${buildContactLine(r, ' | ')}</div>
${r.summary ? `<div class="section"><div class="sec-title">Objective</div><p class="summary">${esc(r.summary)}</p></div>` : ''}
${buildSkillRows(r, 'sk-b', '') ? `<div class="section"><div class="sec-title">Technical Skills</div>${buildSkillRows(r, 'sk-b', '')}</div>` : ''}
${r.experience.length ? `<div class="section"><div class="sec-title">Work Experience</div>${r.experience.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.role)} &mdash; ${esc(e.company)}</span><span class="edate">${esc(e.duration)}</span></div><ul>${e.points.filter(Boolean).map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${r.projects.length ? `<div class="section"><div class="sec-title">Projects</div>${r.projects.map(p => `<div class="entry"><div class="erow"><span class="etitle">${esc(p.title)}</span><span class="edate">${p.tech.slice(0, 4).map(esc).join(', ')}</span></div>${p.liveLink || p.githubLink ? `<div class="plink">${[p.liveLink && esc(p.liveLink), p.githubLink && esc(p.githubLink)].filter(Boolean).join(' | ')}</div>` : ''}<ul>${p.description.filter(Boolean).map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${buildCertSection(r) ? `<div class="section"><div class="sec-title">Certifications</div>${buildCertSection(r)}</div>` : ''}
${r.education.length ? `<div class="section"><div class="sec-title">Education</div>${r.education.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.degree)}${e.cgpa ? ` | CGPA: ${esc(e.cgpa)}` : ''}</div></div>`).join('')}</div>` : ''}
</body></html>`;
}
