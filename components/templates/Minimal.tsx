import React from 'react';
import { TemplateProps } from './Classic';
import { Section, BulletList } from './base';

export const Minimal: React.FC<TemplateProps> = ({ data, theme }) => {
  const fontClass = theme.fontFamily === 'Inter' ? 'font-inter' : 'font-sans';
  
  return (
    <div className={`bg-white w-[210mm] min-h-[297mm] p-12 mx-auto ${fontClass} text-black`}>
      <header className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight">{data.name}</h1>
        <div className="text-[11px] text-gray-700 space-x-2 mt-1">
          <span>{data.email}</span>|<span>{data.phone}</span>|<span>{data.location}</span>
        </div>
      </header>

      <div className="space-y-6">
        <section>
          <p className="text-[11px] leading-relaxed italic">{data.summary}</p>
        </section>

        <Section title="Expertise">
          <p className="text-[11px]">{Object.values(data.skills).flat().join(' • ')}</p>
        </Section>

        <Section title="Professional History">
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-[12px]">{exp.role} — {exp.company}</span>
                <span className="text-[10px] text-gray-600">{exp.duration}</span>
              </div>
              <BulletList items={exp.points} />
            </div>
          ))}
        </Section>

        <Section title="Academic Background">
          {data.education.map(edu => (
            <div key={edu.id} className="flex justify-between text-[11px]">
              <span>{edu.institution}, {edu.degree}</span>
              <span>{edu.year}</span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
};
