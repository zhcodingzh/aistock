'use client';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function LanguageToggle() {
    const { locale, toggleLocale } = useTranslation();
    return (
        <button
            onClick={toggleLocale}
            className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
            title="切换语言 / Switch Language"
        >
            {locale === 'en' ? '中文' : 'EN'}
        </button>
    );
}
