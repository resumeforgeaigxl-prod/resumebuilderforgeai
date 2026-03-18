/**
 * 50+ ATS-friendly template configurations.
 * All configs use the single `generateFromConfig` renderer in `../ats-renderer`.
 *
 * Naming convention: cfg-NNN where NNN is a 3-digit zero-padded number.
 * Tags: "Top ATS" | "Tech Roles" | "Compact" | "Academic" | "ATS Safe"
 *
 * Variation matrix:
 *   4 fonts × 2 spacings × 2 header alignments × 2 dividers × 6 section orderings
 *   = 192 possible permutations; we cherry-pick 52 high-value combos.
 */
import { TemplateConfig } from '../ats-renderer';

// Section order presets
const SEC_STANDARD = ['summary', 'skills', 'experience', 'projects', 'certifications', 'education'] as const;
const SEC_SKILLS_FIRST = ['skills', 'experience', 'projects', 'summary', 'certifications', 'education'] as const;
const SEC_EXP_FIRST = ['experience', 'skills', 'projects', 'summary', 'certifications', 'education'] as const;
const SEC_EDU_FIRST = ['education', 'summary', 'skills', 'experience', 'projects', 'certifications'] as const;
const SEC_PROJ_EARLY = ['summary', 'experience', 'projects', 'skills', 'certifications', 'education'] as const;
const SEC_CERT_EARLY = ['summary', 'certifications', 'skills', 'experience', 'projects', 'education'] as const;

export const ATS_TEMPLATE_CONFIGS: TemplateConfig[] = [
    // ── INTER / NORMAL / CENTER / LINE ──────────────────────────────────────
    {
        id: 'cfg-001', name: 'ATS Pro · Inter Center', desc: 'Inter, centered header, ruled dividers',
        badge: '⭐ Top ATS', tag: 'Top ATS',
        font: 'Inter', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-002', name: 'Tech Clean · Inter Left', desc: 'Inter, left-aligned, ruled dividers',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Inter', spacing: 'normal', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-003', name: 'Compact Inter · Center', desc: 'Inter compact, centered, ruled',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Inter', spacing: 'compact', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-004', name: 'Compact Inter · Left', desc: 'Inter compact, left-aligned, ruled',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Inter', spacing: 'compact', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-005', name: 'ATS Pure · Inter Dashed', desc: 'Inter, centered header, dashed dividers',
        badge: '🤖 ATS Safe', tag: 'ATS Safe',
        font: 'Inter', spacing: 'normal', headerAlign: 'center', divider: 'dashed',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-006', name: 'ATS Minimal · Inter None', desc: 'Inter, no dividers, maximum whitespace',
        badge: '✨ ATS Safe', tag: 'ATS Safe',
        font: 'Inter', spacing: 'normal', headerAlign: 'left', divider: 'none',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-007', name: 'Inter Compact Dashed', desc: 'Inter compact, dashed, centered',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Inter', spacing: 'compact', headerAlign: 'center', divider: 'dashed',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-008', name: 'Inter · Proj Early', desc: 'Inter, projects after experience',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Inter', spacing: 'normal', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_PROJ_EARLY],
    },
    {
        id: 'cfg-009', name: 'Inter Academic Struct', desc: 'Inter, education first, academic layout',
        badge: '🎓 Academic', tag: 'Academic',
        font: 'Inter', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_EDU_FIRST],
    },
    {
        id: 'cfg-010', name: 'Inter · Cert Focus', desc: 'Inter, certifications highlighted early',
        badge: '⭐ Top ATS', tag: 'Top ATS',
        font: 'Inter', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_CERT_EARLY],
    },

    // ── ROBOTO / NORMAL / CENTER / LINE ─────────────────────────────────────
    {
        id: 'cfg-011', name: 'ATS Pro · Roboto Center', desc: 'Roboto, centered header, ruled dividers',
        badge: '⭐ Top ATS', tag: 'Top ATS',
        font: 'Roboto', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-012', name: 'Tech Clean · Roboto Left', desc: 'Roboto, left-aligned, ruled dividers',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Roboto', spacing: 'normal', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-013', name: 'Compact Roboto · Center', desc: 'Roboto compact, centered, ruled',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Roboto', spacing: 'compact', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-014', name: 'Compact Roboto · Left', desc: 'Roboto compact, left-aligned, ruled',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Roboto', spacing: 'compact', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-015', name: 'Roboto · Dashed Center', desc: 'Roboto normal, centered, dashed dividers',
        badge: '🤖 ATS Safe', tag: 'ATS Safe',
        font: 'Roboto', spacing: 'normal', headerAlign: 'center', divider: 'dashed',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-016', name: 'Roboto · No Divider', desc: 'Roboto, no dividers, ultra clean',
        badge: '✨ ATS Safe', tag: 'ATS Safe',
        font: 'Roboto', spacing: 'normal', headerAlign: 'left', divider: 'none',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-017', name: 'Roboto Compact Dashed', desc: 'Roboto compact, dashed, left',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Roboto', spacing: 'compact', headerAlign: 'left', divider: 'dashed',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-018', name: 'Roboto · Proj Early', desc: 'Roboto, projects highlighted early',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Roboto', spacing: 'normal', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_PROJ_EARLY],
    },
    {
        id: 'cfg-019', name: 'Roboto Academic', desc: 'Roboto, education first, academic layout',
        badge: '🎓 Academic', tag: 'Academic',
        font: 'Roboto', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_EDU_FIRST],
    },
    {
        id: 'cfg-020', name: 'Roboto · Cert Focus', desc: 'Roboto, certifications early',
        badge: '⭐ Top ATS', tag: 'Top ATS',
        font: 'Roboto', spacing: 'normal', headerAlign: 'center', divider: 'dashed',
        sectionOrder: [...SEC_CERT_EARLY],
    },

    // ── ARIAL / NORMAL / CENTER / LINE ───────────────────────────────────────
    {
        id: 'cfg-021', name: 'ATS Pro · Arial Center', desc: 'Arial, centered header, ruled dividers',
        badge: '⭐ Top ATS', tag: 'Top ATS',
        font: 'Arial', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-022', name: 'Tech Clean · Arial Left', desc: 'Arial, left-aligned, ruled dividers',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Arial', spacing: 'normal', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-023', name: 'Compact Arial · Center', desc: 'Arial compact, centered header',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Arial', spacing: 'compact', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-024', name: 'Compact Arial · Left', desc: 'Arial compact, left-aligned',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Arial', spacing: 'compact', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-025', name: 'Arial · Dashed Center', desc: 'Arial, dashed dividers, centered',
        badge: '🤖 ATS Safe', tag: 'ATS Safe',
        font: 'Arial', spacing: 'normal', headerAlign: 'center', divider: 'dashed',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-026', name: 'Arial · Ultra Clean', desc: 'Arial, no dividers, left-aligned',
        badge: '✨ ATS Safe', tag: 'ATS Safe',
        font: 'Arial', spacing: 'normal', headerAlign: 'left', divider: 'none',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-027', name: 'Arial Compact Dashed', desc: 'Arial compact, dashed dividers',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Arial', spacing: 'compact', headerAlign: 'left', divider: 'dashed',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-028', name: 'Arial · Proj Early', desc: 'Arial, projects highlighted early',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Arial', spacing: 'normal', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_PROJ_EARLY],
    },
    {
        id: 'cfg-029', name: 'Arial Academic', desc: 'Arial, education first, academic layout',
        badge: '🎓 Academic', tag: 'Academic',
        font: 'Arial', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_EDU_FIRST],
    },
    {
        id: 'cfg-030', name: 'Arial · Cert Focus', desc: 'Arial, certifications early',
        badge: '⭐ Top ATS', tag: 'Top ATS',
        font: 'Arial', spacing: 'normal', headerAlign: 'center', divider: 'dashed',
        sectionOrder: [...SEC_CERT_EARLY],
    },

    // ── TIMES / NORMAL / CENTER / LINE ───────────────────────────────────────
    {
        id: 'cfg-031', name: 'Classic Pro · Times Center', desc: 'Times New Roman, centered, ruled',
        badge: '⭐ Top ATS', tag: 'Top ATS',
        font: 'Times', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-032', name: 'Academic · Times Left', desc: 'Times New Roman, left-aligned',
        badge: '🎓 Academic', tag: 'Academic',
        font: 'Times', spacing: 'normal', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_EDU_FIRST],
    },
    {
        id: 'cfg-033', name: 'Times Compact · Center', desc: 'Times compact, centered header',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Times', spacing: 'compact', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-034', name: 'Times Compact · Left', desc: 'Times compact, left-aligned',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Times', spacing: 'compact', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-035', name: 'Times · Dashed', desc: 'Times, dashed dividers, centered',
        badge: '🤖 ATS Safe', tag: 'ATS Safe',
        font: 'Times', spacing: 'normal', headerAlign: 'center', divider: 'dashed',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-036', name: 'Times · Ultra Clean', desc: 'Times, no dividers, left-aligned',
        badge: '✨ ATS Safe', tag: 'ATS Safe',
        font: 'Times', spacing: 'normal', headerAlign: 'left', divider: 'none',
        sectionOrder: [...SEC_STANDARD],
    },
    {
        id: 'cfg-037', name: 'Times · Research Focus', desc: 'Times, education & projects first',
        badge: '🎓 Academic', tag: 'Academic',
        font: 'Times', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_EDU_FIRST],
    },
    {
        id: 'cfg-038', name: 'Times · Cert Focus', desc: 'Times, certifications highlighted early',
        badge: '⭐ Top ATS', tag: 'Top ATS',
        font: 'Times', spacing: 'normal', headerAlign: 'center', divider: 'line',
        sectionOrder: [...SEC_CERT_EARLY],
    },
    {
        id: 'cfg-039', name: 'Times Compact Dashed', desc: 'Times compact, dashed dividers',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Times', spacing: 'compact', headerAlign: 'left', divider: 'dashed',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-040', name: 'Times · Proj Early', desc: 'Times, projects after experience',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Times', spacing: 'normal', headerAlign: 'left', divider: 'line',
        sectionOrder: [...SEC_PROJ_EARLY],
    },

    // ── EXTRA INTER VARIATIONS ───────────────────────────────────────────────
    {
        id: 'cfg-041', name: 'Inter · Skills Lead', desc: 'Inter, skills first for tech roles',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Inter', spacing: 'normal', headerAlign: 'left', divider: 'dashed',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-042', name: 'Inter · Exp Lead Compact', desc: 'Inter compact, experience first',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Inter', spacing: 'compact', headerAlign: 'left', divider: 'none',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-043', name: 'Inter · Academic Pure', desc: 'Inter, education first, no dividers',
        badge: '🎓 Academic', tag: 'Academic',
        font: 'Inter', spacing: 'normal', headerAlign: 'center', divider: 'none',
        sectionOrder: [...SEC_EDU_FIRST],
    },

    // ── EXTRA ROBOTO VARIATIONS ───────────────────────────────────────────────
    {
        id: 'cfg-044', name: 'Roboto · Skills Lead', desc: 'Roboto, skills first for tech roles',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Roboto', spacing: 'normal', headerAlign: 'left', divider: 'dashed',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-045', name: 'Roboto · Exp Lead Compact', desc: 'Roboto compact, experience first',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Roboto', spacing: 'compact', headerAlign: 'left', divider: 'none',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-046', name: 'Roboto · Academic Pure', desc: 'Roboto, education first, no dividers',
        badge: '🎓 Academic', tag: 'Academic',
        font: 'Roboto', spacing: 'normal', headerAlign: 'center', divider: 'none',
        sectionOrder: [...SEC_EDU_FIRST],
    },

    // ── EXTRA ARIAL VARIATIONS ────────────────────────────────────────────────
    {
        id: 'cfg-047', name: 'Arial · Skills Lead', desc: 'Arial, skills first for tech roles',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Arial', spacing: 'normal', headerAlign: 'left', divider: 'dashed',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-048', name: 'Arial · Exp Lead Compact', desc: 'Arial compact, experience first',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Arial', spacing: 'compact', headerAlign: 'left', divider: 'none',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-049', name: 'Arial · Academic Pure', desc: 'Arial, education first, no dividers',
        badge: '🎓 Academic', tag: 'Academic',
        font: 'Arial', spacing: 'normal', headerAlign: 'center', divider: 'none',
        sectionOrder: [...SEC_EDU_FIRST],
    },

    // ── EXTRA TIMES VARIATIONS ────────────────────────────────────────────────
    {
        id: 'cfg-050', name: 'Times · Skills Lead', desc: 'Times, skills first for tech roles',
        badge: '🎯 Tech Roles', tag: 'Tech Roles',
        font: 'Times', spacing: 'normal', headerAlign: 'left', divider: 'dashed',
        sectionOrder: [...SEC_SKILLS_FIRST],
    },
    {
        id: 'cfg-051', name: 'Times · Exp Lead Compact', desc: 'Times compact, experience first, no dividers',
        badge: '⚡ Compact', tag: 'Compact',
        font: 'Times', spacing: 'compact', headerAlign: 'left', divider: 'none',
        sectionOrder: [...SEC_EXP_FIRST],
    },
    {
        id: 'cfg-052', name: 'Times · Academic Pure', desc: 'Times, education first, no dividers',
        badge: '🎓 Academic', tag: 'Academic',
        font: 'Times', spacing: 'normal', headerAlign: 'center', divider: 'none',
        sectionOrder: [...SEC_EDU_FIRST],
    },
];

// Quick lookup map for the download route
export const ATS_CONFIG_MAP = new Map(
    ATS_TEMPLATE_CONFIGS.map(c => [c.id, c])
);
