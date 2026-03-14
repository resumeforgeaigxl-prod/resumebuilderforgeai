/** Template 8: Ultra ATS Light — Courier/monospace structure, maximum plain-text ATS parsing */
import { ResumeData } from '@/types/resume';
import { esc, enforceOnePage, buildLocationLine, buildContactLine, buildSkillRows, buildCertSection } from './utils';

export function generateAtsLightHtml(rawResume: ResumeData): string {
    const r = enforceOnePage(rawResume);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
@page{size:A4;margin:15mm 18mm 13mm 18mm;}
body{font-family:"Courier New",Courier,monospace;font-size:9.8pt;line-height:1.24;color:#000;background:#fff;}
a{color:#000;text-decoration:none;}
.name-hd{font-size:15pt;font-weight:700;text-align:left;margin-bottom:2px;}
.contact{text-align:left;font-size:8.5pt;margin-bottom:9px;border-bottom:1px dotted #000;padding-bottom:5px;}
.section{margin-bottom:8px;}
.sec-title{font-size:9.8pt;font-weight:700;text-transform:uppercase;margin-bottom:3px;}
.sec-rule{border:none;border-top:1px solid #000;margin-bottom:4px;}
.entry{margin-bottom:5px;}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:6px;}
.etitle{font-weight:700;font-size:9.8pt;}
.edate{font-size:8.5pt;white-space:nowrap;flex-shrink:0;}
.esub{font-size:8.8pt;color:#333;margin:1px 0 2px;}
ul{margin-left:14px;margin-top:1px;}
ul li{margin-bottom:1px;font-size:9.5pt;}
.sk-row{font-size:9.2pt;margin-bottom:2px;}.sk-b{font-weight:700;}
.cert-item{font-size:9.2pt;margin-bottom:2px;}
.plink{font-size:8pt;color:#333;margin:1px 0;}
.summary{font-size:9.5pt;line-height:1.28;}
</style></head><body>
<div class="name-hd">${esc(r.name)}</div>
<div class="contact">
    ${buildLocationLine(r) ? `${buildLocationLine(r)}<br>` : ''}
    ${buildContactLine(r, ' | ')}
</div>
${r.summary ? `<div class="section"><div class="sec-title">SUMMARY</div><hr class="sec-rule"><p class="summary">${esc(r.summary)}</p></div>` : ''}
${buildSkillRows(r, 'sk-b', '') ? `<div class="section"><div class="sec-title">TECHNICAL SKILLS</div><hr class="sec-rule">${buildSkillRows(r, 'sk-b', '')}</div>` : ''}
${r.experience.length ? `<div class="section"><div class="sec-title">EXPERIENCE</div><hr class="sec-rule">${r.experience.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.role)} @ ${esc(e.company)}</span><span class="edate">${esc(e.duration)}</span></div><ul>${e.points.filter(Boolean).map(p => `<li>> ${esc(p)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${r.projects.length ? `<div class="section"><div class="sec-title">PROJECTS</div><hr class="sec-rule">${r.projects.map(p => `<div class="entry"><div class="erow"><span class="etitle">${esc(p.title)} [${p.tech.slice(0, 4).map(esc).join(', ')}]</span><span class="edate"></span></div>${p.liveLink || p.githubLink ? `<div class="plink">${[p.liveLink && esc(p.liveLink), p.githubLink && esc(p.githubLink)].filter(Boolean).join(' | ')}</div>` : ''}<ul>${p.description.filter(Boolean).map(d => `<li>> ${esc(d)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${buildCertSection(r) ? `<div class="section"><div class="sec-title">CERTIFICATIONS</div><hr class="sec-rule">${buildCertSection(r)}</div>` : ''}
${r.education.length ? `<div class="section"><div class="sec-title">EDUCATION</div><hr class="sec-rule">${r.education.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.degree)}${e.cgpa ? ` | CGPA: ${esc(e.cgpa)}` : ''}</div></div>`).join('')}</div>` : ''}
</body></html>`;
}
