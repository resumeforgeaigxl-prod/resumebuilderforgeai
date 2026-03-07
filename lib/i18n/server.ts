// Server-side translation utility
import en from '../../public/locales/en/common.json';
import hi from '../../public/locales/hi/common.json';
import te from '../../public/locales/te/common.json';
import ta from '../../public/locales/ta/common.json';
import ml from '../../public/locales/ml/common.json';
import es from '../../public/locales/es/common.json';
import fr from '../../public/locales/fr/common.json';
import de from '../../public/locales/de/common.json';

const translations: Record<string, Record<string, string>> = {
    en, hi, te, ta, ml, es, fr, de
};

export function getTranslations(lang: string = 'en') {
    const data = translations[lang] || translations.en;

    return (key: string) => {
        if (data[key]) return data[key];
        // Fallback: title-case the key
        return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };
}
