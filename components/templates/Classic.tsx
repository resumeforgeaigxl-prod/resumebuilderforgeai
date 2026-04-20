import React from 'react';
import { ResumeData } from '@/types/resume';
import { Section, BulletList, EntryHeader } from './base';

export interface TemplateProps {
  data: ResumeData;
  theme: {
    fontFamily: 'Arial' | 'Inter';
    spacing: 'compact' | 'normal';
    headerStyle: 'bold' | 'minimal';
  };
}

export const Classic: React.FC<TemplateProps> = ({ data, theme }) => {
  const fontClass = theme.fontFamily === 'Inter' ? 'font-inter' : 'font-sans'; // Assuming font-sans is Arial or standard sans
  const spacingClass = theme.spacing === 'compact' ? 'space-y-4' : 'space-y-6';
  
  return (
    <div 
      className={`bg-white w-[210mm] min-h-[297mm] p-10 mx-auto ${fontClass} text-black antialiased`}
      style={{ lineHeight: theme.spacing === 'compact' ? '1.4' : '1.6' }}
    >
      {/* Header */}
      <header className={`text-center mb-6`}>
        <h1 className={`${theme.headerStyle === 'bold' ? 'text-[24px] font-black' : 'text-[20px] font-bold'} uppercase tracking-tighter`}>
          {data.name}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-[11px]">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <a href={data.linkedin}>LinkedIn</a>}
          {data.github && <a href={data.github}>GitHub</a>}
        </div>
      </header>

      <div className={spacingClass}>
        {/* 2. Summary */}
        {data.summary && (
          <Section title="Professional Summary">
            <p className="text-[11px] text-justify">{data.summary}</p>
          </Section>
        )}

        {/* 3. Skills */}
        <Section title="Technical Skills">
          <div className="text-[11px] space-y-1">
            {data.skills.languages.length > 0 && (
              <div><span className="font-bold">Languages:</span> {data.skills.languages.join(', ')}</div>
            )}
            {data.skills.frameworks.length > 0 && (
              <div><span className="font-bold">Frameworks:</span> {data.skills.frameworks.join(', ')}</div>
            )}
            {data.skills.tools.length > 0 && (
              <div><span className="font-bold">Tools:</span> {data.skills.tools.join(', ')}</div>
            )}
            {data.skills.other.length > 0 && (
              <div><span className="font-bold">Other:</span> {data.skills.other.join(', ')}</div>
            )}
          </div>
        </Section>

        {/* 4. Experience */}
        {data.experience.length > 0 && (
          <Section title="Work Experience">
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <EntryHeader 
                    title={exp.role} 
                    subtitle={exp.company} 
                    rightText={exp.duration} 
                    italicSubtitle
                  />
                  <BulletList items={exp.points} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 5. Projects */}
        {data.projects.length > 0 && (
          <Section title="Projects">
            <div className="space-y-4">
              {data.projects.map((proj) => (
                <div key={proj.id}>
                  <EntryHeader 
                    title={proj.name} 
                    subtitle={proj.tech.join(' | ')} 
                    rightText={proj.link} 
                  />
                  <BulletList items={proj.description} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 6. Education */}
        {data.education.length > 0 && (
          <Section title="Education">
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <EntryHeader 
                    title={edu.institution} 
                    subtitle={`${edu.degree} ${edu.score ? `(${edu.score})` : ''}`}
                    rightText={edu.year} 
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 7. Certifications */}
        {data.certifications.length > 0 && (
          <Section title="Certifications">
            <ul className="list-disc ml-5 text-[11px] space-y-1">
              {data.certifications.map((cert) => (
                <li key={cert.id}>
                  <span className="font-bold">{cert.title}</span> — {cert.issuer} ({cert.year})
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
};
