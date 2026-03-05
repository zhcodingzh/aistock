/**
 * Core single-stock analysis logic, usable outside of Inngest.
 * Called by the on-demand API route (/api/analysis/request).
 */

import { connectToDatabase } from '@/database/mongoose';
import { Order } from '@/database/models/order.model';
import { Analysis } from '@/database/models/analysis.model';
import {
    getMetrics,
    getRecommendations,
    getNews,
    getCompanyProfile,
    getQuote,
} from '@/lib/actions/finnhub.actions';
import { calculateIndicators, type TechnicalSignals } from '@/lib/trading/indicators';
import { calculatePosition } from '@/lib/trading/pnl';
import { STOCK_ANALYSIS_PROMPT } from '@/lib/inngest/prompts';

/** 用 Yahoo Finance 获取近 90 天日 K 线（免费，无需 key） */
async function getYahooCandles(symbol: string): Promise<{
    c: number[]; v: number[];
} | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (!result) return null;
        const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
        const volumes: number[] = result.indicators?.quote?.[0]?.volume ?? [];
        // 过滤掉 null 值（停牌日）
        const valid = closes.map((c, i) => ({ c, v: volumes[i] ?? 0 })).filter(x => x.c != null);
        if (valid.length < 30) return null;
        return { c: valid.map(x => x.c), v: valid.map(x => x.v) };
    } catch {
        return null;
    }
}

const NEUTRAL_SIGNALS: TechnicalSignals = {
    rsi: null, rsiSignal: 'NEUTRAL',
    macdSignal: 'NEUTRAL', macdHistogram: null,
    priceVsMa20: 'AT', priceVsMa50: 'AT', priceVsMa200: 'AT',
    bbPosition: 'MIDDLE',
    todayGapPct: null, todayVolRatio: null,
};

export async function runStockAnalysis(params: {
    userId: string;
    symbol: string;
    riskTolerance: string;
    investmentGoal: string;
    locale?: string;
}): Promise<{ success: boolean; signal?: string; error?: string }> {
    const { userId, symbol, riskTolerance, investmentGoal, locale = 'en' } = params;

    await connectToDatabase();
    const today = new Date().toISOString().slice(0, 10);

    const [yahooCandles, metrics, recommendations, news, profile, quote, orders] =
        await Promise.all([
            getYahooCandles(symbol),
            getMetrics(symbol),
            getRecommendations(symbol),
            getNews([symbol]),
            getCompanyProfile(symbol),
            getQuote(symbol),
            Order.find({ userId, symbol }).lean(),
        ]);

    const signals: TechnicalSignals = yahooCandles
        ? calculateIndicators(yahooCandles.c, yahooCandles.v, [], [])
        : NEUTRAL_SIGNALS;

    const currentPrice = (quote as any)?.c ?? yahooCandles?.c[yahooCandles.c.length - 1] ?? 0;
    if (!currentPrice) return { success: false, error: 'Could not fetch current price' };
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
        locale,
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
