import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const BASE = 'https://resumeforgeai.in';

const REGIONS = {
    in: { name: 'India', flag: '🇮🇳', hreflang: 'en-IN', locale: 'en_IN' },
    us: { name: 'United States', flag: '🇺🇸', hreflang: 'en-US', locale: 'en_US' },
    eu: { name: 'Europe', flag: '🇪🇺', hreflang: 'en-EU', locale: 'en_US' },
} as const;

type Region = keyof typeof REGIONS;

interface Props {
    params: { region: string };
    children: React.ReactNode;
}

export async function generateStaticParams() {
    return Object.keys(REGIONS).map((region) => ({ region }));
}

export async function generateMetadata({ params }: { params: { region: string } }): Promise<Metadata> {
    const r = params.region as Region;
    if (!REGIONS[r]) return {};

    const { name, flag } = REGIONS[r];
    const regionUrl = `${BASE}/${r}`;

    return {
        title: `AI Resume Builder ${flag} ${name} | ResumeForgeAI`,
        description: `Build ATS-optimised resumes in ${name}. Generate AI resumes, cover letters, practice mock interviews and find ${name} jobs with ResumeForgeAI.`,
        alternates: {
            canonical: regionUrl,
            languages: {
                'en-IN': `${BASE}/in`,
                'en-US': `${BASE}/us`,
                'en-EU': `${BASE}/eu`,
                'x-default': BASE,
            },
        },
        openGraph: {
            type: 'website',
            locale: REGIONS[r].locale,
            url: regionUrl,
            siteName: 'ResumeForgeAI',
            title: `AI Resume Builder ${flag} ${name} | ResumeForgeAI`,
            description: `Job-winning AI resumes tailored for the ${name} market.`,
        },
    };
}

export default function RegionLayout({ children, params }: Props) {
    const r = params.region as Region;
    if (!REGIONS[r]) notFound();

    const { hreflang } = REGIONS[r];
    const regionUrl = `${BASE}/${r}`;

    return (
        <>
            {/* Hreflang + canonical for this region — rendered in <head> */}
            <head>
                <link rel="canonical" href={regionUrl} />
                <link rel="alternate" hrefLang="en-IN" href={`${BASE}/in`} />
                <link rel="alternate" hrefLang="en-US" href={`${BASE}/us`} />
                <link rel="alternate" hrefLang="en-EU" href={`${BASE}/eu`} />
                <link rel="alternate" hrefLang="x-default" href={BASE} />
                <link rel="alternate" hrefLang={hreflang.toLowerCase()} href={regionUrl} />
            </head>
            {children}
        </>
    );
}
