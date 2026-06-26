import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: ('S' | 'M' | 'L' | 'XL')[];
  inStock: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  sizes: { type: [String], enum: ['S', 'M', 'L', 'XL'], required: true },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Product = models.Product || model<IProduct>('Product', ProductSchema);
