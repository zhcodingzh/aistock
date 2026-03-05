import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface IAnalysis extends Document {
    // Market analysis (shared per symbol+date)
    symbol: string;
    date: string; // "2026-03-05"
    signal: 'BUY' | 'SELL' | 'HOLD';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    oneWeekOutlook: string;
    threeMonthOutlook: string;
    technicalSummary: string;
    fundamentalSummary: string;
    newsSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    newsSummary: string;
    riskWarning: string;
    targetPrice: number | null;
    stopLoss: number | null;
    // Personal analysis (per user+symbol+date)
    userId: string;
    personalAdvice: string;
    positionWeight: number;
    action: 'ADD' | 'REDUCE' | 'CLOSE' | 'HOLD' | 'BUY_NEW' | 'WATCH';
    generatedBy: 'scheduled' | 'manual';
    updatedAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
    {
        symbol: { type: String, required: true, uppercase: true, trim: true },
        date: { type: String, required: true },
        signal: { type: String, enum: ['BUY', 'SELL', 'HOLD'], required: true },
        confidence: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
        oneWeekOutlook: { type: String, default: '' },
        threeMonthOutlook: { type: String, default: '' },
        technicalSummary: { type: String, default: '' },
        fundamentalSummary: { type: String, default: '' },
        newsSentiment: { type: String, enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'], default: 'NEUTRAL' },
        newsSummary: { type: String, default: '' },
        riskWarning: { type: String, default: '' },
        targetPrice: { type: Number, default: null },
        stopLoss: { type: Number, default: null },
        userId: { type: String, required: true, index: true },
        personalAdvice: { type: String, default: '' },
        positionWeight: { type: Number, default: 0 },
        action: { type: String, enum: ['ADD', 'REDUCE', 'CLOSE', 'HOLD', 'BUY_NEW', 'WATCH'], required: true },
        generatedBy: { type: String, enum: ['scheduled', 'manual'], default: 'scheduled' },
    },
    { timestamps: true }
);

// Unique per user+symbol+date
AnalysisSchema.index({ userId: 1, symbol: 1, date: 1 }, { unique: true });

export const Analysis: Model<IAnalysis> =
    (models?.Analysis as Model<IAnalysis>) || model<IAnalysis>('Analysis', AnalysisSchema);
