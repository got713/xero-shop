import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface ProductCardProps {
  product: {
    _id: any;
    name: string;
    price: number;
    images: string[];
    inStock: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const productId = product._id.toString();
  const mainImage = product.images[0] || '/images/placeholder.png';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200/50 p-3 transition-all duration-300 hover:shadow-lg hover:shadow-stone-100">
      
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-stone-100 relative">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="rounded-full bg-stone-800 px-3 py-1 text-xs font-semibold text-white">
              نفذت الكمية
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-4 flex flex-grow flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-800 group-hover:text-primary-accent transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-stone-400">ملابس نوم فاخرة</p>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-stone-900">
            {product.price.toLocaleString('ar-EG')} ج.م
          </span>
          
          <Link
            href={`/product/${productId}`}
            className="inline-flex items-center justify-center rounded-lg bg-stone-50 border border-stone-250 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-primary-accent hover:text-white hover:border-primary-accent transition-all duration-300 active:scale-95"
          >
            عرض المنتج
          </Link>
        </div>
      </div>

    </div>
  );
}
