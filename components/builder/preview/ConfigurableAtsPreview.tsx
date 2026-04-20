import React from 'react';
import { ResumeData } from '@/types/resume';
import { TemplateConfig } from '@/templates/ats-renderer';
import { cleanBullet } from '@/templates/utils';

interface Props {
    resumeData: ResumeData;
    config: TemplateConfig;
    isWatermarked?: boolean;
}

const FONT_STACK: Record<string, string> = {
    Inter: '"Inter", Arial, sans-serif',
    Roboto: '"Roboto", Arial, sans-serif',
    Arial: 'Arial, Helvetica, sans-serif',
    Times: '"Times New Roman", Times, serif',
};

const SPACING = {
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

export const ConfigurableAtsPreview: React.FC<Props> = ({ resumeData: r, config: cfg, isWatermarked }) => {
    const sp = SPACING[cfg.spacing as keyof typeof SPACING];
    const fontStack = FONT_STACK[cfg.font] || FONT_STACK.Arial;
    const align = cfg.headerAlign;

    const dividerStyle: React.CSSProperties = cfg.divider === 'line' 
        ? { borderTop: '0.7px solid #555' } 
        : cfg.divider === 'dashed' 
        ? { borderTop: '1px dashed #888' } 
        : { border: 'none' };

    const renderHeader = () => {
        const contactSep = cfg.headerAlign === 'left' ? ' | ' : ' \u00b7 ';
        const locationParts = [r.location, r.country].filter(Boolean);
        const locationLine = locationParts.join(', ');
        
        const contactParts = [
            r.email,
            r.phone,
            r.linkedin && <a key="li" href={r.linkedin} className="hover:underline">LinkedIn</a>,
            r.github && <a key="gh" href={r.github} className="hover:underline">GitHub</a>,
        ].filter(Boolean);

        const contactLine = contactParts.reduce((prev: React.ReactNode[], curr, i) => {
            if (i > 0) prev.push(<span key={`s${i}`} className="mx-1">{contactSep}</span>);
            prev.push(curr as React.ReactNode);
            return prev;
        }, []);

        return (
            <div className={`text-${align} mb-2`} style={{ textAlign: align }}>
                <div style={{ fontSize: sp.namePt, fontWeight: 700, letterSpacing: '-0.2px', marginBottom: '3px' }}>{r.name}</div>
                <div style={{ fontSize: sp.contactPt, color: '#222', marginBottom: '8px' }}>
                    {locationLine && <div className="mb-0.5">{locationLine}</div>}
                    <div>{contactLine}</div>
                </div>
            </div>
        );
    };

    const renderSections = () => {
        return cfg.sectionOrder.map((sectionKey) => {
            switch (sectionKey) {
                case 'summary':
                    if (!r.summary) return null;
                    return (
                        <div key="summary" style={{ marginBottom: sp.sectionMb }}>
                            <div style={{ fontSize: sp.secTitlePt, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>Professional Summary</div>
                            {cfg.divider !== 'none' && <div style={{ ...dividerStyle, marginBottom: '5px' }} />}
                            <p style={{ fontSize: sp.summaryPt, lineHeight: 1.32 }}>{r.summary}</p>
                        </div>
                    );
                case 'skills':
                    const s = r.skills;
                    const allSkills = s ? [...s.languages, ...s.frameworks, ...s.tools, ...s.other] : [];
                    if (allSkills.length === 0 && !r.skillCategories?.length) return null;
                    return (
                        <div key="skills" style={{ marginBottom: sp.sectionMb }}>
                            <div style={{ fontSize: sp.secTitlePt, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>Technical Skills</div>
                            {cfg.divider !== 'none' && <div style={{ ...dividerStyle, marginBottom: '5px' }} />}
                            <div style={{ fontSize: sp.skPt }}>
                                {r.skillCategories?.map((cat, i) => (
                                    <div key={i} className="mb-0.5"><span className="font-bold">{cat.category}:</span> {cat.skills.join(', ')}</div>
                                )) || (
                                    <div>{allSkills.join(', ')}</div>
                                )}
                            </div>
                        </div>
                    );
                case 'experience':
                    if (!r.experience?.length) return null;
                    return (
                        <div key="experience" style={{ marginBottom: sp.sectionMb }}>
                            <div style={{ fontSize: sp.secTitlePt, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>Work Experience</div>
                            {cfg.divider !== 'none' && <div style={{ ...dividerStyle, marginBottom: '5px' }} />}
                            {r.experience.map((e, i) => (
                                <div key={i} style={{ marginBottom: sp.entryMb }}>
                                    <div className="flex justify-between items-baseline gap-2">
                                        <span style={{ fontWeight: 700, fontSize: sp.bodySize }}>{e.role}</span>
                                        <span style={{ fontSize: '8.2pt' }}>{e.duration}</span>
                                    </div>
                                    <div style={{ fontSize: '8.8pt', color: '#333', marginBottom: '2px' }}>{e.company}</div>
                                    <ul className="ml-[14px] mt-[2px] list-disc">
                                        {e.points.filter(Boolean).map((p, j) => (
                                            <li key={j} style={{ fontSize: sp.bulletPt, marginBottom: '2px' }}>{cleanBullet(p)}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    );
                case 'projects':
                    if (!r.projects?.length) return null;
                    return (
                        <div key="projects" style={{ marginBottom: sp.sectionMb }}>
                            <div style={{ fontSize: sp.secTitlePt, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>Projects</div>
                            {cfg.divider !== 'none' && <div style={{ ...dividerStyle, marginBottom: '5px' }} />}
                            {r.projects.map((p, i) => (
                                <div key={i} style={{ marginBottom: sp.entryMb }}>
                                    <div className="flex justify-between items-baseline gap-2">
                                        <span style={{ fontWeight: 700, fontSize: sp.bodySize }}>{p.name || p.title}</span>
                                        <span style={{ fontSize: '8.2pt' }}>{p.tech.slice(0, 4).join(' \u00b7 ')}</span>
                                    </div>
                                    {(p.liveLink || p.githubLink) && (
                                        <div style={{ fontSize: '7.8pt', color: '#333', margin: '1px 0' }}>
                                            {[p.liveLink, p.githubLink].filter(Boolean).join(' | ')}
                                        </div>
                                    )}
                                    <ul className="ml-[14px] mt-[2px] list-disc">
                                        {p.description.filter(Boolean).map((d, j) => (
                                            <li key={j} style={{ fontSize: sp.bulletPt, marginBottom: '2px' }}>{cleanBullet(d)}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    );
                case 'certifications':
                    if (!r.certifications?.length) return null;
                    return (
                        <div key="certifications" style={{ marginBottom: sp.sectionMb }}>
                            <div style={{ fontSize: sp.secTitlePt, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>Certifications</div>
                            {cfg.divider !== 'none' && <div style={{ ...dividerStyle, marginBottom: '5px' }} />}
                            <div style={{ fontSize: sp.skPt }}>
                                {r.certifications.map((c, i) => (
                                    <div key={i} className="mb-0.5"><span className="font-bold">{c.title}</span> \u2014 {c.issuer} ({c.year})</div>
                                ))}
                            </div>
                        </div>
                    );
                case 'education':
                    if (!r.education?.length) return null;
                    return (
                        <div key="education" style={{ marginBottom: sp.sectionMb }}>
                            <div style={{ fontSize: sp.secTitlePt, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>Education</div>
                            {cfg.divider !== 'none' && <div style={{ ...dividerStyle, marginBottom: '5px' }} />}
                            {r.education.map((e, i) => (
                                <div key={i} style={{ marginBottom: sp.entryMb }}>
                                    <div className="flex justify-between items-baseline gap-2">
                                        <span style={{ fontWeight: 700, fontSize: sp.bodySize }}>{e.institution || e.school}</span>
                                        <span style={{ fontSize: '8.2pt' }}>{e.year || e.duration}</span>
                                    </div>
                                    <div style={{ fontSize: '8.8pt', color: '#333' }}>{e.degree}{(e.score || e.cgpa) ? ` \u2014 Score: ${e.score || e.cgpa}` : ''}</div>
                                </div>
                            ))}
                        </div>
                    );
                default:
                    return null;
            }
        });
    };

    return (
        <div className="bg-white text-black shadow-2xl relative mx-auto" 
            style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                padding: sp.pageMargin,
                fontFamily: fontStack,
                fontSize: sp.bodySize,
                lineHeight: sp.bodyLine,
            }}>
            {isWatermarked && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-[0.05]">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className="absolute whitespace-nowrap font-bold text-[13px] rotate-[-35deg]"
                            style={{ 
                                top: `${Math.floor(i / 5) * 160 + (i % 5) * 50}px`,
                                left: `${(i % 5) * 320 - 80}px`,
                            }}>
                            Generated by ResumeForgeAI – Upgrade to remove watermark
                        </div>
                    ))}
                </div>
            )}
            {renderHeader()}
            {renderSections()}
        </div>
    );
};
