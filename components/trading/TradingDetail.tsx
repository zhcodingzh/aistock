'use client';

import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import AdvancedChart from './AdvancedChart';
import PositionSummary from './PositionSummary';
import OrdersTable from './OrdersTable';
import OrderFormModal from './OrderFormModal';
import ImportModal from './ImportModal';

interface TradingDetailProps {
    userId: string;
    symbol: string;
    position: PositionInfo;
    orders: OrderRecord[];
    onOrdersChange: (orders: OrderRecord[]) => void;
}

export default function TradingDetail({
    userId,
    symbol,
    position,
    orders,
    onOrdersChange,
}: TradingDetailProps) {
    const { t } = useTranslation();
    const [addOpen, setAddOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

    const handleOrderCreated = (order: OrderRecord) => {
        onOrdersChange([order, ...orders]);
    };

    const handleOrderDeleted = (id: string) => {
        onOrdersChange(orders.filter(o => o._id !== id));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h2 className="text-xl font-bold font-mono text-white">{symbol}</h2>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 gap-1.5"
                        onClick={() => setImportOpen(true)}
                    >
                        <Upload className="h-3.5 w-3.5" />
                        {t('trading_import_csv_btn')}
                    </Button>
                    <Button
                        size="sm"
                        className="bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold gap-1.5"
                        onClick={() => setAddOpen(true)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {t('add_order')}
                    </Button>
                </div>
            </div>

            <AdvancedChart symbol={symbol} />

            <div className="border-t border-gray-800">
                <PositionSummary position={position} />
            </div>

            <div className="border-t border-gray-800 flex-1">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-400">{t('orders_list')}</h3>
                    <span className="text-xs text-gray-600">{orders.length} {t('trading_records')}</span>
                </div>
                <OrdersTable orders={orders} onDeleted={handleOrderDeleted} />
            </div>

            <OrderFormModal
                open={addOpen}
                onOpenChange={setAddOpen}
                userId={userId}
                symbol={symbol}
                onCreated={handleOrderCreated}
            />
            <ImportModal
                open={importOpen}
                onOpenChange={setImportOpen}
                userId={userId}
                onImported={() => {
                    setImportOpen(false);
                    window.location.reload();
                }}
            />
        </div>
    );
}
