'use server';

import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';

export type CheckoutResponse = {
  success: boolean;
  message: string;
  orderId?: string;
};

export async function submitOrder(formData: {
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  items: { productId: string; size: 'S' | 'M' | 'L' | 'XL'; quantity: number }[];
}): Promise<CheckoutResponse> {
  try {
    // Validations
    if (!formData.customerName || !formData.phone || !formData.governorate || !formData.address) {
      return { success: false, message: 'يرجى إدخال جميع البيانات المطلوبة لعنوان الشحن.' };
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

    // Recalculate price from DB and check stock
    for (const item of formData.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return { success: false, message: `أحد المنتجات المطلوبة غير متوفر في المتجر حالياً.` };
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
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Save order details to MongoDB
    const newOrder = await Order.create({
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      governorate: formData.governorate,
      address: formData.address.trim(),
      items: mappedItems,
      totalPrice: calculatedTotalPrice,
      status: 'pending',
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
