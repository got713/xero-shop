'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';

interface ProductDetailClientProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    sizes: ('S' | 'M' | 'L' | 'XL')[];
    inStock: boolean;
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  const mainImage = product.images[0] || '/images/placeholder.png';

  const handleAddToCart = () => {
    if (!selectedSize) {
      setErrorMsg('يرجى اختيار المقاس أولاً');
      return;
    }
    setErrorMsg(null);

    // Add to cart context
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: mainImage,
      size: selectedSize,
      quantity: quantity
    });

    // Show temporary success feedback toast
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setErrorMsg('يرجى اختيار المقاس أولاً');
      return;
    }
    setErrorMsg(null);

    // Add to cart
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: mainImage,
      size: selectedSize,
      quantity: quantity
    });

    // Redirect directly to checkout
    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    if (!selectedSize) {
      setErrorMsg('يرجى اختيار المقاس أولاً');
      return;
    }
    setErrorMsg(null);

    const message = `مرحباً Xero، أود طلب طقم بيجامة "${product.name}" بمقاس (${selectedSize}) وبكمية (${quantity}). السعر: ${product.price * quantity} ج.م.`;
    const whatsappUrl = `https://wa.me/201000000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-md rounded-xl bg-emerald-600 p-4 text-white shadow-xl flex items-center justify-between animate-slideIn">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-semibold">تمت إضافة المنتج إلى السلة بنجاح!</p>
          </div>
          <button 
            onClick={() => setSuccessToast(false)}
            className="text-white hover:text-stone-200 text-xs underline font-medium"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Breadcrumb path */}
      <div className="mb-8 flex items-center gap-2 text-xs text-stone-500 font-medium">
        <a href="/" className="hover:text-primary-accent transition-colors">الرئيسية</a>
        <span>/</span>
        <a href="/#products" className="hover:text-primary-accent transition-colors">ملابس النوم</a>
        <span>/</span>
        <span className="text-stone-850 truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main product display grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        
        {/* Product Image Section */}
        <div className="lg:col-span-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-stone-50 border border-stone-200/40">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                <span className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white">
                  غير متوفر حالياً
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Customizer & Checkout Actions */}
        <div className="lg:col-span-6 flex flex-col justify-start text-right space-y-6">
          
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl lg:text-4xl leading-tight">
              {product.name}
            </h1>
            
            {/* Price Tag */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-black text-stone-950">
                {product.price.toLocaleString('ar-EG')} ج.م
              </span>
              <span className="rounded-full bg-amber-100/70 px-3 py-1 text-xs font-semibold text-primary-accent">
                شحن مجاني
              </span>
            </div>
          </div>

          <div className="border-t border-stone-200/60 pt-6">
            <p className="text-sm leading-relaxed text-stone-600">
              {product.description}
            </p>
          </div>

          {/* Size Selector */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-stone-800">المقاس المطلوب:</span>
              <span className="text-xs text-stone-400">دليل المقاسات القياسية</span>
            </div>
            
            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold mb-2 flex items-center gap-1">
                ⚠️ {errorMsg}
              </p>
            )}

            <div className="flex gap-3">
              {['S', 'M', 'L', 'XL'].map((size) => {
                const isAvailable = product.sizes.includes(size as any);
                const isSelected = selectedSize === size;
                
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable || !product.inStock}
                    onClick={() => {
                      setSelectedSize(size as any);
                      setErrorMsg(null);
                    }}
                    className={`h-12 w-16 flex items-center justify-center rounded-xl text-sm font-bold border transition-all duration-200
                      ${!isAvailable || !product.inStock 
                        ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed line-through' 
                        : isSelected
                          ? 'border-primary-accent bg-primary-accent text-white shadow-sm ring-1 ring-primary-accent'
                          : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:text-stone-950 active:scale-95'
                      }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="pt-2">
            <span className="block text-sm font-bold text-stone-800 mb-3">الكمية:</span>
            <div className="flex items-center border border-stone-300 rounded-xl max-w-[140px] h-12 overflow-hidden bg-white">
              <button
                type="button"
                onClick={decrementQty}
                disabled={!product.inStock}
                className="w-11 h-full flex items-center justify-center text-stone-500 hover:bg-stone-50 text-xl font-medium active:bg-stone-100 disabled:opacity-50"
              >
                −
              </button>
              <span className="flex-1 text-center font-bold text-stone-800 text-sm select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={incrementQty}
                disabled={!product.inStock}
                className="w-11 h-full flex items-center justify-center text-stone-500 hover:bg-stone-50 text-xl font-medium active:bg-stone-100 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Checkout Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              disabled={!product.inStock}
              onClick={handleBuyNow}
              className="flex-grow inline-flex h-13 items-center justify-center rounded-xl bg-stone-900 text-sm font-bold text-white hover:bg-primary-accent transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              شراء الآن (الدفع عند الاستلام)
            </button>
            <button
              type="button"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              className="flex-grow inline-flex h-13 items-center justify-center rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-700 hover:bg-stone-50 transition-all duration-300 active:scale-95 disabled:bg-stone-100 disabled:text-stone-300 disabled:border-stone-200 disabled:cursor-not-allowed"
            >
              أضف إلى السلة
            </button>
          </div>

          {/* WhatsApp Order Button */}
          <div className="pt-2">
            <button
              key="whatsapp-btn"
              type="button"
              disabled={!product.inStock}
              onClick={handleWhatsAppOrder}
              className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all duration-300 active:scale-95 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.161.001 6.132 1.233 8.368 3.468 2.237 2.236 3.467 5.207 3.466 8.369C23.69 18.367 18.365 23.69 11.83 23.69c-2.001-.001-3.974-.51-5.74-1.488L0 24zm6.49-3.988c1.69.999 3.511 1.527 5.372 1.528 5.751 0 10.43-4.677 10.433-10.43.001-2.787-1.082-5.405-3.053-7.377C17.328 1.761 14.712.678 11.926.678c-5.753 0-10.43 4.677-10.433 10.43-.001 2.008.528 3.969 1.532 5.679L1.936 21.65l5.033-1.321h-.422zM17.472 14.3c-.31-.156-1.84-.908-2.12-.1-1.1-.384-.298-.82-.41-.989-.117-.168-.023-.31.047-.47.07-.155.61-.75.92-1.117.31-.367.62-.647.78-.979.155-.333.08-.624-.047-.78-.125-.156-1.1-2.656-1.5-3.64-.4-.988-.813-.85-1.1-.864-.234-.014-.5-.015-.76-.015-.26 0-.689.1-.1.52.41 1.1 1.34 2.87 2.87 3.73.533.3 1.053.486 1.417.6.533.17 1.017.147 1.4.09.43-.064 1.336-.547 1.524-1.078.188-.53.188-.988.13-1.08-.058-.09-.234-.146-.54-.3z"/>
              </svg>
              طلب مباشر عبر الواتساب
            </button>
          </div>

          {/* Collapsible Details / Accordion */}
          <div className="border-t border-stone-200/60 pt-6 mt-6 space-y-4">
            <details className="group" open>
              <summary className="flex items-center justify-between cursor-pointer list-none py-2 text-stone-850 hover:text-stone-950">
                <span className="text-sm font-bold">الخامات وتفاصيل الصنع</span>
                <span className="transition group-open:rotate-180 text-stone-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-2 text-xs leading-relaxed text-stone-500 space-y-2">
                <p>• تصميم مريح للغاية ملائم للاستخدام اليومي والنوم الهادئ.</p>
                <p>• خامات عضوية طبيعية قابلة للتنفس ومقاومة للحساسية.</p>
                <p>• سهولة الغسيل والتنظيف دون تراجع الجودة أو بهتان الألوان.</p>
              </div>
            </details>
          </div>

        </div>

      </div>
    </div>
  );
}
