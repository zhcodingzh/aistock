'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteOrder } from '@/lib/actions/order.actions';
import { toast } from 'sonner';

interface OrdersTableProps {
    orders: OrderRecord[];
    onDeleted: (orderId: string) => void;
}

export default function OrdersTable({ orders, onDeleted }: OrdersTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this order?')) return;
        setDeletingId(id);
        try {
            await deleteOrder(id);
            onDeleted(id);
            toast.success('Order deleted');
        } catch {
            toast.error('Failed to delete order');
        } finally {
            setDeletingId(null);
        }
    };

    if (orders.length === 0) {
        return <p className="text-gray-600 text-sm p-4">No orders yet.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-xs">
                        <th className="text-left px-4 py-2">Date</th>
                        <th className="text-left px-4 py-2">Type</th>
                        <th className="text-right px-4 py-2">Shares</th>
                        <th className="text-right px-4 py-2">Price</th>
                        <th className="text-right px-4 py-2">Total</th>
                        <th className="text-left px-4 py-2">Note</th>
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
                                    {o.type}
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
