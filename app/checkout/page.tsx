'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import { submitOrder } from '@/actions/checkout';

const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'القليوبية',
  'الدقهلية',
  'الشرقية',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, isLoaded } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [address, setAddress] = useState('');

  // States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <p className="text-stone-500 font-medium">جاري التحميل...</p>
      </div>
    );
  }

  // Handle successful order layout
  if (placedOrderId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mb-6 inline-flex rounded-full bg-emerald-50 p-6 text-emerald-600 border border-emerald-100">
          <svg className="h-12 w-12 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-stone-900">شكراً لطلبك!</h2>
        <p className="mt-3 text-stone-600 text-sm leading-relaxed">
          تم تسجيل طلبك بنجاح في متجر <strong>Xero</strong>. سنقوم بالتواصل معك هاتفياً أو عبر الـ WhatsApp خلال 24 ساعة لتأكيد موعد الشحن.
        </p>
        
        <div className="mt-8 bg-stone-50 border border-stone-200/60 rounded-2xl p-6 text-right space-y-3">
          <h3 className="text-sm font-bold text-stone-850 border-b border-stone-200 pb-2.5">تفاصيل الطلب:</h3>
          <div className="flex justify-between text-xs font-semibold text-stone-500">
            <span>رقم الطلب (ID):</span>
            <span className="text-stone-800 font-mono select-all">{placedOrderId}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-stone-500">
            <span>الاسم:</span>
            <span className="text-stone-850">{customerName}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-stone-500">
            <span>المحافظة:</span>
            <span className="text-stone-850">{governorate}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-stone-500">
            <span>الإجمالي المطلوب:</span>
            <span className="text-stone-950 font-bold">{cartTotal.toLocaleString('ar-EG')} ج.م (الدفع عند الاستلام)</span>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-stone-900 px-8 text-sm font-bold text-white hover:bg-primary-accent transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
          >
            العودة للتسوق
          </Link>
        </div>
      </div>
    );
  }

  // Handle case where cart is empty before checking out
  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900">سلتك فارغة</h2>
        <p className="mt-2 text-stone-500 text-sm">
          يرجى إضافة بيجامات نوم إلى السلة أولاً لتتمكن من إتمام الطلب.
        </p>
        <div className="mt-8">
          <Link
            href="/#products"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-6 text-sm font-semibold text-white hover:bg-primary-accent transition-all"
          >
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !phone.trim() || !governorate || !address.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    startTransition(async () => {
      const mappedItems = cart.map((i) => ({
        productId: i.productId,
        size: i.size,
        quantity: i.quantity,
      }));

      const res = await submitOrder({
        customerName,
        phone,
        governorate,
        address,
        items: mappedItems,
      });

      if (res.success && res.orderId) {
        setPlacedOrderId(res.orderId);
        // Clear local cart
        clearCart();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-stone-900 mb-8 text-right">إتمام الطلب</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        
        {/* Checkout Form (RTL: right side) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 text-right bg-white border border-stone-200/50 rounded-3xl p-6 sm:p-8">
          
          <h2 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
            بيانات الشحن والتوصيل (الدفع عند الاستلام)
          </h2>

          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-700">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Full Name input */}
          <div className="space-y-2">
            <label htmlFor="customerName" className="block text-xs font-bold text-stone-700">
              الاسم الكامل باللغة العربية *
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: أحمد محمد علي"
              required
              disabled={isPending}
              className="w-full h-12 rounded-xl border border-stone-300 px-4 text-sm font-medium focus:border-primary-accent focus:ring-1 focus:ring-primary-accent focus:outline-none transition-colors bg-white disabled:bg-stone-50"
            />
          </div>

          {/* Phone Number input */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-xs font-bold text-stone-700">
              رقم الهاتف المحمول (لتأكيد الشحن) *
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 01012345678"
              required
              disabled={isPending}
              className="w-full h-12 rounded-xl border border-stone-300 px-4 text-sm font-medium focus:border-primary-accent focus:ring-1 focus:ring-primary-accent focus:outline-none transition-colors bg-white disabled:bg-stone-50"
            />
            <p className="text-[10px] text-stone-400">سوف نقوم بالتواصل معك على هذا الرقم لتأكيد عنوان الشحن قبل خروج المندوب.</p>
          </div>

          {/* Governorate dropdown */}
          <div className="space-y-2">
            <label htmlFor="governorate" className="block text-xs font-bold text-stone-700">
              المحافظة *
            </label>
            <select
              id="governorate"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              required
              disabled={isPending}
              className="w-full h-12 rounded-xl border border-stone-300 px-4 text-sm font-medium focus:border-primary-accent focus:ring-1 focus:ring-primary-accent focus:outline-none transition-colors bg-white disabled:bg-stone-50 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[left_0.75rem_center] bg-no-repeat pl-10"
            >
              <option value="" disabled>اختر المحافظة</option>
              {EGYPTIAN_GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Detailed Address textarea */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-xs font-bold text-stone-700">
              العنوان بالتفصيل (اسم الشارع، رقم العمارة، رقم الشقة) *
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: شارع التسعين الشمالي، عمارة 15، شقة 3، التجمع الخامس"
              required
              rows={3}
              disabled={isPending}
              className="w-full rounded-xl border border-stone-300 p-4 text-sm font-medium focus:border-primary-accent focus:ring-1 focus:ring-primary-accent focus:outline-none transition-colors bg-white disabled:bg-stone-50"
            />
          </div>

          {/* Confirm Button */}
          <div className="pt-4 border-t border-stone-100">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex h-13 items-center justify-center rounded-xl bg-stone-900 text-sm font-bold text-white hover:bg-primary-accent transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جاري إرسال الطلب...
                </span>
              ) : (
                `تأكيد الطلب (${cartTotal.toLocaleString('ar-EG')} ج.م) والدفع عند الاستلام`
              )}
            </button>
          </div>

        </form>

        {/* Order Items Breakdown Sidebar (RTL: left side) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-stone-200/50 bg-stone-50 p-6 text-right space-y-4">
            
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
              المنتجات المطلوبة ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>

            {/* List of Cart Items inside checkout summary */}
            <div className="divide-y divide-stone-200/60 max-h-60 overflow-y-auto no-scrollbar">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100 border border-stone-200/40">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-stone-850 truncate">{item.name}</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      المقاس: <span className="font-semibold text-stone-600">{item.size}</span> | الكمية: <span className="font-semibold text-stone-600">{item.quantity}</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-stone-800 shrink-0">
                    {(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-stone-200 pt-4 space-y-2 text-xs font-semibold text-stone-500">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span className="text-stone-850 font-bold">{cartTotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>الشحن والتوصيل</span>
                <span className="text-emerald-600 font-bold">مجاني لفترة محدودة</span>
              </div>
              <div className="border-t border-stone-200/60 pt-3 flex justify-between text-sm font-black text-stone-900">
                <span>المبلغ الإجمالي</span>
                <span>{cartTotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
