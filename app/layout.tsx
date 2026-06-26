import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Load Cairo Google Font
const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Xero | بيجامات وملابس نوم فاخرة بأعلى جودة',
  description: 'تسوقي الآن تشكيلة ملابس النوم والبيجامات الحريرية والقطنية الفاخرة من Xero. الدفع عند الاستلام مع إمكانية فتح ومعاينة الشحنة قبل الدفع والشحن لكل المحافظات.',
  keywords: 'بيجامات, ملابس نوم, لانجري, ملابس مريحة, حرير طبيعي, قطن مصري, الدفع عند الاستلام',
  authors: [{ name: 'Xero Loungewear' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiasedScroll`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased">
        <CartProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
