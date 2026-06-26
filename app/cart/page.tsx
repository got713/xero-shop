'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, cartTotal, isLoaded } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <p className="text-stone-500">جاري تحميل السلة...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-stone-900 mb-8 text-right">سلة المشتريات</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200/50 rounded-3xl p-8 max-w-lg mx-auto">
          <div className="mb-6 inline-flex rounded-full bg-amber-50 p-6 text-primary-accent border border-amber-100/60">
            <svg className="h-12 w-12 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-900">سلة التسوق فارغة</h2>
          <p className="mt-2 text-stone-500 text-sm">
            يبدو أنك لم تقم بإضافة أي ملابس نوم أو بيجامات إلى سلتك بعد.
          </p>
          <div className="mt-8">
            <Link
              href="/#products"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-primary-accent transition-all duration-300 active:scale-95"
            >
              تصفح منتجاتنا الآن
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Cart Items List (RTL: takes right side) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex items-center gap-4 bg-white border border-stone-200/50 rounded-2xl p-4 text-right transition-all duration-200 hover:border-stone-300"
              >
                {/* Thumbnail */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-50 border border-stone-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover object-center"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-bold text-stone-850 truncate hover:text-primary-accent">
                    <Link href={`/product/${item.productId}`}>{item.name}</Link>
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 font-medium">
                    <span>
                      المقاس: <span className="font-bold text-stone-700">{item.size}</span>
                    </span>
                    <span>•</span>
                    <span>
                      سعر القطعة: {item.price.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>

                  {/* Quantity and Action Buttons for Mobile */}
                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 h-8">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-stone-500 hover:bg-stone-100 text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-stone-700">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="w-8 h-full flex items-center justify-center text-stone-500 hover:bg-stone-100 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="text-sm font-bold text-stone-900 sm:hidden">
                      {(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                </div>

                {/* Subtotal & Delete for Desktop */}
                <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                  <span className="text-base font-extrabold text-stone-950">
                    {(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-xs text-rose-600 font-semibold hover:text-rose-800 transition-colors"
                  >
                    إزالة
                  </button>
                </div>

                {/* Mobile Delete Button */}
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.size)}
                  className="sm:hidden text-rose-500 p-1 hover:text-rose-700 focus:outline-none shrink-0"
                  aria-label="إزالة المنتج"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>

              </div>
            ))}
          </div>

          {/* Checkout Info Sidebar (RTL: takes left side) */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-stone-200/50 bg-stone-50 p-6 text-right">
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-4 mb-4">
                ملخص الطلب
              </h2>

              <div className="space-y-3 text-sm font-medium text-stone-600">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="text-stone-850 font-semibold">
                    {cartTotal.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>الشحن والتوصيل</span>
                  <span className="text-emerald-600 font-bold">مجاني لفترة محدودة</span>
                </div>
                
                <div className="border-t border-stone-200/60 pt-4 flex justify-between text-base font-extrabold text-stone-950">
                  <span>الإجمالي الكلي</span>
                  <span>{cartTotal.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              {/* Payment disclaimer */}
              <div className="mt-6 flex gap-2.5 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-100/50">
                <svg className="h-5 w-5 shrink-0 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="leading-relaxed">
                  <strong>طريقة الدفع المتوفرة:</strong> الدفع عند الاستلام (كاش أو محفظة إلكترونية للمندوب). يمكنك فتح ومعاينة الطرد قبل الدفع.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/checkout"
                  className="w-full flex h-12 items-center justify-center rounded-xl bg-stone-900 text-sm font-bold text-white hover:bg-primary-accent transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                >
                  الذهاب لإتمام الشراء كزائر
                </Link>
                <Link
                  href="/#products"
                  className="w-full flex h-12 items-center justify-center mt-3 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                >
                  متابعة التسوق
                </Link>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
