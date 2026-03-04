'use client';

import { useTranslation } from '@/lib/i18n/LanguageContext';

interface PositionSummaryProps {
    position: PositionInfo;
}

export default function PositionSummary({ position: p }: PositionSummaryProps) {
    const { t } = useTranslation();
    const fmt$ = (n: number) => `$${n.toFixed(2)}`;
    const fmtPnl = (n: number) => (n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`);
    const color = (n: number) => (n >= 0 ? 'text-green-400' : 'text-red-400');

    const items = [
        { label: t('trading_shares_held'), value: p.sharesHeld.toString(), cls: 'text-white' },
        { label: t('portfolio_avg_cost'), value: fmt$(p.avgCost), cls: 'text-white' },
        { label: t('trading_current_price'), value: fmt$(p.currentPrice), cls: 'text-white' },
        { label: t('trading_market_value'), value: fmt$(p.marketValue), cls: 'text-white' },
        { label: t('trading_unrealized_pnl'), value: fmtPnl(p.unrealizedPnl), cls: color(p.unrealizedPnl) },
        { label: t('portfolio_realized'), value: fmtPnl(p.realizedPnl), cls: color(p.realizedPnl) },
        { label: t('trading_total_pnl'), value: fmtPnl(p.totalPnl), cls: color(p.totalPnl) },
        { label: t('trading_yearly_pnl'), value: fmtPnl(p.yearlyPnl), cls: color(p.yearlyPnl) },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            {items.map(({ label, value, cls }) => (
                <div key={label} className="bg-gray-900 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className={`text-sm font-bold font-mono ${cls}`}>{value}</p>
                </div>
            ))}
        </div>
    );
}
