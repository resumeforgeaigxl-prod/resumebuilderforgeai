/** Template 3: Modern Minimal — Arial sans, thin ruled dividers, right-aligned dates */
import { ResumeData } from '@/types/resume';
import { esc, enforceOnePage, buildLocationLine, buildContactLine, buildSkillRows, buildCertSection, cleanBullet } from './utils';

export function generateModernHtml(rawResume: ResumeData): string {
  const r = enforceOnePage(rawResume);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
@page{size:A4;margin:14mm 20mm 12mm 20mm;}
body{font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;line-height:1.28;color:#000;background:#fff;}
a{color:#000;text-decoration:none;}
.name-hd{font-size:20pt;font-weight:700;text-align:center;letter-spacing:-.3px;margin-bottom:3px;}
.contact{text-align:center;font-size:8.8pt;color:#222;margin-bottom:8px;}
.section{margin-bottom:9px;}
.sec-title{font-size:8.8pt;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;margin-bottom:2px;}
hr{border:none;border-top:.7px solid #555;margin-bottom:5px;}
.entry{margin-bottom:5px;}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:8px;}
.etitle{font-weight:700;font-size:10.5pt;}
.edate{font-size:8.5pt;white-space:nowrap;flex-shrink:0;}
.esub{font-size:8.8pt;color:#333;margin:1px 0 2px;}
ul{margin-left:14px;margin-top:2px;}
ul li{margin-bottom:2px;font-size:10pt;}
.sk-row{font-size:9.4pt;margin-bottom:2px;}.sk-b{font-weight:700;}
.cert-item{font-size:9.4pt;margin-bottom:2px;}
.plink{font-size:8.2pt;color:#333;margin:1px 0;}
.summary{font-size:10pt;line-height:1.3;}
</style></head><body>
<div class="name-hd">${esc(r.name)}</div>
<div class="contact">
    ${buildLocationLine(r) ? `${buildLocationLine(r)}<br>` : ''}
    ${buildContactLine(r, ' &middot; ')}
</div>
${r.summary ? `<div class="section"><div class="sec-title">Profile</div><hr>${'<p class="summary">' + esc(r.summary) + '</p>'}</div>` : ''}
${buildSkillRows(r, 'sk-b', '') ? `<div class="section"><div class="sec-title">Technical Skills</div><hr>${buildSkillRows(r, 'sk-b', '')}</div>` : ''}
${r.experience.length ? `<div class="section"><div class="sec-title">Experience</div><hr>${r.experience.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.role)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.company)}</div><ul>${e.points.filter(Boolean).map(p => `<li>${esc(cleanBullet(p))}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${r.projects.length ? `<div class="section"><div class="sec-title">Projects</div><hr>${r.projects.map(p => `<div class="entry"><div class="erow"><span class="etitle">${esc(p.title)}</span><span class="edate">${p.tech.slice(0, 4).map(esc).join(' · ')}</span></div>${p.liveLink || p.githubLink ? `<div class="plink">${[p.liveLink && esc(p.liveLink), p.githubLink && esc(p.githubLink)].filter(Boolean).join(' | ')}</div>` : ''}<ul>${p.description.filter(Boolean).map(d => `<li>${esc(cleanBullet(d))}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${buildCertSection(r) ? `<div class="section"><div class="sec-title">Certifications</div><hr>${buildCertSection(r)}</div>` : ''}
${r.education.length ? `<div class="section"><div class="sec-title">Education</div><hr>${r.education.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.degree)}${e.cgpa ? ` — CGPA: ${esc(e.cgpa)}` : ''}</div></div>`).join('')}</div>` : ''}
</body></html>`;
}
