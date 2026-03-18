/** Template 1: Harvard Classic — Georgia serif, centered name, bottom-border section headers */
import { ResumeData } from '@/types/resume';
import { esc, enforceOnePage, buildLocationLine, buildContactLine, buildSkillRows, buildCertSection, cleanBullet } from './utils';

export function generateHarvardHtml(rawResume: ResumeData): string {
    const r = enforceOnePage(rawResume);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
@page{size:A4;margin:16mm 18mm 14mm 18mm;}
body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.25;color:#000;background:#fff;}
a{color:#000;text-decoration:none;}
.name-hd{font-size:22pt;font-weight:700;text-align:center;letter-spacing:.3px;margin-bottom:4px;}
.contact{text-align:center;font-size:9pt;margin-bottom:11px;}
.section{margin-bottom:9px;}
.sec-title{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;border-bottom:1.5px solid #000;padding-bottom:1px;margin-bottom:5px;}
.entry{margin-bottom:5px;}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:6px;}
.etitle{font-weight:700;font-size:11pt;}
.edate{font-size:9pt;white-space:nowrap;flex-shrink:0;}
.esub{font-style:italic;font-size:9.5pt;color:#222;margin:1px 0 2px;}
ul{margin-left:15px;margin-top:2px;}
ul li{margin-bottom:2px;font-size:10.5pt;}
.sk-row{font-size:9.8pt;margin-bottom:2px;}.sk-bold{font-weight:700;}
.cert-item{font-size:9.8pt;margin-bottom:2px;}
.plink{font-size:8.5pt;color:#333;font-style:italic;margin:1px 0;}
.summary{font-size:10.5pt;line-height:1.3;}
</style></head><body>
<div class="name-hd">${esc(r.name)}</div>
<div class="contact">
    ${buildLocationLine(r) ? `${buildLocationLine(r)}<br>` : ''}
    ${buildContactLine(r, ' &bull; ')}
</div>
${r.summary ? `<div class="section"><div class="sec-title">Summary</div><p class="summary">${esc(r.summary)}</p></div>` : ''}
${buildSkillRows(r, 'sk-bold', '') ? `<div class="section"><div class="sec-title">Technical Skills</div>${buildSkillRows(r, 'sk-bold', '')}</div>` : ''}
${r.experience.length ? `<div class="section"><div class="sec-title">Experience</div>${r.experience.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.role)}, ${esc(e.company)}</span><span class="edate">${esc(e.duration)}</span></div><ul>${e.points.filter(Boolean).map(p => `<li>${esc(cleanBullet(p))}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${r.projects.length ? `<div class="section"><div class="sec-title">Projects</div>${r.projects.map(p => `<div class="entry"><div class="erow"><span class="etitle">${esc(p.title)}</span><span class="edate">${p.tech.slice(0, 5).map(esc).join(', ')}</span></div>${p.liveLink || p.githubLink ? `<div class="plink">${[p.liveLink && `Live: ${esc(p.liveLink)}`, p.githubLink && `GitHub: ${esc(p.githubLink)}`].filter(Boolean).join(' | ')}</div>` : ''}<ul>${p.description.filter(Boolean).map(d => `<li>${esc(cleanBullet(d))}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${buildCertSection(r) ? `<div class="section"><div class="sec-title">Certifications</div>${buildCertSection(r)}</div>` : ''}
${r.education.length ? `<div class="section"><div class="sec-title">Education</div>${r.education.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.degree)}${e.cgpa ? ` &mdash; CGPA: ${esc(e.cgpa)}` : ''}</div></div>`).join('')}</div>` : ''}
</body></html>`;
}
