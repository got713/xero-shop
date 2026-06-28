import { connectDB } from './db';
import { Product } from '@/models/Product';
import { Coupon } from '@/models/Coupon';

const seedProducts = [
  {
    name: 'طقم بيجامة الحرير الفاخر (Xero Silk)',
    price: 1850,
    description: 'طقم بيجامة حريرية ناعمة وفاخرة، منسوجة من الحرير الطبيعي 100% ليمنحك شعوراً بالانسيابية والراحة الفائقة أثناء النوم. يتميز بأزرار أمامية أنيقة وقصة مريحة وتفاصيل مطرزة يدوياً.',
    images: ['/images/silk-cream.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    colorVariations: [
      { colorName: 'كريمي', colorHex: '#f5ebe0', images: ['/images/silk-cream.png'] },
      { colorName: 'ذهبي فاخر', colorHex: '#d4af37', images: ['/images/silk-cream.png'] }
    ],
    reviews: [
      { reviewerName: 'مي أحمد', rating: 5, comment: 'رائعة جداً وخامتها ناعمة ومريحة في النوم، أنصح بها بشدة!', createdAt: new Date() },
      { reviewerName: 'سارة محمد', rating: 5, comment: 'البيجامة أنيقة جداً وتغليفها شيك والتوصيل سريع.', createdAt: new Date() }
    ]
  },
  {
    name: 'طقم ملابس النوم الكتان الصيفي (Linen Loungewear)',
    price: 1450,
    description: 'طقم كاجوال خفيف من الكتان العضوي الفاخر بفتحات تهوية طبيعية، مثالي للأيام الحارة والاسترخاء المنزلي. خامة ناعمة على البشرة تمتص الرطوبة وتدوم طويلاً مع أكمام واسعة.',
    images: ['/images/linen-gray.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    colorVariations: [
      { colorName: 'رمادي داكن', colorHex: '#4a4a4a', images: ['/images/linen-gray.png'] },
      { colorName: 'أوف وايت', colorHex: '#faf9f6', images: ['/images/linen-gray.png'] }
    ],
    reviews: [
      { reviewerName: 'أحمد علي', rating: 4, comment: 'المقاس مضبوط بالظبط وخامة الكتان ممتازة في الصيف.', createdAt: new Date() }
    ]
  },
  {
    name: 'بيجامة قطن كلاسيك وردي (Cotton Classic)',
    price: 1200,
    description: 'بيجامة نوم كلاسيكية بأزرار أمامية وجيب علوي، مصنوعة بالكامل من القطن المصري طويل التيلة الفاخر. توفر نعومة فائقة ودفء متوازن طوال العام مع حزام خصر مرن ومريح.',
    images: ['/images/cotton-rose.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    colorVariations: [
      { colorName: 'وردي ناعم', colorHex: '#ffb3c1', images: ['/images/cotton-rose.png'] },
      { colorName: 'أبيض قطني', colorHex: '#ffffff', images: ['/images/cotton-rose.png'] }
    ],
    reviews: [
      { reviewerName: 'نورا حسن', rating: 5, comment: 'القطن ناعم جداً ومريحة للارتداء اليومي.', createdAt: new Date() }
    ]
  },
  {
    name: 'طقم شتوي مخملي دافئ (Cozy Waffle Fleece)',
    price: 1600,
    description: 'طقم بيجامة شتوية من الصوف المخملي بنقشة الوافل. خامة سميكة وناعمة للغاية تحتفظ بحرارة الجسم لتوفير أقصى درجات الدفء في الليالي الباردة مع ياقة مرتفعة وتصميم عصري.',
    images: ['/images/waffle-beige.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    colorVariations: [
      { colorName: 'بيج دافئ', colorHex: '#d8c3a5', images: ['/images/waffle-beige.png'] },
      { colorName: 'بني شوكولاتة', colorHex: '#5c4033', images: ['/images/waffle-beige.png'] }
    ],
    reviews: [
      { reviewerName: 'رنا يوسف', rating: 5, comment: 'تدفئ بشكل ممتاز وملمسها ناعم جداً مثل المخمل.', createdAt: new Date() }
    ]
  },
];

export async function seedDatabase() {
  try {
    await connectDB();
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Seeding database with default pajama products...');
      await Product.insertMany(seedProducts);
      console.log('Seeding completed successfully!');
    } else {
      // If products exist, let's verify if they have colorVariations and reviews. If not, we can optionally clear and reseed or update.
      // For simplicity, during testing, we'll keep them as is, but advise clear database or reseed.
    }
    
    // Seed default coupon
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('Seeding database with default promo coupon XERO10...');
      await Coupon.create({
        code: 'XERO10',
        discountType: 'percentage',
        discountValue: 10,
        isActive: true
      });
      console.log('Seeding coupon completed successfully!');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
