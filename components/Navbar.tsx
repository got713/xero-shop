'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export default function Navbar() {
  const { cartCount, isLoaded } = useCart();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Set mounted status to handle client-side rendering safely
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-white/85 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus:outline-none"
              aria-label="القائمة الرئيسية"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex space-x-reverse space-x-8 text-sm font-medium text-stone-600">
            <Link href="/" className="hover:text-primary-accent transition-colors duration-200">
              الرئيسية
            </Link>
            <Link href="/#products" className="hover:text-primary-accent transition-colors duration-200">
              ملابس النوم
            </Link>
            <a href="#about" className="hover:text-primary-accent transition-colors duration-200">
              قصتنا
            </a>
          </nav>

          {/* Logo (Centered on mobile, right-aligned on desktop) */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-widest text-stone-950 group-hover:text-primary-accent transition-colors duration-300">
                XERO
              </span>
              <span className="h-2 w-2 rounded-full bg-primary-gold animate-pulse"></span>
            </Link>
          </div>

          {/* Cart Icon */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-stone-700 hover:text-primary-accent transition-colors duration-200"
              aria-label="سلة المشتريات"
            >
              <svg
                className="h-6 w-6 stroke-[1.8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {mounted && isLoaded && cartCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-accent text-[10px] font-bold text-white ring-2 ring-white animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 animate-fadeIn">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            الرئيسية
          </Link>
          <Link
            href="/#products"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            ملابس النوم
          </Link>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            قصتنا
          </a>
        </div>
      )}
    </header>
  );
}
