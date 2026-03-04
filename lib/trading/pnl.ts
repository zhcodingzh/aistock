/**
 * FIFO P&L calculations for trading positions.
 * Takes orders sorted by date ASC and current price, returns PositionInfo.
 */

export function calculatePosition(
    orders: OrderRecord[],
    currentPrice: number
): Omit<PositionInfo, 'symbol'> {
    const currentYear = new Date().getFullYear();

    // FIFO queue: each entry is { shares, price, date }
    const buyQueue: { shares: number; price: number; date: Date }[] = [];
    let realizedPnl = 0;
    let yearlyRealizedPnl = 0;

    // Sort by date ascending
    const sorted = [...orders].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const order of sorted) {
        if (order.type === 'BUY') {
            buyQueue.push({ shares: order.shares, price: order.price, date: new Date(order.date) });
        } else {
            // SELL: match against earliest buys
            let remainingToSell = order.shares;
            const sellYear = new Date(order.date).getFullYear();
            while (remainingToSell > 0 && buyQueue.length > 0) {
                const lot = buyQueue[0];
                const matched = Math.min(lot.shares, remainingToSell);
                const pnl = (order.price - lot.price) * matched;
                realizedPnl += pnl;
                if (sellYear === currentYear) yearlyRealizedPnl += pnl;
                lot.shares -= matched;
                remainingToSell -= matched;
                if (lot.shares === 0) buyQueue.shift();
            }
        }
    }

    // Remaining in queue = current position
    const sharesHeld = buyQueue.reduce((sum, l) => sum + l.shares, 0);
    const totalCost = buyQueue.reduce((sum, l) => sum + l.shares * l.price, 0);
    const avgCost = sharesHeld > 0 ? totalCost / sharesHeld : 0;
    const marketValue = sharesHeld * currentPrice;
    const unrealizedPnl = marketValue - totalCost;
    const totalPnl = realizedPnl + unrealizedPnl;
    // yearlyPnl = yearly realized + all unrealized (since holding is ongoing)
    const yearlyPnl = yearlyRealizedPnl + unrealizedPnl;

    return {
        sharesHeld,
        avgCost,
        totalCost,
        realizedPnl,
        yearlyRealizedPnl,
        unrealizedPnl,
        totalPnl,
        yearlyPnl,
        marketValue,
        currentPrice,
    };
}

export function calculatePortfolio(
    ordersBySymbol: Record<string, OrderRecord[]>,
    priceMap: Record<string, number>
): PortfolioSummary {
    const positions: PositionInfo[] = Object.entries(ordersBySymbol).map(([symbol, orders]) => {
        const price = priceMap[symbol] ?? 0;
        return { symbol, ...calculatePosition(orders, price) };
    });

    return {
        positions,
        totalMarketValue: positions.reduce((s, p) => s + p.marketValue, 0),
        totalRealizedPnl: positions.reduce((s, p) => s + p.realizedPnl, 0),
        totalUnrealizedPnl: positions.reduce((s, p) => s + p.unrealizedPnl, 0),
        totalPnl: positions.reduce((s, p) => s + p.totalPnl, 0),
        yearlyPnl: positions.reduce((s, p) => s + p.yearlyPnl, 0),
    };
}
