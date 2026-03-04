'use client';

interface PositionSummaryProps {
    position: PositionInfo;
}

export default function PositionSummary({ position: p }: PositionSummaryProps) {
    const fmt$ = (n: number) => `$${n.toFixed(2)}`;
    const fmtPnl = (n: number) => (n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`);
    const color = (n: number) => (n >= 0 ? 'text-green-400' : 'text-red-400');

    const items = [
        { label: 'Shares Held', value: p.sharesHeld.toString(), cls: 'text-white' },
        { label: 'Avg Cost', value: fmt$(p.avgCost), cls: 'text-white' },
        { label: 'Current Price', value: fmt$(p.currentPrice), cls: 'text-white' },
        { label: 'Market Value', value: fmt$(p.marketValue), cls: 'text-white' },
        { label: 'Unrealized P&L', value: fmtPnl(p.unrealizedPnl), cls: color(p.unrealizedPnl) },
        { label: 'Realized P&L', value: fmtPnl(p.realizedPnl), cls: color(p.realizedPnl) },
        { label: 'Total P&L', value: fmtPnl(p.totalPnl), cls: color(p.totalPnl) },
        { label: 'Yearly P&L', value: fmtPnl(p.yearlyPnl), cls: color(p.yearlyPnl) },
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
