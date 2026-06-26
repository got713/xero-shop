import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { seedDatabase } from '@/lib/seed';
import ProductCard from '@/components/ProductCard';

export const revalidate = 0; // Dynamic rendering

export default async function HomePage() {
  // Ensure the database is seeded with mock pajamas if empty
  await seedDatabase();
  
  // Fetch products from database
  await connectDB();
  const rawProducts = await Product.find({}).sort({ createdAt: -1 });
  
  // Convert Mongoose documents to plain JS objects for Next.js serialization
  const products = rawProducts.map((p) => JSON.parse(JSON.stringify(p)));

  return (
    <div className="flex flex-col w-full">
      
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-orange-50/30 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Hero Copy (RTL) */}
            <div className="lg:col-span-7 flex flex-col space-y-6 text-right animate-fadeIn">
              <span className="inline-flex max-w-max items-center gap-1.5 rounded-full bg-amber-100/70 px-3 py-1 text-xs font-semibold text-primary-accent ring-1 ring-amber-250/20">
                تشكيلة صيف ٢٠٢٦ الفاخرة
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl leading-tight">
                أناقة هادئة <br />
                <span className="text-primary-accent font-black">لليالٍ حالمة مريحة</span>
              </h1>
              <p className="text-base text-stone-600 sm:text-lg max-w-2xl leading-relaxed">
                اكتشفي تشكيلة ملابس النوم والبيجامات الفاخرة من <span className="font-semibold text-stone-950">Xero</span>. 
                مصنوعة بالكامل من الحرير الطبيعي والقطن العضوي البارد لتمنحك الراحة الفائقة التي تستحقينها طوال الليل.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-stone-500 font-medium pt-2">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  الدفع عند الاستلام (COD)
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  معاينة الشحنة قبل الدفع
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  توصيل سريع لكل المحافظات
                </span>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="#products"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-stone-900 px-8 text-sm font-semibold text-white hover:bg-primary-accent transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                >
                  تسوقي التشكيلة الآن
                </Link>
                <a
                  href="#about"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-300 bg-white px-8 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-all duration-300 active:scale-95"
                >
                  اقرئي قصتنا
                </a>
              </div>
            </div>

            {/* Hero Image Block */}
            <div className="lg:col-span-5 relative aspect-square sm:aspect-[4/3] lg:aspect-[5/6] overflow-hidden rounded-3xl bg-amber-50 shadow-inner flex items-center justify-center">
              {/* Show the primary cream silk pajama as the hero model image */}
              <Image
                src="/images/silk-cream.png"
                alt="Xero Loungewear Hero"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center transform hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute bottom-4 right-4 left-4 bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/50 text-right">
                <p className="text-xs font-semibold text-primary-accent">الأكثر مبيعاً</p>
                <h4 className="text-sm font-bold text-stone-900">طقم بيجامة الحرير الطبيعي الناعم</h4>
                <p className="text-xs text-stone-600 mt-1">اشعري بالنعومة والانسيابية الفائقة</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Showcase Grid Section */}
      <section id="products" className="py-20 lg:py-28 ScrollAnchor">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
              مجموعتنا المختارة
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-primary-gold"></div>
            <p className="mt-4 text-sm text-stone-500">
              بيجامات نوم وملابس منزلية مصممة بأعلى معايير الخياطة لنضمن لك الراحة والنعومة طوال الليل والنهار.
            </p>
          </div>

          {/* Grid Layout (2 columns on mobile, 3 on tablet, 4 on desktop) */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500">جاري تحميل المنتجات...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
