'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface AdvancedChartProps {
    symbol: string;
}

export default function AdvancedChart({ symbol }: AdvancedChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { locale } = useTranslation();

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous widget
        containerRef.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: symbol,
            interval: 'D',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: locale === 'zh' ? 'zh_CN' : 'en',
            toolbar_bg: '#0a0a0a',
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: true,
            calendar: false,
            hide_volume: false,
            support_host: 'https://www.tradingview.com',
        });

        containerRef.current.appendChild(script);
    }, [symbol, locale]);

    return (
        <div className="tradingview-widget-container w-full h-[500px]" ref={containerRef} />
    );
}
