import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import ProductDetailClient from '@/components/ProductDetailClient';
import mongoose from 'mongoose';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  
  if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
    return {
      title: 'المنتج غير موجود | Xero',
      description: 'المنتج الذي تبحث عنه غير متوفر أو ربما يكون تم إزالته.',
    };
  }

  try {
    await connectDB();
    const product = await Product.findById(resolvedParams.id);
    if (!product) {
      return {
        title: 'المنتج غير موجود | Xero',
        description: 'المنتج الذي تبحث عنه غير متوفر.',
      };
    }
    return {
      title: `${product.name} | Xero`,
      description: product.description.substring(0, 160),
    };
  } catch (error) {
    return {
      title: 'المنتج | Xero',
    };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  // Verify if it is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
    return <ProductNotFound />;
  }

  await connectDB();
  const rawProduct = await Product.findById(resolvedParams.id);

  if (!rawProduct) {
    return <ProductNotFound />;
  }

  // Convert to plain serializable JS object
  const product = JSON.parse(JSON.stringify(rawProduct));

  return <ProductDetailClient product={product} />;
}

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="mb-6 inline-flex rounded-full bg-amber-50 p-6 text-primary-accent border border-amber-100">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-extrabold text-stone-900">هذا المنتج غير متوفر</h2>
      <p className="mt-3 text-sm text-stone-500">
        عذراً، يبدو أن هذا المنتج قد تم إزالته من المتجر أو أن الرابط غير صحيح. يمكنك استكشاف منتجاتنا الأخرى المميزة.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-primary-accent transition-all duration-300"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
