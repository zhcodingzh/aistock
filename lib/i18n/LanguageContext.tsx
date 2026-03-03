'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Locale, TranslationKey } from './translations';

const LanguageContext = createContext<{
    locale: Locale;
    t: (key: TranslationKey) => string;
    toggleLocale: () => void;
}>({
    locale: 'en',
    t: (key) => translations.en[key],
    toggleLocale: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [locale, setLocale] = useState<Locale>('en');

    useEffect(() => {
        const saved = localStorage.getItem('aistock-lang') as Locale;
        if (saved === 'zh' || saved === 'en') setLocale(saved);
    }, []);

    const toggleLocale = () => {
        const next: Locale = locale === 'en' ? 'zh' : 'en';
        setLocale(next);
        localStorage.setItem('aistock-lang', next);
    };

    const t = (key: TranslationKey): string => translations[locale][key];

    return (
        <LanguageContext.Provider value={{ locale, t, toggleLocale }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => useContext(LanguageContext);
