'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import { submitOrder } from '@/actions/checkout';
import { SHIPPING_FEES, getShippingFee } from '@/lib/shipping';
import { validateCouponCode } from '@/actions/coupons';

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

  // Coupon States
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  
  // Placed Order Summary for success view
  const [finalSummary, setFinalSummary] = useState({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0
  });

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

  // Calculate costs dynamically on client
  const shippingFee = governorate ? getShippingFee(governorate) : 0;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, cartTotal);
    }
  }

  const grandTotal = cartTotal + shippingFee - discountAmount;

  // Handle Apply Coupon Click
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);
    setIsValidatingCoupon(true);

    try {
      const res = await validateCouponCode(couponInput);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponSuccess(`تم تطبيق الخصم بنجاح! كود (${res.coupon.code}) يمنحك خصم بقيمة ${res.coupon.discountType === 'percentage' ? `${res.coupon.discountValue}%` : `${res.coupon.discountValue} ج.م`}`);
      } else {
        setCouponError(res.message);
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('حدث خطأ أثناء فحص الكود.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Submit Order Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !phone.trim() || !governorate || !address.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة لعنوان الشحن.');
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
        couponCode: appliedCoupon?.code || undefined
      });

      if (res.success && res.orderId) {
        // Save final pricing metrics for display in success view
        setFinalSummary({
          subtotal: cartTotal,
          shipping: shippingFee,
          discount: discountAmount,
          total: grandTotal
        });
        setPlacedOrderId(res.orderId);
        
        // Clear local cart
        clearCart();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  // Success Layout Screen
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
          <h3 className="text-sm font-bold text-stone-850 border-b border-stone-200 pb-2.5">تفاصيل الحساب والشحن:</h3>
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
          
          <div className="border-t border-stone-200 pt-3 space-y-2 text-xs font-semibold text-stone-500">
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span className="text-stone-800">{finalSummary.subtotal.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span>تكلفة التوصيل:</span>
              <span className="text-stone-800">{finalSummary.shipping.toLocaleString('ar-EG')} ج.م</span>
            </div>
            {finalSummary.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>الخصم المطبق ({appliedCoupon?.code}):</span>
                <span>-{finalSummary.discount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            )}
            <div className="border-t border-stone-200/60 pt-2 flex justify-between text-sm font-black text-stone-900">
              <span>الإجمالي الكلي:</span>
              <span>{finalSummary.total.toLocaleString('ar-EG')} ج.م (الدفع عند الاستلام)</span>
            </div>
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

  // Cart Empty Screen
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

          {/* Full Name */}
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

          {/* Phone Number */}
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

          {/* Governorate Dropdown */}
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

          {/* Detailed Address */}
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
                `تأكيد الطلب (${grandTotal.toLocaleString('ar-EG')} ج.م) والدفع عند الاستلام`
              )}
            </button>
          </div>

        </form>

        {/* Order Items Breakdown Sidebar (RTL: left side) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Order Summary Box */}
          <div className="rounded-3xl border border-stone-200/50 bg-stone-50 p-6 text-right space-y-4">
            
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
              المنتجات المطلوبة ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>

            {/* List of Cart Items */}
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
                <span className="text-stone-850 font-bold">
                  {governorate ? `${shippingFee.toLocaleString('ar-EG')} ج.م` : 'اختر المحافظة'}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>الخصم ({appliedCoupon?.code})</span>
                  <span className="font-bold">-{discountAmount.toLocaleString('ar-EG')} ج.م</span>
                </div>
              )}
              <div className="border-t border-stone-200/60 pt-3 flex justify-between text-sm font-black text-stone-900">
                <span>المبلغ الإجمالي</span>
                <span>{grandTotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

            {/* Discount Coupon Code Form */}
            <div className="border-t border-stone-200/60 pt-4 space-y-2">
              <label htmlFor="coupon" className="block text-[11px] font-bold text-stone-700">كوبون الخصم</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="coupon"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="مثال: XERO10"
                  disabled={isValidatingCoupon || isPending}
                  className="flex-grow h-10 rounded-lg border border-stone-300 px-3 text-xs uppercase focus:outline-none focus:border-primary-accent bg-white disabled:bg-stone-50"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || isPending || !couponInput.trim()}
                  className="h-10 px-4 rounded-lg bg-stone-900 text-xs font-bold text-white hover:bg-primary-accent transition-colors disabled:bg-stone-300"
                >
                  {isValidatingCoupon ? '...' : 'تطبيق'}
                </button>
              </div>
              {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold">{couponSuccess}</p>}
              {couponError && <p className="text-[10px] text-rose-600 font-bold">{couponError}</p>}
            </div>

          </div>

          {/* Payment Method COD details */}
          <div className="rounded-3xl border border-stone-250/40 bg-amber-50/40 p-5 text-right flex gap-3 text-xs text-amber-800 border-amber-100/50">
            <svg className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="leading-relaxed">
              <strong>الدفع عند الاستلام (COD):</strong>
              <p className="mt-1 text-stone-600">يمكنك فتح ومعاينة ملابس النوم مع المندوب والتحقق من جودتها قبل سداد المبلغ نقداً.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
