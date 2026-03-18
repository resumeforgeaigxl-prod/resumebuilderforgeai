/**
 * TEMPLATE_LIST — merged list of all resume templates for the UI.
 * Kept separate from types/resume.ts to avoid circular import with the
 * templates/ directory (ats-renderer imports ResumeData from types/resume).
 *
 * Import this instead of TEMPLATE_LIST from '@/types/resume' everywhere
 * you need the full 50+ template catalog.
 */
import { ATS_TEMPLATE_CONFIGS } from '@/templates/configs';

const LEGACY_TEMPLATES = [
    { id: 'harvard', name: 'Harvard Classic', desc: 'Serif, centered name, bold headers', badge: '⭐ Top ATS' },
    { id: 'stanford', name: 'Stanford Clean', desc: 'Serif, left-aligned, authoritative', badge: '🎓 Academic' },
    { id: 'modern', name: 'Modern Minimal', desc: 'Sans-serif, thin ruled dividers', badge: '🎯 Tech Roles' },
    { id: 'compact', name: 'Compact Engineer', desc: 'Space-optimised, SDE layout', badge: '⚡ Max Content' },
    { id: 'executive', name: 'Executive Pro', desc: 'Bold headers, authoritative weight', badge: '💼 Leadership' },
    { id: 'minimal-divider', name: 'Minimal Divider', desc: 'No lines, clean whitespace hierarchy', badge: '✨ Ultra Clean' },
    { id: 'academic', name: 'Academic Structured', desc: 'Indented clean, academic format', badge: '📚 Research' },
    { id: 'ats-light', name: 'Ultra ATS Light', desc: 'Pure text, maximum ATS compatibility', badge: '🤖 ATS Safe' },
];

export const ALL_TEMPLATES = [
    ...LEGACY_TEMPLATES,
    ...ATS_TEMPLATE_CONFIGS.map(c => ({ id: c.id, name: c.name, desc: c.desc, badge: c.badge })),
];
