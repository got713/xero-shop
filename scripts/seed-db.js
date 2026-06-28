const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Define Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  sizes: { type: [String], enum: ['S', 'M', 'L', 'XL'], required: true },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Define Coupon Schema
const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

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

async function seedDatabase() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('\x1b[31m%s\x1b[0m', '❌ خطأ: لم يتم العثور على ملف .env.local في المجلد الرئيسي للمشروع.');
    console.log('يرجى إنشاء ملف باسم .env.local ووضع متغير MONGODB_URI بداخله.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI\s*=\s*([^\r\n]+)/);

  if (!uriMatch) {
    console.error('\x1b[31m%s\x1b[0m', '❌ خطأ: لم يتم العثور على متغير MONGODB_URI داخل ملف .env.local.');
    process.exit(1);
  }

  const uri = uriMatch[1].trim().replace(/['"]/g, ''); // Clean quotes

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
    console.log('🔌 تم الاتصال بقاعدة البيانات بنجاح...');

    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 جاري إضافة المنتجات الافتراضية...');
      await Product.insertMany(seedProducts);
      console.log('✅ تم إضافة المنتجات بنجاح.');
    } else {
      console.log(`⚠️ قاعدة البيانات تحتوي بالفعل على ${count} منتج. تم تخطي إضافة المنتجات.`);
    }

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('🌱 جاري إضافة كوبون الخصم الافتراضي XERO10...');
      await Coupon.create({
        code: 'XERO10',
        discountType: 'percentage',
        discountValue: 10,
        isActive: true
      });
      console.log('✅ تم إضافة الكوبون بنجاح.');
    } else {
      console.log(`⚠️ قاعدة البيانات تحتوي بالفعل على كوبونات. تم تخطي إضافة الكوبون.`);
    }

    await mongoose.connection.close();
    console.log('👋 تم الانتهاء وإغلاق الاتصال بنجاح.');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء تغذية قاعدة البيانات:', error);
    process.exit(1);
  }
}

seedDatabase();
