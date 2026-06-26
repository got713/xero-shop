'use server';

import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { Coupon } from '@/models/Coupon';
import { revalidatePath } from 'next/cache';

// Verify password
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.ADMIN_PASSWORD || 'xero123';
  return password === correctPassword;
}

// Order Actions
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    await connectDB();
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );
    
    if (!updatedOrder) {
      return { success: false, message: 'الطلب غير موجود.' };
    }

    revalidatePath('/admin');
    return { success: true, message: 'تم تحديث حالة الطلب بنجاح!' };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'حدث خطأ أثناء تحديث حالة الطلب.' };
  }
}

// Product Actions
export async function createProduct(data: {
  name: string;
  price: number;
  description: string;
  images: string[];
  sizes: ('S' | 'M' | 'L' | 'XL')[];
  inStock: boolean;
}) {
  try {
    if (!data.name || !data.price || !data.description || data.images.length === 0) {
      return { success: false, message: 'يرجى ملء كافة البيانات المطلوبة للمنتج.' };
    }

    await connectDB();
    await Product.create(data);

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'تم إضافة المنتج بنجاح!' };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return { success: false, message: 'حدث خطأ أثناء إضافة المنتج.' };
  }
}

export async function updateProduct(
  productId: string,
  data: {
    name?: string;
    price?: number;
    description?: string;
    images?: string[];
    sizes?: ('S' | 'M' | 'L' | 'XL')[];
    inStock?: boolean;
  }
) {
  try {
    await connectDB();
    const updated = await Product.findByIdAndUpdate(productId, data, { new: true });
    
    if (!updated) {
      return { success: false, message: 'المنتج غير موجود.' };
    }

    revalidatePath('/');
    revalidatePath(`/product/${productId}`);
    revalidatePath('/admin');
    return { success: true, message: 'تم تحديث المنتج بنجاح!' };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, message: 'حدث خطأ أثناء تحديث المنتج.' };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(productId);
    
    if (!deleted) {
      return { success: false, message: 'المنتج غير موجود بالفعل.' };
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'تم حذف المنتج بنجاح!' };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return { success: false, message: 'حدث خطأ أثناء حذف المنتج.' };
  }
}

// Coupon Actions
export async function createCoupon(data: {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}) {
  try {
    if (!data.code || !data.discountValue) {
      return { success: false, message: 'يرجى ملء جميع الحقول المطلوبة للكوبون.' };
    }

    await connectDB();
    
    // Check if code exists
    const uppercaseCode = data.code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: uppercaseCode });
    if (existing) {
      return { success: false, message: 'كود الخصم هذا مكرر وموجود بالفعل.' };
    }

    await Coupon.create({
      code: uppercaseCode,
      discountType: data.discountType,
      discountValue: data.discountValue,
      isActive: true
    });

    revalidatePath('/admin');
    return { success: true, message: 'تم إنشاء كود الخصم بنجاح!' };
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return { success: false, message: 'حدث خطأ أثناء إنشاء كود الخصم.' };
  }
}

export async function deleteCoupon(couponId: string) {
  try {
    await connectDB();
    const deleted = await Coupon.findByIdAndDelete(couponId);
    
    if (!deleted) {
      return { success: false, message: 'كوبون الخصم غير موجود بالفعل.' };
    }

    revalidatePath('/admin');
    return { success: true, message: 'تم حذف كود الخصم بنجاح!' };
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return { success: false, message: 'حدث خطأ أثناء حذف كود الخصم.' };
  }
}
