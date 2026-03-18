/** Template 7: Academic Structured — Times New Roman, indented entries, academic reference style */
import { ResumeData } from '@/types/resume';
import { esc, enforceOnePage, buildLocationLine, buildContactLine, buildSkillRows, buildCertSection, cleanBullet } from './utils';

export function generateAcademicHtml(rawResume: ResumeData): string {
    const r = enforceOnePage(rawResume);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
@page{size:A4;margin:18mm 20mm 16mm 20mm;}
body{font-family:"Times New Roman",Times,serif;font-size:11pt;line-height:1.28;color:#000;background:#fff;}
a{color:#000;text-decoration:none;}
.name-hd{font-size:18pt;font-weight:700;text-align:center;letter-spacing:.5px;margin-bottom:3px;}
.contact{text-align:center;font-size:9pt;margin-bottom:3px;}
.center-rule{border:none;border-top:1px solid #000;width:60%;margin:6px auto 10px;}
.section{margin-bottom:9px;}
.sec-title{font-size:11pt;font-weight:700;font-variant:small-caps;letter-spacing:.5px;margin-bottom:4px;border-bottom:1px solid #555;padding-bottom:1px;}
.entry{margin-left:12px;margin-bottom:6px;}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:8px;}
.etitle{font-weight:700;font-size:11pt;}
.edate{font-size:9pt;white-space:nowrap;flex-shrink:0;font-style:italic;}
.esub{font-style:italic;font-size:9.5pt;color:#222;margin:1px 0 2px;}
ul{margin-left:16px;margin-top:2px;}
ul li{margin-bottom:2px;font-size:10.5pt;}
.sk-row{font-size:9.8pt;margin-bottom:2px;margin-left:12px;}.sk-b{font-weight:700;}
.cert-item{font-size:9.8pt;margin-bottom:2px;margin-left:12px;}
.plink{font-size:8.5pt;color:#333;font-style:italic;margin:1px 0;}
.summary{font-size:10.5pt;line-height:1.33;margin-left:12px;}
</style></head><body>
<div class="name-hd">${esc(r.name)}</div>
<div class="contact">
    ${buildLocationLine(r) ? `${buildLocationLine(r)}<br>` : ''}
    ${buildContactLine(r, ' &bull; ')}
</div>
<hr class="center-rule">
${r.summary ? `<div class="section"><div class="sec-title">Research & Professional Focus</div><p class="summary">${esc(r.summary)}</p></div>` : ''}
${buildSkillRows(r, 'sk-b', '') ? `<div class="section"><div class="sec-title">Technical Competencies</div>${buildSkillRows(r, 'sk-b', '')}</div>` : ''}
${r.experience.length ? `<div class="section"><div class="sec-title">Experience</div>${r.experience.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.role)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.company)}</div><ul>${e.points.filter(Boolean).map(p => `<li>${esc(cleanBullet(p))}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${r.projects.length ? `<div class="section"><div class="sec-title">Research &amp; Projects</div>${r.projects.map(p => `<div class="entry"><div class="erow"><span class="etitle">${esc(p.title)}</span><span class="edate">${p.tech.slice(0, 4).map(esc).join(', ')}</span></div>${p.liveLink || p.githubLink ? `<div class="plink">${[p.liveLink && esc(p.liveLink), p.githubLink && esc(p.githubLink)].filter(Boolean).join(' | ')}</div>` : ''}<ul>${p.description.filter(Boolean).map(d => `<li>${esc(cleanBullet(d))}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${buildCertSection(r) ? `<div class="section"><div class="sec-title">Certifications &amp; Awards</div>${buildCertSection(r)}</div>` : ''}
${r.education.length ? `<div class="section"><div class="sec-title">Education</div>${r.education.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.degree)}${e.cgpa ? `, CGPA: ${esc(e.cgpa)}` : ''}</div></div>`).join('')}</div>` : ''}
</body></html>`;
}
