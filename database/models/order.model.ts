import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface IOrder extends Document {
    userId: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    shares: number;
    price: number;
    date: Date;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true, trim: true, index: true },
        type: { type: String, enum: ['BUY', 'SELL'], required: true },
        shares: { type: Number, required: true, min: 0 },
        price: { type: Number, required: true, min: 0 },
        date: { type: Date, required: true },
        note: { type: String, default: '' },
    },
    { timestamps: true }
);

export const Order: Model<IOrder> = (models?.Order as Model<IOrder>) || model<IOrder>('Order', OrderSchema);
