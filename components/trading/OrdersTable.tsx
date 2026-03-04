'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { deleteOrder } from '@/lib/actions/order.actions';
import { toast } from 'sonner';

interface OrdersTableProps {
    orders: OrderRecord[];
    onDeleted: (orderId: string) => void;
}

export default function OrdersTable({ orders, onDeleted }: OrdersTableProps) {
    const { t } = useTranslation();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm(t('trading_delete_confirm'))) return;
        setDeletingId(id);
        try {
            await deleteOrder(id);
            onDeleted(id);
            toast.success(t('trading_order_deleted'));
        } catch {
            toast.error(t('trading_delete_failed'));
        } finally {
            setDeletingId(null);
        }
    };

    if (orders.length === 0) {
        return <p className="text-gray-600 text-sm p-4">{t('trading_no_orders_empty')}</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-xs">
                        <th className="text-left px-4 py-2">{t('order_date')}</th>
                        <th className="text-left px-4 py-2">{t('order_type')}</th>
                        <th className="text-right px-4 py-2">{t('order_qty')}</th>
                        <th className="text-right px-4 py-2">{t('order_price')}</th>
                        <th className="text-right px-4 py-2">{t('trading_total_col')}</th>
                        <th className="text-left px-4 py-2">{t('trading_note')}</th>
                        <th className="px-4 py-2" />
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o._id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                            <td className="px-4 py-2 text-gray-400 font-mono text-xs">
                                {new Date(o.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    o.type === 'BUY'
                                        ? 'bg-green-900/50 text-green-400'
                                        : 'bg-red-900/50 text-red-400'
                                }`}>
                                    {o.type === 'BUY' ? t('order_buy') : t('order_sell')}
                                </span>
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-gray-200">{o.shares}</td>
                            <td className="px-4 py-2 text-right font-mono text-gray-200">${o.price.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-mono text-gray-300 font-medium">
                                ${(o.shares * o.price).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-gray-500 text-xs max-w-[120px] truncate">{o.note}</td>
                            <td className="px-4 py-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-600 hover:text-red-400"
                                    onClick={() => handleDelete(o._id)}
                                    disabled={deletingId === o._id}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
