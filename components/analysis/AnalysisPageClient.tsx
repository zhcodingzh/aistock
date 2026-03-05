'use client';

import { useTranslation } from '@/lib/i18n/LanguageContext';
import AnalysisCard from './AnalysisCard';

interface AnalysisPageClientProps {
    userId: string;
    positionSymbols: string[];
    watchlistSymbols: string[];
    analysisMap: Record<string, AnalysisRecord>;
}

export default function AnalysisPageClient({
    userId,
    positionSymbols,
    watchlistSymbols,
    analysisMap,
}: AnalysisPageClientProps) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-black text-gray-100 p-6 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">{t('ai_analysis_title')}</h1>
            <p className="text-gray-500 text-sm mb-8">{t('ai_disclaimer')}</p>

            {positionSymbols.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('ai_positions')}</h2>
                    <div className="space-y-4">
                        {positionSymbols.map(symbol => (
                            <AnalysisCard
                                key={symbol}
                                userId={userId}
                                symbol={symbol}
                                analysis={analysisMap[symbol] ?? null}
                            />
                        ))}
                    </div>
                </section>
            )}

            {watchlistSymbols.length > 0 && (
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('ai_watchlist')}</h2>
                    <div className="space-y-4">
                        {watchlistSymbols.map(symbol => (
                            <AnalysisCard
                                key={symbol}
                                userId={userId}
                                symbol={symbol}
                                analysis={analysisMap[symbol] ?? null}
                            />
                        ))}
                    </div>
                </section>
            )}

            {positionSymbols.length === 0 && watchlistSymbols.length === 0 && (
                <div className="text-center py-24 text-gray-600">
                    <p className="text-sm">{t('ai_no_analysis')}</p>
                    <p className="text-xs mt-2">Add stocks to your watchlist or record trades to get started.</p>
                </div>
            )}
        </div>
    );
}
