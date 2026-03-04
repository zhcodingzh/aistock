'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { importOrdersFromCsv } from '@/lib/actions/order.actions';
import { toast } from 'sonner';

interface ImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    onImported: () => void;
}

const EXAMPLE_CSV = `date,symbol,type,shares,price,note
2024-01-15,AAPL,BUY,10,185.50,Initial position
2024-03-20,AAPL,BUY,5,172.00,Adding on dip
2024-06-10,AAPL,SELL,5,195.00,Taking profit`;

export default function ImportModal({ open, onOpenChange, userId, onImported }: ImportModalProps) {
    const { t, locale } = useTranslation();
    const [csvText, setCsvText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

    const handleImport = async () => {
        if (!csvText.trim()) {
            toast.error(t('trading_paste_csv_first'));
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await importOrdersFromCsv(userId, csvText);
            setResult(res);
            if (res.imported > 0) {
                const successMsg = locale === 'zh'
                    ? `成功导入 ${res.imported} 条`
                    : `Imported ${res.imported} orders`;
                toast.success(successMsg);
                onImported();
            }
            if (res.errors.length === 0) onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || t('trading_import_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] bg-[#0A0A0A] border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>{t('trading_import_title')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <p className="text-xs text-gray-500">
                        {t('trading_csv_required')} <code className="text-yellow-400">date, symbol, type, shares, price</code>
                        <br />{t('trading_csv_optional_label')} <code className="text-gray-400">note</code>
                    </p>

                    <button
                        className="text-xs text-yellow-500 hover:underline"
                        onClick={() => setCsvText(EXAMPLE_CSV)}
                        type="button"
                    >
                        {t('trading_load_example')}
                    </button>

                    <textarea
                        value={csvText}
                        onChange={e => setCsvText(e.target.value)}
                        rows={10}
                        placeholder={EXAMPLE_CSV}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-xs font-mono text-gray-200 placeholder:text-gray-700 resize-none focus:outline-none focus:border-yellow-500"
                    />

                    {result && result.errors.length > 0 && (
                        <div className="bg-red-900/20 border border-red-800 rounded p-3 space-y-1">
                            <p className="text-xs text-red-400 font-bold">{result.errors.length} {t('trading_errors_label')}</p>
                            {result.errors.map((e, i) => (
                                <p key={i} className="text-xs text-red-300">{e}</p>
                            ))}
                        </div>
                    )}

                    <Button
                        onClick={handleImport}
                        disabled={loading}
                        className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold h-10"
                    >
                        {loading ? t('trading_importing') : t('import_orders')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
