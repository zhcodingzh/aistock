export const dynamic = 'force-dynamic';

import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserOrders } from '@/lib/actions/order.actions';
import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import { getPortfolioAnalysisSummary } from '@/lib/actions/analysis.actions';
import AnalysisPageClient from '@/components/analysis/AnalysisPageClient';

export default async function AIAnalysisPage() {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect('/sign-in');

    const userId = session.user.id;

    const [orders, watchlist, analyses] = await Promise.all([
        getUserOrders(userId),
        getUserWatchlist(userId),
        getPortfolioAnalysisSummary(userId),
    ]);

    const positionSymbols = [...new Set(orders.map(o => o.symbol))];
    const watchlistSymbols = (watchlist as any[])
        .map((w: any) => w.symbol)
        .filter((s: string) => !positionSymbols.includes(s));

    const analysisMap: Record<string, AnalysisRecord> = {};
    for (const a of analyses) analysisMap[a.symbol] = a;

    return (
        <AnalysisPageClient
            userId={userId}
            positionSymbols={positionSymbols}
            watchlistSymbols={watchlistSymbols}
            analysisMap={analysisMap}
        />
    );
}
