export const dynamic = 'force-dynamic';

import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserOrders } from '@/lib/actions/order.actions';
import { getQuote } from '@/lib/actions/finnhub.actions';
import { calculatePortfolio } from '@/lib/trading/pnl';
import TradingLayout from '@/components/trading/TradingLayout';

export default async function TradingPage() {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect('/sign-in');

    const userId = session.user.id;
    const allOrders = await getUserOrders(userId);

    // Group orders by symbol
    const ordersBySymbol: Record<string, OrderRecord[]> = {};
    for (const order of allOrders) {
        if (!ordersBySymbol[order.symbol]) ordersBySymbol[order.symbol] = [];
        ordersBySymbol[order.symbol].push(order);
    }

    // Fetch current prices for all symbols in parallel
    const symbols = Object.keys(ordersBySymbol);
    const quoteResults = await Promise.allSettled(symbols.map(s => getQuote(s)));
    const priceMap: Record<string, number> = {};
    symbols.forEach((s, i) => {
        const r = quoteResults[i];
        priceMap[s] = r.status === 'fulfilled' ? (r.value?.c ?? 0) : 0;
    });

    const portfolio = calculatePortfolio(ordersBySymbol, priceMap);

    return (
        <TradingLayout
            userId={userId}
            portfolio={portfolio}
            ordersBySymbol={ordersBySymbol}
            priceMap={priceMap}
        />
    );
}
