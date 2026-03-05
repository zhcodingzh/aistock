import { runStockAnalysis } from '@/lib/trading/analyzeStock';

export async function POST(request: Request) {
    const { userId, symbol, riskTolerance, investmentGoal } = await request.json();

    if (!userId || !symbol) {
        return Response.json({ error: 'Missing userId or symbol' }, { status: 400 });
    }

    console.log(`[analysis] Starting analysis for ${symbol} (user: ${userId})`);

    try {
        const result = await runStockAnalysis({ userId, symbol, riskTolerance, investmentGoal });
        console.log(`[analysis] Done for ${symbol}:`, result);
        return Response.json(result);
    } catch (err) {
        console.error(`[analysis] Failed for ${symbol}:`, err);
        return Response.json({ success: false, error: String(err) }, { status: 500 });
    }
}
