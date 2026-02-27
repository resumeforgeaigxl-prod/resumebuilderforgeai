import { PortfolioData, PortfolioTheme } from '@/types/portfolio';
import MinimalTheme from './themes/MinimalTheme';
import DeveloperTheme from './themes/DeveloperTheme';
import CorporateTheme from './themes/CorporateTheme';

interface Props {
    data: PortfolioData;
    theme: PortfolioTheme;
    watermark?: boolean;
}

export default function PortfolioRenderer({ data, theme, watermark = false }: Props) {
    if (theme === 'developer') return <DeveloperTheme data={data} watermark={watermark} />;
    if (theme === 'corporate') return <CorporateTheme data={data} watermark={watermark} />;
    return <MinimalTheme data={data} watermark={watermark} />;
}
