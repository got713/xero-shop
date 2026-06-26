const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function testConnection() {
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
  
  // Mask password for security logs
  const maskedUri = uri.replace(/:([^:@]+)@/, ':******@');
  console.log(`🔌 جاري محاولة الاتصال بقاعدة البيانات: ${maskedUri}`);

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    
    console.log('\x1b[32m%s\x1b[0m', '✅ نجاح: تم الاتصال بقاعدة البيانات السحابية MongoDB Atlas بنجاح كامل!');
    console.log('هذا يعني أن الرابط واسم المستخدم وكلمة المرور صحيحة تماماً.');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ فشل الاتصال:');
    
    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('\x1b[33m%s\x1b[0m', '👉 السبب: كلمة المرور أو اسم المستخدم غير صحيحين في الرابط.');
      console.log('يرجى مراجعة كلمة المرور في MongoDB Atlas وتحديثها كما هو موضح في دليل المساعدة.');
    } else if (error.message.includes('IP') || error.message.includes('timeout')) {
      console.error('\x1b[33m%s\x1b[0m', '👉 السبب: جدار الحماية (Firewall) في MongoDB Atlas يمنع الاتصال.');
      console.log('تأكد من تفعيل "ALLOW ACCESS FROM ANYWHERE (0.0.0.0/0)" في قسم Network Access.');
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testConnection();
