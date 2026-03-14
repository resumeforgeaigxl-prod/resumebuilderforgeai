/** Template 2: Stanford Clean — Georgia serif, LEFT-aligned name, subtle underline headers */
import { ResumeData } from '@/types/resume';
import { esc, enforceOnePage, buildLocationLine, buildContactLine, buildSkillRows, buildCertSection } from './utils';

export function generateStanfordHtml(rawResume: ResumeData): string {
    const r = enforceOnePage(rawResume);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
@page{size:A4;margin:16mm 18mm 14mm 18mm;}
body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.26;color:#000;background:#fff;}
a{color:#000;text-decoration:none;}
.name-hd{font-size:20pt;font-weight:700;text-align:left;margin-bottom:2px;}
.contact{text-align:left;font-size:9pt;margin-bottom:10px;border-bottom:1px solid #000;padding-bottom:6px;}
.section{margin-bottom:8px;}
.sec-title{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;color:#000;}
.sec-rule{border:none;border-top:1px solid #777;margin-bottom:5px;}
.entry{margin-bottom:5px;}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:6px;}
.etitle{font-weight:700;font-size:11pt;}
.edate{font-size:9pt;white-space:nowrap;flex-shrink:0;font-style:italic;}
.esub{font-style:italic;font-size:9.5pt;color:#333;margin:1px 0 2px;}
ul{margin-left:16px;margin-top:2px;}
ul li{margin-bottom:2px;font-size:10.5pt;}
.sk-row{font-size:9.8pt;margin-bottom:2px;}.sk-b{font-weight:700;}
.cert-item{font-size:9.8pt;margin-bottom:2px;}
.plink{font-size:8.5pt;color:#333;font-style:italic;margin:1px 0;}
.summary{font-size:10.5pt;line-height:1.3;}
</style></head><body>
<div class="name-hd">${esc(r.name)}</div>
<div class="contact">
    ${buildLocationLine(r) ? `${buildLocationLine(r)}<br>` : ''}
    ${buildContactLine(r, ' &nbsp;|&nbsp; ')}
</div>
${r.summary ? `<div class="section"><div class="sec-title">Professional Summary</div><hr class="sec-rule"><p class="summary">${esc(r.summary)}</p></div>` : ''}
${buildSkillRows(r, 'sk-b', '') ? `<div class="section"><div class="sec-title">Technical Skills</div><hr class="sec-rule">${buildSkillRows(r, 'sk-b', '')}</div>` : ''}
${r.experience.length ? `<div class="section"><div class="sec-title">Work Experience</div><hr class="sec-rule">${r.experience.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.role)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.company)}</div><ul>${e.points.filter(Boolean).map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${r.projects.length ? `<div class="section"><div class="sec-title">Projects</div><hr class="sec-rule">${r.projects.map(p => `<div class="entry"><div class="erow"><span class="etitle">${esc(p.title)}</span><span class="edate">${p.tech.slice(0, 4).map(esc).join(', ')}</span></div>${p.liveLink || p.githubLink ? `<div class="plink">${[p.liveLink && esc(p.liveLink), p.githubLink && esc(p.githubLink)].filter(Boolean).join(' | ')}</div>` : ''}<ul>${p.description.filter(Boolean).map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${buildCertSection(r) ? `<div class="section"><div class="sec-title">Certifications</div><hr class="sec-rule">${buildCertSection(r)}</div>` : ''}
${r.education.length ? `<div class="section"><div class="sec-title">Education</div><hr class="sec-rule">${r.education.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.degree)}${e.cgpa ? ` &mdash; CGPA: ${esc(e.cgpa)}` : ''}</div></div>`).join('')}</div>` : ''}
</body></html>`;
}
