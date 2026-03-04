'use client';

import { useTranslation } from '@/lib/i18n/LanguageContext';

interface StockListProps {
    portfolio: PortfolioSummary;
    selectedSymbol: string;
    onSelect: (symbol: string | 'portfolio') => void;
}

export default function StockList({ portfolio, selectedSymbol, onSelect }: StockListProps) {
    const { t } = useTranslation();
    const fmt = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2);
    const color = (n: number) => (n >= 0 ? 'text-green-400' : 'text-red-400');

    return (
        <div className="w-56 flex-shrink-0 border-r border-gray-800 overflow-y-auto flex flex-col">
            <button
                onClick={() => onSelect('portfolio')}
                className={`px-4 py-4 text-left border-b border-gray-800 transition-colors ${
                    selectedSymbol === 'portfolio'
                        ? 'bg-gray-800 text-white'
                        : 'hover:bg-gray-900 text-gray-400'
                }`}
            >
                <div className="text-sm font-bold text-white">{t('trading_portfolio_row')}</div>
                <div className="text-xs mt-1">
                    <span className="text-gray-500">{t('trading_total_pnl')} </span>
                    <span className={color(portfolio.totalPnl)}>{fmt(portfolio.totalPnl)}</span>
                </div>
                <div className="text-xs">
                    <span className="text-gray-500">{t('trading_yearly_pnl')} </span>
                    <span className={color(portfolio.yearlyPnl)}>{fmt(portfolio.yearlyPnl)}</span>
                </div>
            </button>

            {portfolio.positions.map(pos => (
                <button
                    key={pos.symbol}
                    onClick={() => onSelect(pos.symbol)}
                    className={`px-4 py-3 text-left border-b border-gray-800/50 transition-colors ${
                        selectedSymbol === pos.symbol
                            ? 'bg-gray-800 text-white'
                            : 'hover:bg-gray-900 text-gray-400'
                    }`}
                >
                    <div className="font-mono font-bold text-sm text-white">{pos.symbol}</div>
                    <div className="text-xs mt-0.5">
                        <span className="text-gray-500">{pos.sharesHeld} {t('trading_shares_unit')}</span>
                    </div>
                    <div className="text-xs flex gap-2">
                        <span className={color(pos.totalPnl)}>{fmt(pos.totalPnl)}</span>
                        <span className="text-gray-600">|</span>
                        <span className={color(pos.yearlyPnl)}>{fmt(pos.yearlyPnl)}Y</span>
                    </div>
                </button>
            ))}

            {portfolio.positions.length === 0 && (
                <div className="p-4 text-xs text-gray-600 text-center">
                    {t('trading_no_positions')}<br />{t('trading_no_positions_hint')}
                </div>
            )}
        </div>
    );
}
