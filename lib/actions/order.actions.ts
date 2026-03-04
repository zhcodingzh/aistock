'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Order } from '@/database/models/order.model';
import { revalidatePath } from 'next/cache';

export async function createOrder(params: CreateOrderParams): Promise<OrderRecord> {
    await connectToDatabase();
    const order = await Order.create({
        ...params,
        date: new Date(params.date),
    });
    revalidatePath('/trading');
    return JSON.parse(JSON.stringify(order));
}

export async function getUserOrders(userId: string): Promise<OrderRecord[]> {
    await connectToDatabase();
    const orders = await Order.find({ userId }).sort({ date: -1 });
    return JSON.parse(JSON.stringify(orders));
}

export async function getOrdersBySymbol(userId: string, symbol: string): Promise<OrderRecord[]> {
    await connectToDatabase();
    const orders = await Order.find({ userId, symbol: symbol.toUpperCase() }).sort({ date: -1 });
    return JSON.parse(JSON.stringify(orders));
}

export async function deleteOrder(orderId: string): Promise<void> {
    await connectToDatabase();
    await Order.findByIdAndDelete(orderId);
    revalidatePath('/trading');
}

/**
 * Parse and import orders from CSV text.
 * Expected columns (header row required): date,symbol,type,shares,price,note
 * date: YYYY-MM-DD
 * type: BUY or SELL (case-insensitive)
 */
export async function importOrdersFromCsv(
    userId: string,
    csvText: string
): Promise<{ imported: number; errors: string[] }> {
    await connectToDatabase();

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idx = {
        date: header.indexOf('date'),
        symbol: header.indexOf('symbol'),
        type: header.indexOf('type'),
        shares: header.indexOf('shares'),
        price: header.indexOf('price'),
        note: header.indexOf('note'),
    };

    if (idx.date < 0 || idx.symbol < 0 || idx.type < 0 || idx.shares < 0 || idx.price < 0) {
        throw new Error('CSV missing required columns: date, symbol, type, shares, price');
    }

    const errors: string[] = [];
    const toInsert: CreateOrderParams[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map(c => c.trim());
        const rowNum = i + 1;

        const type = cols[idx.type]?.toUpperCase();
        if (type !== 'BUY' && type !== 'SELL') {
            errors.push(`Row ${rowNum}: type must be BUY or SELL, got "${cols[idx.type]}"`);
            continue;
        }

        const shares = parseFloat(cols[idx.shares]);
        const price = parseFloat(cols[idx.price]);
        if (isNaN(shares) || shares <= 0) {
            errors.push(`Row ${rowNum}: invalid shares "${cols[idx.shares]}"`);
            continue;
        }
        if (isNaN(price) || price <= 0) {
            errors.push(`Row ${rowNum}: invalid price "${cols[idx.price]}"`);
            continue;
        }

        const dateVal = new Date(cols[idx.date]);
        if (isNaN(dateVal.getTime())) {
            errors.push(`Row ${rowNum}: invalid date "${cols[idx.date]}"`);
            continue;
        }

        toInsert.push({
            userId,
            symbol: cols[idx.symbol]?.toUpperCase(),
            type: type as OrderType,
            shares,
            price,
            date: dateVal.toISOString(),
            note: idx.note >= 0 ? cols[idx.note] : '',
        });
    }

    if (toInsert.length > 0) {
        await Order.insertMany(toInsert.map(o => ({ ...o, date: new Date(o.date) })));
    }

    revalidatePath('/trading');
    return { imported: toInsert.length, errors };
}
