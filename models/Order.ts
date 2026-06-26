import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  size: 'S' | 'M' | 'L' | 'XL';
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  size: { type: String, enum: ['S', 'M', 'L', 'XL'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const OrderSchema = new Schema<IOrder>({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  governorate: { type: String, required: true },
  address: { type: String, required: true },
  items: { type: [OrderItemSchema], required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Order = models.Order || model<IOrder>('Order', OrderSchema);
