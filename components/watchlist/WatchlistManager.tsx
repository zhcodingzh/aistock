'use client';

import React, { useState, useMemo } from 'react';
import WatchlistStockChip from './WatchlistStockChip';
import WatchlistTable from './WatchlistTable';
import AnalysisCard from '@/components/analysis/AnalysisCard';
import { Button } from '@/components/ui/button';
import { ArrowDownAZ, ArrowUpZA, ArrowUpDown } from 'lucide-react';
import { WatchlistItem } from '@/database/models/watchlist.model';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface WatchlistManagerProps {
    initialItems: WatchlistItem[];
    userId: string;
    analysisMap?: Record<string, AnalysisRecord>;
    initialPriceData?: any[];
}

export default function WatchlistManager({ initialItems, userId, analysisMap, initialPriceData = [] }: WatchlistManagerProps) {
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
    const { t } = useTranslation();

    const toggleSort = () => {
        if (sortOrder === null) setSortOrder('asc');
        else if (sortOrder === 'asc') setSortOrder('desc');
        else setSortOrder(null);
    };

    const sortedItems = useMemo(() => {
        if (!sortOrder) return initialItems;
        return [...initialItems].sort((a, b) =>
            sortOrder === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol)
        );
    }, [initialItems, sortOrder]);

    const watchlistSymbols = sortedItems.map((item) => item.symbol);

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                        <span className="mr-2">{t('manage_symbols')}</span>
                        <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                            {watchlistSymbols.length}
                        </span>
                    </h3>
                    <Button variant="ghost" size="sm" onClick={toggleSort}
                        className="h-8 px-2 text-gray-400 hover:text-white hover:bg-white/10">
                        {sortOrder === 'asc' && <ArrowDownAZ className="w-4 h-4 mr-2" />}
                        {sortOrder === 'desc' && <ArrowUpZA className="w-4 h-4 mr-2" />}
                        {sortOrder === null && <ArrowUpDown className="w-4 h-4 mr-2" />}
                        <span className="text-xs">
                            {sortOrder === 'asc' ? t('sort_az') : sortOrder === 'desc' ? t('sort_za') : t('sort_default')}
                        </span>
                    </Button>
                </div>
                {watchlistSymbols.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {sortedItems.map((item) => (
                            <WatchlistStockChip key={item.symbol} symbol={item.symbol} userId={userId} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">{t('no_stocks')}</p>
                )}
            </div>
            <WatchlistTable
                data={initialPriceData.length > 0 ? initialPriceData : sortedItems.map(item => ({
                    symbol: item.symbol,
                    name: item.company,
                    price: 0,
                    change: 0,
                    changePercent: 0,
                    logo: null,
                    marketCap: null,
                }))}
                userId={userId}
                analysisMap={analysisMap}
            />
        </div>
    );
}
