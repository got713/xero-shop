import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IReview {
  reviewerName: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: Date;
}

export interface IColorVariation {
  colorName: string; // e.g. "كريمي"
  colorHex?: string;  // e.g. "#fdfbf7"
  images: string[];  // images specific to this color variation
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[]; // default/fallback images
  sizes: ('S' | 'M' | 'L' | 'XL')[];
  inStock: boolean;
  colorVariations: IColorVariation[];
  reviews: IReview[];
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  reviewerName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ColorVariationSchema = new Schema<IColorVariation>({
  colorName: { type: String, required: true },
  colorHex: { type: String },
  images: { type: [String], required: true }
});

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  sizes: { type: [String], enum: ['S', 'M', 'L', 'XL'], required: true },
  inStock: { type: Boolean, default: true },
  colorVariations: { type: [ColorVariationSchema], default: [] },
  reviews: { type: [ReviewSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const Product = models.Product || model<IProduct>('Product', ProductSchema);
