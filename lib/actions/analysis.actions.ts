'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Analysis } from '@/database/models/analysis.model';
import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { runStockAnalysis } from '@/lib/trading/analyzeStock';

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

export async function getAnalysis(userId: string, symbol: string): Promise<AnalysisRecord | null> {
    await connectToDatabase();
    const doc = await Analysis.findOne({ userId, symbol: symbol.toUpperCase(), date: today() })
        .sort({ updatedAt: -1 })
        .lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
}

export async function getPortfolioAnalysisSummary(userId: string): Promise<AnalysisRecord[]> {
    await connectToDatabase();
    const docs = await Analysis.find({ userId, date: today() }).lean();
    return JSON.parse(JSON.stringify(docs));
}

export async function requestAnalysis(userId: string, symbol: string, locale: string = 'en'): Promise<void> {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user as any;

    const sym = symbol.toUpperCase();
    const riskTolerance = user?.riskTolerance ?? 'Medium';
    const investmentGoal = user?.investmentGoals ?? 'Growth';

    // Fire-and-forget: 直接在 Node.js 事件循环中运行，不阻塞 server action 返回
    setImmediate(() => {
        runStockAnalysis({ userId, symbol: sym, riskTolerance, investmentGoal, locale })
            .then(r => console.log(`[analysis] ${sym} done:`, r.signal ?? r.error))
            .catch(err => console.error(`[analysis] ${sym} error:`, err));
    });
}
