'use client';

import { useState } from 'react';
import StockList from './StockList';
import TradingDetail from './TradingDetail';

interface TradingLayoutProps {
    userId: string;
    portfolio: PortfolioSummary;
    ordersBySymbol: Record<string, OrderRecord[]>;
    priceMap: Record<string, number>;
}

export default function TradingLayout({
    userId,
    portfolio,
    ordersBySymbol,
    priceMap,
}: TradingLayoutProps) {
    const symbols = portfolio.positions.map(p => p.symbol);
    const [selectedSymbol, setSelectedSymbol] = useState<string | 'portfolio'>(
        symbols.length > 0 ? symbols[0] : 'portfolio'
    );

    // Optimistic local state for orders (updated after mutations)
    const [localOrdersBySymbol, setLocalOrdersBySymbol] = useState(ordersBySymbol);

    const handleOrdersChange = (symbol: string, newOrders: OrderRecord[]) => {
        setLocalOrdersBySymbol(prev => ({ ...prev, [symbol]: newOrders }));
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-black text-gray-100 overflow-hidden">
            {/* Left Sidebar */}
            <StockList
                portfolio={portfolio}
                selectedSymbol={selectedSymbol}
                onSelect={setSelectedSymbol}
            />

            {/* Right Detail Panel */}
            <div className="flex-1 overflow-y-auto">
                {selectedSymbol === 'portfolio' ? (
                    <PortfolioOverview portfolio={portfolio} />
                ) : (
                    <TradingDetail
                        userId={userId}
                        symbol={selectedSymbol}
                        position={portfolio.positions.find(p => p.symbol === selectedSymbol)!}
                        orders={localOrdersBySymbol[selectedSymbol] ?? []}
                        onOrdersChange={(orders: OrderRecord[]) => handleOrdersChange(selectedSymbol, orders)}
                    />
                )}
            </div>
        </div>
    );
}

// Inline portfolio overview component
function PortfolioOverview({ portfolio }: { portfolio: PortfolioSummary }) {
    const fmt = (n: number) =>
        n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;
    const color = (n: number) => (n >= 0 ? 'text-green-400' : 'text-red-400');

    return (
        <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Market Value', value: `$${portfolio.totalMarketValue.toFixed(2)}`, cls: 'text-white' },
                    { label: 'Total P&L', value: fmt(portfolio.totalPnl), cls: color(portfolio.totalPnl) },
                    { label: 'Realized', value: fmt(portfolio.totalRealizedPnl), cls: color(portfolio.totalRealizedPnl) },
                    { label: 'Yearly P&L', value: fmt(portfolio.yearlyPnl), cls: color(portfolio.yearlyPnl) },
                ].map(({ label, value, cls }) => (
                    <div key={label} className="bg-gray-900 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className={`text-lg font-bold ${cls}`}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                {portfolio.positions.map(p => (
                    <div key={p.symbol} className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
                        <span className="font-mono font-bold text-white">{p.symbol}</span>
                        <span className="text-gray-400">{p.sharesHeld} shares @ ${p.avgCost.toFixed(2)}</span>
                        <span className={p.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {p.totalPnl >= 0 ? '+' : ''}{p.totalPnl.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
