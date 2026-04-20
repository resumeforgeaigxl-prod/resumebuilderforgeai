import { Classic, TemplateProps } from './Classic';
import { Compact } from './Compact';
import { Minimal } from './Minimal';
import { ModernHeader } from './ModernHeader';
import { FresherFocus } from './FresherFocus';

export type BaseTemplateId = 'classic' | 'compact' | 'minimal' | 'modern' | 'fresher';

export interface TemplateVariant {
  id: string;
  name: string;
  base: BaseTemplateId;
  theme: {
    fontFamily: 'Arial' | 'Inter';
    spacing: 'compact' | 'normal';
    headerStyle: 'bold' | 'minimal';
  };
}

export const ATSTemplates: TemplateVariant[] = [];

const bases: BaseTemplateId[] = ['classic', 'compact', 'minimal', 'modern', 'fresher'];
const fonts: ('Arial' | 'Inter')[] = ['Arial', 'Inter'];
const spacings: ('compact' | 'normal')[] = ['compact', 'normal'];

// Generate 20 variations
let count = 0;
bases.forEach(base => {
  fonts.forEach(font => {
    spacings.forEach(spacing => {
        if (count < 20) {
            ATSTemplates.push({
                id: `ats-${base}-${font.toLowerCase()}-${spacing}`,
                name: `ATS ${base.charAt(0).toUpperCase() + base.slice(1)} (${font}, ${spacing})`,
                base,
                theme: {
                    fontFamily: font,
                    spacing,
                    headerStyle: font === 'Inter' ? 'bold' : 'minimal'
                }
            });
            count++;
        }
    });
  });
});

export const TemplateComponentMap: Record<BaseTemplateId, React.FC<TemplateProps>> = {
  classic: Classic,
  compact: Compact,
  minimal: Minimal,
  modern: ModernHeader,
  fresher: FresherFocus,
};
