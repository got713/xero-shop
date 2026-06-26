import { connectDB } from './db';
import { Product } from '@/models/Product';

const seedProducts = [
  {
    name: 'طقم بيجامة الحرير الفاخر (Xero Silk)',
    price: 1850,
    description: 'طقم بيجامة حريرية ناعمة وفاخرة، منسوجة من الحرير الطبيعي 100% ليمنحك شعوراً بالانسيابية والراحة الفائقة أثناء النوم. يتميز بأزرار أمامية أنيقة وقصة مريحة وتفاصيل مطرزة يدوياً.',
    images: ['/images/silk-cream.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    name: 'طقم ملابس النوم الكتان الصيفي (Linen Loungewear)',
    price: 1450,
    description: 'طقم كاجوال خفيف من الكتان العضوي الفاخر بفتحات تهوية طبيعية، مثالي للأيام الحارة والاسترخاء المنزلي. خامة ناعمة على البشرة تمتص الرطوبة وتدوم طويلاً مع أكمام واسعة.',
    images: ['/images/linen-gray.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    name: 'بيجامة قطن كلاسيك وردي (Cotton Classic)',
    price: 1200,
    description: 'بيجامة نوم كلاسيكية بأزرار أمامية وجيب علوي، مصنوعة بالكامل من القطن المصري طويل التيلة الفاخر. توفر نعومة فائقة ودفء متوازن طوال العام مع حزام خصر مرن ومريح.',
    images: ['/images/cotton-rose.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    name: 'طقم شتوي مخملي دافئ (Cozy Waffle Fleece)',
    price: 1600,
    description: 'طقم بيجامة شتوية من الصوف المخملي بنقشة الوافل. خامة سميكة وناعمة للغاية تحتفظ بحرارة الجسم لتوفير أقصى درجات الدفء في الليالي الباردة مع ياقة مرتفعة وتصميم عصري.',
    images: ['/images/waffle-beige.png'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
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
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
