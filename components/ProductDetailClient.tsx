'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { submitProductReview } from '@/actions/products';

interface ProductDetailClientProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    sizes: ('S' | 'M' | 'L' | 'XL')[];
    inStock: boolean;
    colorVariations?: { colorName: string; colorHex?: string; images: string[] }[];
    reviews?: { reviewerName: string; rating: number; comment: string; createdAt: Date | string }[];
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();

  // Color selection
  const hasColors = product.colorVariations && product.colorVariations.length > 0;
  const [selectedColor, setSelectedColor] = useState<{
    colorName: string;
    colorHex?: string;
    images: string[];
  } | null>(hasColors ? product.colorVariations![0] : null);

  // Active Images (depends on selected color, fallbacks to product images)
  const activeImages = selectedColor ? selectedColor.images : product.images;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mainImage = activeImages[activeImageIndex] || '/images/placeholder.png';

  // Size selection
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  // Size Guide Calculator Modal State
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [height, setHeight] = useState(170); // cm
  const [weight, setWeight] = useState(70);  // kg

  // Review Form States
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Dynamic Size Recommendation Logic
  const getRecommendedSize = (w: number, h: number): 'S' | 'M' | 'L' | 'XL' => {
    // Basic heuristic based on Egyptian pajama tailoring charts
    if (w < 58) return 'S';
    if (w >= 58 && w < 72) return 'M';
    if (w >= 72 && w < 86) return 'L';
    return 'XL';
  };

  const recommendedSize = getRecommendedSize(weight, height);

  const handleApplyRecommendedSize = () => {
    setSelectedSize(recommendedSize);
    setIsSizeGuideOpen(false);
    setErrorMsg(null);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setErrorMsg('يرجى اختيار المقاس أولاً');
      return;
    }
    setErrorMsg(null);

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: mainImage,
      size: selectedSize,
      color: selectedColor?.colorName,
      quantity: quantity
    });

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

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: mainImage,
      size: selectedSize,
      color: selectedColor?.colorName,
      quantity: quantity
    });

    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    if (!selectedSize) {
      setErrorMsg('يرجى اختيار المقاس أولاً');
      return;
    }
    setErrorMsg(null);

    const colorText = selectedColor ? ` بلون (${selectedColor.colorName})` : '';
    const message = `مرحباً Xero، أود طلب طقم بيجامة "${product.name}"${colorText} بمقاس (${selectedSize}) وبكمية (${quantity}). السعر: ${product.price * quantity} ج.م.`;
    const whatsappUrl = `https://wa.me/201000000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Submit Review Handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    if (!reviewerName.trim() || !comment.trim()) {
      setReviewError('يرجى ملء جميع حقول التقييم والاسم.');
      return;
    }

    startTransition(async () => {
      const res = await submitProductReview(product._id, {
        reviewerName,
        rating,
        comment
      });

      if (res.success) {
        setReviewSuccess(res.message);
        setReviewerName('');
        setComment('');
        setRating(5);
        router.refresh(); // Refresh page to show the new review
      } else {
        setReviewError(res.message);
      }
    });
  };

  // Calculate Average Rating
  const reviewsList = product.reviews || [];
  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
    : '0.0';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-md rounded-xl bg-stone-900 p-4 text-white shadow-xl flex items-center justify-between border border-stone-850 animate-slideIn">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        
        {/* Left Side: Product Image Section & Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-stone-50 border border-stone-200/40 shadow-sm">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center transition-all duration-300"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                <span className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white">
                  غير متوفر حالياً
                </span>
              </div>
            )}
          </div>

          {/* Multiple image thumbnails row */}
          {activeImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar justify-start">
              {activeImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white transition-all
                    ${activeImageIndex === idx 
                      ? 'border-primary-accent ring-1 ring-primary-accent shadow-sm' 
                      : 'border-stone-200 hover:border-stone-400'
                    }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} preview ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Customizer & Checkout Actions */}
        <div className="lg:col-span-6 flex flex-col justify-start text-right space-y-6">
          
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl lg:text-4xl leading-tight">
              {product.name}
            </h1>
            
            {/* Rating Stars and Price */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-stone-950">
                  {product.price.toLocaleString('ar-EG')} ج.م
                </span>
                <span className="rounded-full bg-amber-100/70 px-3 py-1 text-xs font-semibold text-primary-accent">
                  شحن مجاني
                </span>
              </div>

              {/* Stars Summary */}
              {reviewsList.length > 0 && (
                <div className="flex items-center gap-1.5" dir="ltr">
                  <span className="text-xs font-bold text-stone-500">({reviewsList.length} تقييم)</span>
                  <span className="text-sm font-black text-stone-850">{averageRating}</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className={`h-4.5 w-4.5 ${s <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-stone-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.49 10.1c-.772-.56-.373-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-stone-200/60 pt-6">
            <p className="text-sm leading-relaxed text-stone-600">
              {product.description}
            </p>
          </div>

          {/* Color Selector */}
          {hasColors && (
            <div className="pt-2">
              <span className="block text-sm font-bold text-stone-800 mb-3">اللون: <span className="text-stone-500 font-semibold">{selectedColor?.colorName}</span></span>
              <div className="flex gap-3">
                {product.colorVariations!.map((cv) => {
                  const isSelected = selectedColor?.colorName === cv.colorName;
                  return (
                    <button
                      key={cv.colorName}
                      type="button"
                      onClick={() => {
                        setSelectedColor(cv);
                        setActiveImageIndex(0);
                        setErrorMsg(null);
                      }}
                      title={cv.colorName}
                      className={`h-9 w-9 rounded-full border transition-all duration-200 flex items-center justify-center relative active:scale-95
                        ${isSelected 
                          ? 'border-primary-accent ring-2 ring-primary-accent ring-offset-2' 
                          : 'border-stone-300 hover:scale-105'
                        }`}
                      style={{ backgroundColor: cv.colorHex || '#cccccc' }}
                    >
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-stone-900 invert"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-stone-800">المقاس المطلوب:</span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs text-primary-accent font-bold hover:underline cursor-pointer"
              >
                📏 احسب مقاسك المناسب
              </button>
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
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
              طلب سريع عبر الواتساب
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

      {/* Interactive Size Guide Calculator Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-md p-6 sm:p-8 text-right space-y-6 animate-scaleIn">
            
            <div className="flex items-center justify-between border-b border-stone-150 pb-3">
              <h3 className="text-lg font-black text-stone-900">📏 حاسبة المقاس التفاعلية</h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-stone-400 hover:text-stone-750 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              
              {/* Weight Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-stone-700">
                  <span>{weight} كجم</span>
                  <span>الوزن الحالي:</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="130"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-stone-250 rounded-lg appearance-none cursor-pointer accent-primary-accent"
                />
              </div>

              {/* Height Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-stone-700">
                  <span>{height} سم</span>
                  <span>الطول الحالي:</span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full h-2 bg-stone-250 rounded-lg appearance-none cursor-pointer accent-primary-accent"
                />
              </div>

              {/* Recommendation result box */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/70 text-center space-y-2">
                <p className="text-xs font-semibold text-stone-500">المقاس المقترح والمناسب لراحتك هو:</p>
                <p className="text-3xl font-black text-primary-accent">{recommendedSize}</p>
                <p className="text-[10px] text-stone-400">
                  * تم اقتراح هذا المقاس ليعطيك حرية ومرونة وانسيابية مريحة للغاية أثناء الاسترخاء المنزلي والنوم.
                </p>
              </div>

            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={handleApplyRecommendedSize}
                className="flex-1 h-11 rounded-xl bg-stone-900 hover:bg-primary-accent text-white text-xs font-bold transition-all shadow-md"
              >
                تطبيق وتحديد المقاس ({recommendedSize})
              </button>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="h-11 px-5 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-all"
              >
                إلغاء
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Customer Reviews & Ratings Section */}
      <div className="border-t border-stone-200/70 mt-16 pt-12 text-right">
        <h2 className="text-xl font-black text-stone-900 mb-8">آراء وتقييمات العملاء</h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* Write a review form */}
          <form onSubmit={handleReviewSubmit} className="lg:col-span-5 bg-stone-50 border border-stone-200/50 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-stone-850 border-b border-stone-200 pb-2">كتابة مراجعة جديدة</h3>
            
            {reviewError && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[11px] font-semibold text-rose-700">
                ⚠️ {reviewError}
              </div>
            )}
            {reviewSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[11px] font-semibold text-emerald-700">
                ✅ {reviewSuccess}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="revName" className="block text-xs font-bold text-stone-700">الاسم الكامل *</label>
              <input
                type="text"
                id="revName"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="مثال: ياسمين ممدوح"
                required
                disabled={isPending}
                className="w-full h-10 rounded-xl border border-stone-300 px-3 text-xs bg-white focus:outline-none focus:border-primary-accent"
              />
            </div>

            {/* Rating Stars Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">التقييم *</label>
              <div className="flex gap-2 justify-start" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={isPending}
                    onClick={() => setRating(star)}
                    className="text-amber-400 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <svg className={`h-6 w-6 ${star <= rating ? 'fill-current' : 'text-stone-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.49 10.1c-.772-.56-.373-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="revComment" className="block text-xs font-bold text-stone-700">التعليق والملاحظات *</label>
              <textarea
                id="revComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب تجربتك الشخصية مع خامة ومقاس البيجامة..."
                required
                disabled={isPending}
                rows={3}
                className="w-full rounded-xl border border-stone-300 p-3 text-xs bg-white focus:outline-none focus:border-primary-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl bg-stone-900 hover:bg-primary-accent text-white text-xs font-bold transition-all disabled:bg-stone-300"
            >
              {isPending ? 'جاري الإرسال...' : 'إرسال المراجعة'}
            </button>
          </form>

          {/* Reviews list rendering */}
          <div className="lg:col-span-7 space-y-4">
            
            {reviewsList.length === 0 ? (
              <div className="bg-stone-50/50 rounded-3xl p-10 text-center border border-stone-150 text-stone-500 text-xs">
                لا توجد تقييمات لهذا المنتج بعد. كن أول من يكتب مراجعته!
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev, idx) => (
                  <div key={idx} className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-stone-400 font-semibold">
                        {new Date(rev.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                      <div className="flex gap-1 items-center">
                        <span className="font-bold text-xs text-stone-800">{rev.reviewerName}</span>
                        <div className="flex text-amber-400" dir="ltr">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`h-3.5 w-3.5 ${star <= rev.rating ? 'fill-current' : 'text-stone-200'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.49 10.1c-.772-.56-.373-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-stone-600">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
