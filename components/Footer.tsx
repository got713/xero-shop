import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/60 bg-stone-50 text-stone-600">
      
      {/* Brand benefits highlights bar */}
      <div className="border-b border-stone-200/50 bg-stone-100/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
            <div className="flex flex-col items-center p-2">
              <div className="mb-3 rounded-full bg-amber-100/80 p-3 text-primary-accent">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-stone-850">الدفع عند الاستلام</h3>
              <p className="mt-1 text-xs text-stone-500">ادفع نقداً فقط عندما تستلم طلبك وتتأكد من جودته</p>
            </div>
            
            <div className="flex flex-col items-center p-2">
              <div className="mb-3 rounded-full bg-amber-100/80 p-3 text-primary-accent">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-stone-850">راحة فائقة 100%</h3>
              <p className="mt-1 text-xs text-stone-500">منسوجة من أجود أنواع الحرير الطبيعي والقطن الناعم</p>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="mb-3 rounded-full bg-amber-100/80 p-3 text-primary-accent">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-stone-850">معاينة قبل الاستلام</h3>
              <p className="mt-1 text-xs text-stone-500">نسمح بفتح الطرد ومعاينته مع المندوب قبل الدفع</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* About Column */}
          <div className="space-y-4" id="about">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-stone-900 tracking-wider">XERO</span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-gold"></span>
            </div>
            <p className="text-sm leading-relaxed text-stone-500 max-w-xs">
              علامة تجارية متخصصة في ابتكار أرقى ملابس النوم والبيجامات الفاخرة المصنوعة بعناية لتنعم بنوم مريح وأسلوب حياة هادئ داخل منزلك.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-accent transition-colors duration-250">الصفحة الرئيسية</Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-primary-accent transition-colors duration-250">منتجاتنا</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary-accent transition-colors duration-250">سلة التسوق</Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm text-stone-500">
              <li>الدعم متوفر على مدار 24 ساعة</li>
              <li dir="ltr" className="text-right md:text-left">WhatsApp: +20 100 000 0000</li>
              <li>البريد الإلكتروني: support@xero.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-200/50 pt-8 text-center text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Xero Loungewear. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
