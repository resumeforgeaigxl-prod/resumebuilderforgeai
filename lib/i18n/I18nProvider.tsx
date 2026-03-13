'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Translations = Record<string, string>;

interface I18nContextType {
    t: (key: string) => string;
    locale: string;
    region: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const localeParam = (params?.locale as string) || 'en-in';
    const [lang, region] = localeParam.includes('-') ? localeParam.split('-') : [localeParam, 'in'];
    const locale = lang || 'en';
    const [translations, setTranslations] = useState<Translations>({});

    useEffect(() => {
        async function loadTranslations() {
            try {
                const response = await fetch(`/locales/${locale}/common.json`);
                if (response.ok) {
                    const data = await response.json();
                    setTranslations(data);
                }
            } catch (err) {
                console.error('Failed to load translations:', err);
            }
        }
        loadTranslations();
    }, [locale]);

    const t = (key: string) => {
        return translations[key] || key;
    };

    return (
        <I18nContext.Provider value={{ t, locale, region }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}
