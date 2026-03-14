/** Template 5: Executive Professional — Georgia serif, BOLD heavy section headers, authoritative weight */
import { ResumeData } from '@/types/resume';
import { esc, enforceOnePage, buildLocationLine, buildContactLine, buildSkillRows, buildCertSection } from './utils';

export function generateExecutiveHtml(rawResume: ResumeData): string {
    const r = enforceOnePage(rawResume);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
@page{size:A4;margin:15mm 18mm 14mm 18mm;}
body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.27;color:#000;background:#fff;}
a{color:#000;text-decoration:none;}
.header-block{border-bottom:2.5px solid #000;padding-bottom:7px;margin-bottom:10px;}
.name-hd{font-size:21pt;font-weight:700;text-align:left;letter-spacing:.2px;margin-bottom:3px;}
.contact{text-align:left;font-size:9pt;}
.section{margin-bottom:9px;}
.sec-title{font-size:11.5pt;font-weight:900;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;padding-left:0;}
.entry{margin-bottom:5px;}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:8px;}
.etitle{font-weight:700;font-size:11pt;}
.edate{font-size:9pt;white-space:nowrap;flex-shrink:0;font-style:italic;}
.esub{font-style:italic;font-size:9.5pt;color:#222;margin:1px 0 2px;}
ul{margin-left:16px;margin-top:2px;}
ul li{margin-bottom:2px;font-size:10.5pt;}
.sk-row{font-size:9.8pt;margin-bottom:2px;}.sk-b{font-weight:700;}
.cert-item{font-size:9.8pt;margin-bottom:2px;}
.plink{font-size:8.5pt;color:#333;font-style:italic;margin:1px 0;}
.summary{font-size:10.5pt;line-height:1.32;}
</style></head><body>
<div class="header-block">
  <div class="name-hd">${esc(r.name)}</div>
  <div class="contact">
      ${buildLocationLine(r) ? `${buildLocationLine(r)}<br>` : ''}
      ${buildContactLine(r, ' &nbsp;|&nbsp; ')}
  </div>
</div>
${r.summary ? `<div class="section"><div class="sec-title">&#9632; Executive Summary</div><p class="summary">${esc(r.summary)}</p></div>` : ''}
${buildSkillRows(r, 'sk-b', '') ? `<div class="section"><div class="sec-title">&#9632; Technical Skills</div>${buildSkillRows(r, 'sk-b', '')}</div>` : ''}
${r.experience.length ? `<div class="section"><div class="sec-title">&#9632; Professional Experience</div>${r.experience.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.role)}, ${esc(e.company)}</span><span class="edate">${esc(e.duration)}</span></div><ul>${e.points.filter(Boolean).map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${r.projects.length ? `<div class="section"><div class="sec-title">&#9632; Projects</div>${r.projects.map(p => `<div class="entry"><div class="erow"><span class="etitle">${esc(p.title)}</span><span class="edate">${p.tech.slice(0, 4).map(esc).join(', ')}</span></div>${p.liveLink || p.githubLink ? `<div class="plink">${[p.liveLink && esc(p.liveLink), p.githubLink && esc(p.githubLink)].filter(Boolean).join(' | ')}</div>` : ''}<ul>${p.description.filter(Boolean).map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${buildCertSection(r) ? `<div class="section"><div class="sec-title">&#9632; Certifications</div>${buildCertSection(r)}</div>` : ''}
${r.education.length ? `<div class="section"><div class="sec-title">&#9632; Education</div>${r.education.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.degree)}${e.cgpa ? ` &mdash; CGPA: ${esc(e.cgpa)}` : ''}</div></div>`).join('')}</div>` : ''}
</body></html>`;
}
