'use server';

import { connectDB } from '@/lib/db';
import { Coupon } from '@/models/Coupon';

export type CouponValidationResponse = {
  success: boolean;
  message: string;
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
};

export async function validateCouponCode(code: string): Promise<CouponValidationResponse> {
  try {
    if (!code || code.trim() === '') {
      return { success: false, message: 'كود الخصم غير صالح.' };
    }

    await connectDB();
    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return { success: false, message: 'كود الخصم غير موجود أو انتهت صلاحيته.' };
    }

    return {
      success: true,
      message: 'تم تطبيق كود الخصم بنجاح!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { success: false, message: 'حدث خطأ أثناء التحقق من كود الخصم.' };
  }
}

// Helper to seed a sample coupon
export async function seedSampleCoupon() {
  try {
    await connectDB();
    const existing = await Coupon.findOne({ code: 'XERO10' });
    if (!existing) {
      await Coupon.create({
        code: 'XERO10',
        discountType: 'percentage',
        discountValue: 10,
        isActive: true
      });
      console.log('Seeded sample coupon XERO10');
    }
  } catch (error) {
    console.error('Failed to seed sample coupon:', error);
  }
}
