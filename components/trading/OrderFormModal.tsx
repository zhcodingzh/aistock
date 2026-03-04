'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { createOrder } from '@/lib/actions/order.actions';
import { toast } from 'sonner';

interface OrderFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    symbol?: string;
    onCreated: (order: OrderRecord) => void;
}

export default function OrderFormModal({
    open,
    onOpenChange,
    userId,
    symbol: symbolProp = '',
    onCreated,
}: OrderFormModalProps) {
    const { t } = useTranslation();
    const [type, setType] = useState<OrderType>('BUY');
    const [symbolInput, setSymbolInput] = useState('');
    const [shares, setShares] = useState('');
    const [price, setPrice] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const symbol = symbolProp || symbolInput.toUpperCase().trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol) { toast.error(t('trading_invalid_symbol')); return; }
        const s = parseFloat(shares);
        const p = parseFloat(price);
        if (isNaN(s) || s <= 0 || isNaN(p) || p <= 0) {
            toast.error(t('trading_invalid_shares_price'));
            return;
        }
        setLoading(true);
        try {
            const order = await createOrder({ userId, symbol, type, shares: s, price: p, date, note });
            toast.success(t('trading_order_added'));
            onCreated(order);
            onOpenChange(false);
            setShares('');
            setPrice('');
            setNote('');
            setSymbolInput('');
        } catch {
            toast.error(t('trading_add_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-[#0A0A0A] border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>
                        {symbolProp ? `${t('trading_add_order_title')} — ${symbolProp}` : t('trading_add_order_title')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {!symbolProp && (
                        <div className="grid gap-2">
                            <Label className="text-gray-400 text-sm">{t('trading_symbol_input')}</Label>
                            <Input
                                value={symbolInput}
                                onChange={e => setSymbolInput(e.target.value.toUpperCase())}
                                placeholder="AAPL"
                                className="bg-gray-900 border-gray-700 text-white font-mono uppercase"
                                required
                            />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label className="text-gray-400 text-sm">{t('order_type')}</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700 text-white">
                                <SelectItem value="BUY">{t('order_buy')}</SelectItem>
                                <SelectItem value="SELL">{t('order_sell')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label className="text-gray-400 text-sm">{t('order_qty')}</Label>
                            <Input
                                type="number"
                                step="0.0001"
                                min="0"
                                value={shares}
                                onChange={e => setShares(e.target.value)}
                                placeholder="100"
                                className="bg-gray-900 border-gray-700 text-white"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-gray-400 text-sm">{t('trading_price_usd')}</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="150.00"
                                className="bg-gray-900 border-gray-700 text-white"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-gray-400 text-sm">{t('order_date')}</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="bg-gray-900 border-gray-700 text-white"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-gray-400 text-sm">{t('trading_note_optional')}</Label>
                        <Input
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder={t('trading_note_placeholder')}
                            className="bg-gray-900 border-gray-700 text-white"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold h-10"
                    >
                        {loading ? t('trading_saving') : t('trading_add_order_title')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
