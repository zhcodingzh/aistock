'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Analysis } from '@/database/models/analysis.model';
import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

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

export async function requestAnalysis(userId: string, symbol: string): Promise<void> {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user as any;

    const reqHeaders = await headers();
    const host = reqHeaders.get('host') ?? 'localhost:3000';
    const protocol = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${protocol}://${host}`;
    await fetch(`${baseUrl}/api/analysis/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            symbol: symbol.toUpperCase(),
            riskTolerance: user?.riskTolerance ?? 'Medium',
            investmentGoal: user?.investmentGoals ?? 'Growth',
        }),
    });
}
