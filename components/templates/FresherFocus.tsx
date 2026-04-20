import React from 'react';
import { TemplateProps } from './Classic';
import { Section, BulletList, EntryHeader } from './base';

export const FresherFocus: React.FC<TemplateProps> = ({ data, theme }) => {
  const fontClass = theme.fontFamily === 'Inter' ? 'font-inter' : 'font-sans';
  
  return (
    <div className={`bg-white w-[210mm] min-h-[297mm] p-10 mx-auto ${fontClass} text-black`}>
       <header className="mb-6">
        <h1 className="text-[26px] font-bold text-center border-b border-black inline-block px-4 mb-2">{data.name}</h1>
        <div className="flex justify-center gap-4 text-[11px]">
          <span>{data.email}</span>
          <span>{data.phone}</span>
          <span>{data.location}</span>
        </div>
      </header>

      <div className="space-y-6">
        <Section title="Objective">
          <p className="text-[11px]">{data.summary}</p>
        </Section>

        <Section title="Education">
          {data.education.map(edu => (
            <div key={edu.id} className="mb-2">
              <EntryHeader title={edu.institution} subtitle={edu.degree} rightText={edu.year} />
              <div className="text-[10px] font-bold">Score: {edu.score}</div>
            </div>
          ))}
        </Section>

        <Section title="Technical Proficiency">
          <div className="grid grid-cols-2 gap-y-2 text-[11px]">
             <div><span className="font-bold">Languages:</span> {data.skills.languages.join(', ')}</div>
             <div><span className="font-bold">Frameworks:</span> {data.skills.frameworks.join(', ')}</div>
             <div><span className="font-bold">Tools:</span> {data.skills.tools.join(', ')}</div>
             <div><span className="font-bold">Other:</span> {data.skills.other.join(', ')}</div>
          </div>
        </Section>

        <Section title="Projects & Academic Work">
          {data.projects.map(p => (
            <div key={p.id} className="mb-4">
              <EntryHeader title={p.name} subtitle={p.tech.join(', ')} rightText={p.link} />
              <BulletList items={p.description} />
            </div>
          ))}
        </Section>

        <Section title="Internships & Experience">
           {data.experience.map(exp => (
            <div key={exp.id} className="mb-4">
              <EntryHeader title={exp.role} subtitle={exp.company} rightText={exp.duration} />
              <BulletList items={exp.points} />
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
};
