import { after } from 'next/server';
import { runStockAnalysis } from '@/lib/trading/analyzeStock';

export async function POST(request: Request) {
    const { userId, symbol, riskTolerance, investmentGoal } = await request.json();

    if (!userId || !symbol) {
        return Response.json({ error: 'Missing userId or symbol' }, { status: 400 });
    }

    // Respond immediately, run analysis in background after response is sent
    after(async () => {
        try {
            await runStockAnalysis({ userId, symbol, riskTolerance, investmentGoal });
        } catch (err) {
            console.error(`[analysis] Failed for ${symbol}:`, err);
        }
    });

    return Response.json({ queued: true });
}
