'use server';

import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { Coupon } from '@/models/Coupon';
import { SHIPPING_FEES, getShippingFee } from '@/lib/shipping';

export type CheckoutResponse = {
  success: boolean;
  message: string;
  orderId?: string;
};

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// دالة الأوتوميشن لإرسال التنبيه الفوري لـ تليجرام
async function sendTelegramAlert(orderData: {
  customerName: string;
  phone: string;
  address: string;
  governorate: string;
  items: { name: string; size: string; color?: string; quantity: number }[];
  shippingCost: number;
  totalPrice: number;
}) {
  let itemsDetail = '';
  if (orderData.items.length === 1) {
    const item = orderData.items[0];
    const colorPart = item.color ? ` (${item.color})` : '';
    itemsDetail = `• المنتج: ${item.name}${colorPart}\n• المقاس: ${item.size}\n• الكمية: ${item.quantity}`;
  } else {
    itemsDetail = orderData.items.map(item => {
      const colorPart = item.color ? ` (${item.color})` : '';
      return `• المنتج: ${item.name}${colorPart} | المقاس: ${item.size} | الكمية: ${item.quantity}`;
    }).join('\n');
  }

  const message = `
🛍️ **طلب جديد في متجر Xero!**
━━━━━━━━━━━━━━━━━━
👤 **العميل:** ${orderData.customerName}
📞 **الهاتف:** ${orderData.phone}
📍 **العنوان:** ${orderData.address} (${orderData.governorate})

📦 **تفاصيل الطلب:**
${itemsDetail}

💰 **الحساب:**
• تكلفة الشحن: ${orderData.shippingCost} ج.م
• إجمالي الفاتورة: ${orderData.totalPrice} ج.م
━━━━━━━━━━━━━━━━━━
⚙️ *حالة الطلب: معلق (قيد المراجعة)*
  `.trim();

  const cleanToken = BOT_TOKEN?.trim();
  const cleanChatId = CHAT_ID?.trim();

  if (!cleanToken || !cleanChatId) {
    console.error("❌ خطأ تليجرام: لم يتم العثور على TELEGRAM_BOT_TOKEN أو TELEGRAM_CHAT_ID في ملف البيئة .env.local");
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const telegramData = await response.json();
    console.log("Telegram Actual Response:", telegramData);

    if (!response.ok) {
      console.error(`❌ فشل إرسال تنبيه تليجرام. كود الحالة: ${response.status}`);
    } else {
      console.log("✅ تم إرسال تنبيه تليجرام بنجاح!");
    }
  } catch (error: any) {
    console.error("❌ فشل إرسال تنبيه تليجرام بسبب خطأ اتصال الشبكة:", error.message || error);
    console.log("👉 ملاحظة: إذا كنت في مصر، فقد تكون خدمات تليجرام محجوبة على شبكتك المحلية (ISP Block) وتتطلب VPN للتشغيل محلياً، لكنها ستعمل بشكل طبيعي فور النشر على Vercel.");
  }
}

export async function submitOrder(formData: {
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  items: { productId: string; size: 'S' | 'M' | 'L' | 'XL'; color?: string; quantity: number }[];
  couponCode?: string;
}): Promise<CheckoutResponse> {
  try {
    // Basic fields validation
    if (!formData.customerName || !formData.phone || !formData.governorate || !formData.address) {
      return { success: false, message: 'يرجى ملء جميع الحقول المطلوبة لعنوان الشحن.' };
    }

    if (formData.customerName.trim().length < 3) {
      return { success: false, message: 'يرجى كتابة الاسم بالكامل بشكل صحيح.' };
    }

    if (formData.phone.trim().length < 8) {
      return { success: false, message: 'يرجى كتابة رقم هاتف صحيح لكي يتمكن المندوب من التواصل معك.' };
    }

    if (!formData.items || formData.items.length === 0) {
      return { success: false, message: 'سلة المشتريات فارغة. يرجى إضافة منتجات أولاً.' };
    }

    await connectDB();

    const mappedItems = [];
    let calculatedTotalPrice = 0;

    // Fetch and check products and sizes
    for (const item of formData.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return { success: false, message: 'أحد المنتجات المطلوبة غير متوفر في المتجر حالياً.' };
      }
      
      if (!product.inStock) {
        return { success: false, message: `المنتج "${product.name}" نفذت كميته للتو.` };
      }

      const lineTotal = product.price * item.quantity;
      calculatedTotalPrice += lineTotal;

      mappedItems.push({
        productId: product._id,
        name: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Calculate Shipping Fee
    const shippingFee = getShippingFee(formData.governorate);

    // Calculate Coupon Discount
    let discountAmount = 0;
    let appliedCode = '';

    if (formData.couponCode && formData.couponCode.trim() !== '') {
      const cleanCode = formData.couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      
      if (coupon) {
        appliedCode = coupon.code;
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((calculatedTotalPrice * coupon.discountValue) / 100);
        } else {
          discountAmount = Math.min(coupon.discountValue, calculatedTotalPrice);
        }
      }
    }

    // Calculate Grand Total
    const grandTotal = calculatedTotalPrice + shippingFee - discountAmount;

    // Create Order Document in MongoDB
    const newOrder = await Order.create({
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      governorate: formData.governorate,
      address: formData.address.trim(),
      items: mappedItems,
      totalPrice: calculatedTotalPrice,
      shippingFee,
      discountAmount,
      couponCode: appliedCode,
      grandTotal,
      status: 'pending',
    });

    // Send Telegram Alert (awaited to ensure request completes on server actions)
    await sendTelegramAlert({
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      address: newOrder.address,
      governorate: newOrder.governorate,
      items: mappedItems,
      shippingCost: shippingFee,
      totalPrice: grandTotal,
    });

    return {
      success: true,
      message: 'تم تسجيل طلبك بنجاح وسنتواصل معك قريباً لتأكيد الشحن!',
      orderId: newOrder._id.toString(),
    };
  } catch (error: any) {
    console.error('Error in submitOrder Server Action:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ غير متوقع أثناء حفظ الطلب. يرجى المحاولة لاحقاً.',
    };
  }
}
