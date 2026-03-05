/**
 * Core single-stock analysis logic, usable outside of Inngest.
 * Called by the on-demand API route (/api/analysis/request).
 */

import { connectToDatabase } from '@/database/mongoose';
import { Order } from '@/database/models/order.model';
import { Analysis } from '@/database/models/analysis.model';
import {
    getCandles,
    getIntradayCandles,
    getMetrics,
    getRecommendations,
    getNews,
    getCompanyProfile,
    getQuote,
} from '@/lib/actions/finnhub.actions';
import { calculateIndicators } from '@/lib/trading/indicators';
import { calculatePosition } from '@/lib/trading/pnl';
import { STOCK_ANALYSIS_PROMPT } from '@/lib/inngest/prompts';

export async function runStockAnalysis(params: {
    userId: string;
    symbol: string;
    riskTolerance: string;
    investmentGoal: string;
}): Promise<{ success: boolean; signal?: string; error?: string }> {
    const { userId, symbol, riskTolerance, investmentGoal } = params;

    await connectToDatabase();
    const today = new Date().toISOString().slice(0, 10);

    const [candles, intradayCandles, metrics, recommendations, news, profile, quote, orders] =
        await Promise.all([
            getCandles(symbol),
            getIntradayCandles(symbol),
            getMetrics(symbol),
            getRecommendations(symbol),
            getNews([symbol]),
            getCompanyProfile(symbol),
            getQuote(symbol),
            Order.find({ userId, symbol }).lean(),
        ]);

    if (!candles || candles.c.length < 30) {
        return { success: false, error: 'Insufficient candle data' };
    }

    const signals = calculateIndicators(
        candles.c,
        candles.v,
        intradayCandles?.c ?? [],
        intradayCandles?.v ?? []
    );
    const currentPrice = (quote as any)?.c ?? candles.c[candles.c.length - 1];
    const position =
        (orders as any[]).length > 0
            ? calculatePosition(orders as any[], currentPrice)
            : null;
    const unrealizedPnlPct =
        position && position.avgCost > 0
            ? ((currentPrice - position.avgCost) / position.avgCost) * 100
            : 0;

    const prompt = STOCK_ANALYSIS_PROMPT({
        symbol,
        companyName: (profile as any)?.name ?? symbol,
        currentPrice,
        signals,
        metrics: metrics as any,
        recommendations: recommendations as any,
        newsHeadlines: ((news ?? []) as any[])
            .slice(0, 5)
            .map((n: any) => n.headline ?? ''),
        hasPosition: (orders as any[]).length > 0,
        sharesHeld: position?.sharesHeld ?? 0,
        avgCost: position?.avgCost ?? 0,
        unrealizedPnlPct,
        positionWeight: 0,
        riskTolerance,
        investmentGoal,
    });

    // Call Gemini directly via REST (no Inngest step.ai.infer needed)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return { success: false, error: 'GEMINI_API_KEY not configured' };
    }

    const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            }),
        }
    );

    if (!geminiRes.ok) {
        return { success: false, error: `Gemini API error: ${geminiRes.status}` };
    }

    const geminiData = await geminiRes.json();
    const rawText =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const clean = rawText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    let parsed: any;
    try {
        parsed = JSON.parse(clean);
    } catch {
        return { success: false, error: 'Failed to parse AI response' };
    }

    await Analysis.findOneAndUpdate(
        { userId, symbol, date: today },
        {
            ...parsed,
            symbol,
            date: today,
            userId,
            positionWeight: 0,
            generatedBy: 'manual',
        },
        { upsert: true, new: true }
    );

    return { success: true, signal: parsed.signal };
}
