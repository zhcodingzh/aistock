import { RSI, MACD, BollingerBands, SMA } from 'technicalindicators';

export type TechnicalSignals = {
    rsi: number | null;
    rsiSignal: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
    macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    macdHistogram: number | null;
    priceVsMa20: 'ABOVE' | 'BELOW' | 'AT';
    priceVsMa50: 'ABOVE' | 'BELOW' | 'AT';
    priceVsMa200: 'ABOVE' | 'BELOW' | 'AT';
    bbPosition: 'UPPER' | 'LOWER' | 'MIDDLE';
    todayGapPct: number | null; // % gap from yesterday close to today open
    todayVolRatio: number | null; // today volume / avg volume
};

export function calculateIndicators(
    closes: number[],
    volumes: number[],
    todayCloses: number[],
    todayVolumes: number[]
): TechnicalSignals {
    const currentPrice = closes[closes.length - 1];

    // RSI
    let rsi: number | null = null;
    let rsiSignal: TechnicalSignals['rsiSignal'] = 'NEUTRAL';
    if (closes.length >= 15) {
        const rsiVals = RSI.calculate({ values: closes, period: 14 });
        rsi = rsiVals[rsiVals.length - 1] ?? null;
        if (rsi !== null) {
            rsiSignal = rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL';
        }
    }

    // MACD
    let macdSignal: TechnicalSignals['macdSignal'] = 'NEUTRAL';
    let macdHistogram: number | null = null;
    if (closes.length >= 27) {
        const macdVals = MACD.calculate({
            values: closes,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });
        const last = macdVals[macdVals.length - 1];
        const prev = macdVals[macdVals.length - 2];
        if (last?.histogram !== undefined) {
            macdHistogram = last.histogram;
            if (last.histogram > 0 && prev?.histogram !== undefined && last.histogram > prev.histogram) {
                macdSignal = 'BULLISH';
            } else if (last.histogram < 0 && prev?.histogram !== undefined && last.histogram < prev.histogram) {
                macdSignal = 'BEARISH';
            }
        }
    }

    // Moving Averages
    const positionVsMa = (period: number): TechnicalSignals['priceVsMa20'] => {
        if (closes.length < period) return 'AT';
        const maVals = SMA.calculate({ period, values: closes });
        const ma = maVals[maVals.length - 1];
        if (!ma) return 'AT';
        const diff = ((currentPrice - ma) / ma) * 100;
        if (diff > 1) return 'ABOVE';
        if (diff < -1) return 'BELOW';
        return 'AT';
    };

    // Bollinger Bands
    let bbPosition: TechnicalSignals['bbPosition'] = 'MIDDLE';
    if (closes.length >= 20) {
        const bbVals = BollingerBands.calculate({ period: 20, stdDev: 2, values: closes });
        const bb = bbVals[bbVals.length - 1];
        if (bb) {
            if (currentPrice >= bb.upper * 0.99) bbPosition = 'UPPER';
            else if (currentPrice <= bb.lower * 1.01) bbPosition = 'LOWER';
        }
    }

    // Today's gap and volume ratio
    let todayGapPct: number | null = null;
    let todayVolRatio: number | null = null;
    const yesterdayClose = closes[closes.length - 2];
    if (todayCloses.length > 0 && yesterdayClose) {
        const todayOpen = todayCloses[0];
        todayGapPct = ((todayOpen - yesterdayClose) / yesterdayClose) * 100;
    }
    if (todayVolumes.length > 0 && volumes.length >= 20) {
        const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
        const todayVol = todayVolumes.reduce((a, b) => a + b, 0);
        todayVolRatio = avgVol > 0 ? todayVol / avgVol : null;
    }

    return {
        rsi,
        rsiSignal,
        macdSignal,
        macdHistogram,
        priceVsMa20: positionVsMa(20),
        priceVsMa50: positionVsMa(50),
        priceVsMa200: positionVsMa(200),
        bbPosition,
        todayGapPct,
        todayVolRatio,
    };
}
