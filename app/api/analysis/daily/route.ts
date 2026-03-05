import { connectToDatabase } from '@/database/mongoose';
import { Order } from '@/database/models/order.model';
import { Watchlist } from '@/database/models/watchlist.model';
import { Analysis } from '@/database/models/analysis.model';
import { runStockAnalysis } from '@/lib/trading/analyzeStock';
import mongoose from 'mongoose';

export const maxDuration = 300; // 5 分钟超时（Vercel/Node）

export async function GET(request: Request) {
    // 验证 secret，防止外部随意触发
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (secret !== process.env.CRON_SECRET) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const today = new Date().toISOString().slice(0, 10);

    console.log(`[daily-analysis] Starting daily analysis for ${today}`);

    // 获取所有用户
    const db = mongoose.connection.db;
    if (!db) return Response.json({ error: 'DB not connected' }, { status: 500 });
    const users = await db.collection('user').find({}, {
        projection: { _id: 1, riskTolerance: 1, investmentGoals: 1 }
    }).toArray();

    console.log(`[daily-analysis] Found ${users.length} users`);

    const results: Record<string, { analyzed: number; skipped: number }> = {};

    for (const user of users) {
        const userId = user._id.toString();
        const riskTolerance = (user as any).riskTolerance ?? 'Medium';
        const investmentGoal = (user as any).investmentGoals ?? 'Growth';

        // 获取该用户的持仓 symbol 和关注股 symbol
        const [orders, watchlist] = await Promise.all([
            Order.find({ userId }).distinct('symbol'),
            Watchlist.find({ userId }).distinct('symbol'),
        ]);

        const positionSymbols: string[] = orders;
        const watchlistOnlySymbols: string[] = watchlist.filter(
            (s: string) => !positionSymbols.includes(s)
        );
        const allSymbols = [...positionSymbols, ...watchlistOnlySymbols];

        if (allSymbols.length === 0) continue;

        let analyzed = 0;
        let skipped = 0;

        for (const symbol of allSymbols) {
            // 今天已有手动分析的跳过（不覆盖用户主动刷新的结果）
            const existing = await Analysis.findOne({
                userId, symbol, date: today, generatedBy: 'manual'
            }).lean();
            if (existing) { skipped++; continue; }

            try {
                await runStockAnalysis({ userId, symbol, riskTolerance, investmentGoal });
                analyzed++;
                console.log(`[daily-analysis] ${userId} ${symbol} done`);
            } catch (err) {
                console.error(`[daily-analysis] ${userId} ${symbol} error:`, err);
            }
        }

        results[userId] = { analyzed, skipped };
    }

    console.log('[daily-analysis] Complete:', JSON.stringify(results));
    return Response.json({ date: today, users: users.length, results });
}
