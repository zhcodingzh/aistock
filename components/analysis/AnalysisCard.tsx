'use client';

import { useState, useTransition } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { requestAnalysis } from '@/lib/actions/analysis.actions';
import { toast } from 'sonner';

interface AnalysisCardProps {
    userId: string;
    symbol: string;
    analysis: AnalysisRecord | null;
    compact?: boolean; // true = just the badge (for watchlist row)
}

const SIGNAL_COLORS: Record<AnalysisSignal, string> = {
    BUY: 'bg-green-900/50 text-green-400 border-green-800',
    SELL: 'bg-red-900/50 text-red-400 border-red-800',
    HOLD: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
};

const SIGNAL_ICONS: Record<AnalysisSignal, React.ReactNode> = {
    BUY: <TrendingUp className="h-3.5 w-3.5" />,
    SELL: <TrendingDown className="h-3.5 w-3.5" />,
    HOLD: <Minus className="h-3.5 w-3.5" />,
};

const ACTION_LABELS_KEY: Record<AnalysisAction, string> = {
    ADD: 'ai_action_add',
    REDUCE: 'ai_action_reduce',
    CLOSE: 'ai_action_close',
    HOLD: 'ai_action_hold',
    BUY_NEW: 'ai_action_buy_new',
    WATCH: 'ai_action_watch',
};

export default function AnalysisCard({ userId, symbol, analysis, compact = false }: AnalysisCardProps) {
    const { t, locale } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [localAnalysis, setLocalAnalysis] = useState<AnalysisRecord | null>(analysis);

    const handleRefresh = () => {
        startTransition(async () => {
            try {
                await requestAnalysis(userId, symbol, locale);
                toast.success(t('ai_refreshing'));
                // Poll for result after 15 seconds
                setTimeout(async () => {
                    const { getAnalysis } = await import('@/lib/actions/analysis.actions');
                    const fresh = await getAnalysis(userId, symbol);
                    if (fresh) setLocalAnalysis(fresh);
                }, 15000);
            } catch {
                toast.error('Failed to request analysis');
            }
        });
    };

    // Compact mode: just the signal badge (for watchlist row)
    if (compact) {
        if (!localAnalysis) return (
            <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-600 px-2" onClick={handleRefresh} disabled={isPending}>
                {isPending ? '...' : t('ai_refresh')}
            </Button>
        );
        return (
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${SIGNAL_COLORS[localAnalysis.signal]}`}>
                {SIGNAL_ICONS[localAnalysis.signal]}
                {t(`ai_signal_${localAnalysis.signal.toLowerCase()}` as any)}
            </span>
        );
    }

    // Full card mode
    if (!localAnalysis) return (
        <div className="bg-gray-900 rounded-xl p-5 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-white">{symbol}</p>
                <p className="text-xs text-gray-600 mt-1">{t('ai_no_analysis')}</p>
                <p className="text-xs text-gray-700">{t('ai_no_analysis_hint')}</p>
            </div>
            <Button size="sm" variant="outline" className="border-gray-700 text-gray-400 hover:text-white gap-1.5" onClick={handleRefresh} disabled={isPending}>
                <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
                {isPending ? t('ai_refreshing') : t('ai_refresh')}
            </Button>
        </div>
    );

    const a = localAnalysis;
    const updatedTime = new Date(a.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white text-lg">{symbol}</span>
                    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full border ${SIGNAL_COLORS[a.signal]}`}>
                        {SIGNAL_ICONS[a.signal]}
                        {t(`ai_signal_${a.signal.toLowerCase()}` as any)}
                    </span>
                    <span className="text-xs text-gray-500">{t(`ai_confidence_${a.confidence.toLowerCase()}` as any)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{t('ai_last_updated')} {updatedTime}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-600 hover:text-white" onClick={handleRefresh} disabled={isPending}>
                        <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Quick summary */}
            <div className="px-5 pb-3">
                <p className="text-sm text-gray-300">{a.oneWeekOutlook}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    {a.targetPrice && <span>{t('ai_target_price')}: <span className="text-green-400 font-mono">${a.targetPrice.toFixed(2)}</span></span>}
                    {a.stopLoss && <span>{t('ai_stop_loss')}: <span className="text-red-400 font-mono">${a.stopLoss.toFixed(2)}</span></span>}
                    {a.positionWeight > 0 && <span>{t('ai_position_weight')}: <span className="text-gray-300">{a.positionWeight.toFixed(1)}%</span></span>}
                    <span className="ml-auto text-yellow-600 font-medium">{t(ACTION_LABELS_KEY[a.action] as any)}</span>
                </div>
            </div>

            {/* Expand button */}
            <button
                className="w-full px-5 py-2 text-xs text-gray-600 hover:text-gray-400 flex items-center justify-center gap-1 border-t border-gray-800"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? <><ChevronUp className="h-3.5 w-3.5" />{t('ai_collapse')}</> : <><ChevronDown className="h-3.5 w-3.5" />{t('ai_expand')}</>}
            </button>

            {/* Expanded full report */}
            {expanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-4">
                    <Section title={t('ai_three_month')} text={a.threeMonthOutlook} />
                    <Section title={t('ai_technical')} text={a.technicalSummary} />
                    <Section title={t('ai_fundamental')} text={a.fundamentalSummary} />
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t('ai_news')}</p>
                        <div className="flex items-center gap-2">
                            <SentimentBadge sentiment={a.newsSentiment} t={t} />
                            <p className="text-xs text-gray-400">{a.newsSummary}</p>
                        </div>
                    </div>
                    {a.personalAdvice && <Section title={t('ai_personal')} text={a.personalAdvice} highlight />}
                    <Section title={t('ai_risk')} text={a.riskWarning} danger />
                    <p className="text-[10px] text-gray-700 pt-2 border-t border-gray-800">{t('ai_disclaimer')}</p>
                </div>
            )}
        </div>
    );
}

function Section({ title, text, highlight, danger }: { title: string; text: string; highlight?: boolean; danger?: boolean }) {
    return (
        <div>
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
            <p className={`text-xs ${danger ? 'text-orange-400' : highlight ? 'text-yellow-300' : 'text-gray-300'}`}>{text}</p>
        </div>
    );
}

function SentimentBadge({ sentiment, t }: { sentiment: NewsSentiment; t: (k: any) => string }) {
    const map: Record<NewsSentiment, string> = {
        POSITIVE: 'text-green-400',
        NEUTRAL: 'text-gray-400',
        NEGATIVE: 'text-red-400',
    };
    return (
        <span className={`text-xs font-bold shrink-0 ${map[sentiment]}`}>
            {t(`ai_sentiment_${sentiment.toLowerCase()}` as any)}
        </span>
    );
}
