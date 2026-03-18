/** Template 6: Minimal Divider — Inter/Helvetica, NO lines, pure whitespace hierarchy, ultra-clean */
import { ResumeData } from '@/types/resume';
import { esc, enforceOnePage, buildLocationLine, buildContactLine, buildSkillRows, buildCertSection, cleanBullet } from './utils';

export function generateMinimalDividerHtml(rawResume: ResumeData): string {
    const r = enforceOnePage(rawResume);
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
@page{size:A4;margin:18mm 22mm 16mm 22mm;}
body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:10.5pt;line-height:1.30;color:#000;background:#fff;}
a{color:#000;text-decoration:none;}
.name-hd{font-size:21pt;font-weight:300;text-align:left;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;}
.contact{text-align:left;font-size:8.5pt;color:#222;letter-spacing:.3px;margin-bottom:14px;}
.section{margin-bottom:12px;}
.sec-title{font-size:7.8pt;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:#333;margin-bottom:5px;}
.entry{margin-bottom:6px;}
.erow{display:flex;justify-content:space-between;align-items:baseline;gap:8px;}
.etitle{font-weight:600;font-size:10.5pt;}
.edate{font-size:8.5pt;white-space:nowrap;flex-shrink:0;color:#555;}
.esub{font-size:9pt;color:#444;margin:1px 0 2px;}
ul{margin-left:0;margin-top:3px;list-style:none;}
ul li{margin-bottom:2px;font-size:10pt;padding-left:10px;text-indent:-10px;}
ul li::before{content:"– ";font-size:9.5pt;}
.sk-row{font-size:9.2pt;margin-bottom:2px;}.sk-b{font-weight:600;}
.cert-item{font-size:9.2pt;margin-bottom:2px;}
.plink{font-size:8pt;color:#444;margin:1px 0;}
.summary{font-size:10pt;line-height:1.35;color:#111;}
</style></head><body>
<div class="name-hd">${esc(r.name)}</div>
<div class="contact">
    ${buildLocationLine(r) ? `${buildLocationLine(r)}<br>` : ''}
    ${buildContactLine(r, ' &nbsp; &middot; &nbsp; ')}
</div>
${r.summary ? `<div class="section"><div class="sec-title">Profile</div><p class="summary">${esc(r.summary)}</p></div>` : ''}
${buildSkillRows(r, 'sk-b', '') ? `<div class="section"><div class="sec-title">Skills</div>${buildSkillRows(r, 'sk-b', '')}</div>` : ''}
${r.experience.length ? `<div class="section"><div class="sec-title">Experience</div>${r.experience.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.role)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.company)}</div><ul>${e.points.filter(Boolean).map(p => `<li>${esc(cleanBullet(p))}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${r.projects.length ? `<div class="section"><div class="sec-title">Projects</div>${r.projects.map(p => `<div class="entry"><div class="erow"><span class="etitle">${esc(p.title)}</span><span class="edate">${p.tech.slice(0, 4).map(esc).join(' · ')}</span></div>${p.liveLink || p.githubLink ? `<div class="plink">${[p.liveLink && esc(p.liveLink), p.githubLink && esc(p.githubLink)].filter(Boolean).join(' · ')}</div>` : ''}<ul>${p.description.filter(Boolean).map(d => `<li>${esc(cleanBullet(d))}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
${buildCertSection(r) ? `<div class="section"><div class="sec-title">Certifications</div>${buildCertSection(r)}</div>` : ''}
${r.education.length ? `<div class="section"><div class="sec-title">Education</div>${r.education.map(e => `<div class="entry"><div class="erow"><span class="etitle">${esc(e.school)}</span><span class="edate">${esc(e.duration)}</span></div><div class="esub">${esc(e.degree)}${e.cgpa ? ` / CGPA: ${esc(e.cgpa)}` : ''}</div></div>`).join('')}</div>` : ''}
</body></html>`;
}
