'use client'

import React from 'react'
import Link from "next/link";
import {usePathname} from "next/navigation";
import SearchCommand from "@/components/SearchCommand";
import { useTranslation } from '@/lib/i18n/LanguageContext';

const NAV_KEYS = [
    { href: '/', key: 'nav_dashboard' },
    { href: '/search', key: 'nav_search' },
    { href: '/watchlist', key: 'nav_watchlist' },
    { href: '/trading', key: 'nav_trading' },
    { href: '/ai-analysis', key: 'ai_nav' },
] as const;

const NavItems = ({initialStocks}: { initialStocks: StockWithWatchlistStatus[]}) => {
    const pathname = usePathname();
    const { t } = useTranslation();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    }

    return (
        <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
            {NAV_KEYS.map(({href, key}) => {
                if (href === '/search') return (
                    <li key="search-trigger">
                        <SearchCommand renderAs="text" label={t(key)} initialStocks={initialStocks} />
                    </li>
                )
                return (
                    <li key={href}>
                        <Link href={href} className={`hover:text-teal-500 transition-colors ${isActive(href) ? 'text-gray-100' : ''}`}>
                            {t(key)}
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}
export default NavItems
