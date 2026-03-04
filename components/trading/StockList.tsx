'use client';

interface StockListProps {
    portfolio: PortfolioSummary;
    selectedSymbol: string;
    onSelect: (symbol: string | 'portfolio') => void;
}

export default function StockList({ portfolio, selectedSymbol, onSelect }: StockListProps) {
    const fmt = (n: number) =>
        (n >= 0 ? '+' : '') + n.toFixed(2);
    const color = (n: number) => (n >= 0 ? 'text-green-400' : 'text-red-400');

    return (
        <div className="w-56 flex-shrink-0 border-r border-gray-800 overflow-y-auto flex flex-col">
            {/* Portfolio row */}
            <button
                onClick={() => onSelect('portfolio')}
                className={`px-4 py-4 text-left border-b border-gray-800 transition-colors ${
                    selectedSymbol === 'portfolio'
                        ? 'bg-gray-800 text-white'
                        : 'hover:bg-gray-900 text-gray-400'
                }`}
            >
                <div className="text-sm font-bold text-white">Portfolio</div>
                <div className="text-xs mt-1">
                    <span className="text-gray-500">Total </span>
                    <span className={color(portfolio.totalPnl)}>
                        {fmt(portfolio.totalPnl)}
                    </span>
                </div>
                <div className="text-xs">
                    <span className="text-gray-500">Yearly </span>
                    <span className={color(portfolio.yearlyPnl)}>
                        {fmt(portfolio.yearlyPnl)}
                    </span>
                </div>
            </button>

            {/* Per-symbol rows */}
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
                        <span className="text-gray-500">{pos.sharesHeld} shares</span>
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
                    No positions yet.<br />Add orders to get started.
                </div>
            )}
        </div>
    );
}
