'use server';

import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    await connectDB();
    
    // Update order status in MongoDB
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );
    
    if (!updatedOrder) {
      return { success: false, message: 'الطلب غير موجود.' };
    }

    // Refresh the admin dashboard data on demand
    revalidatePath('/admin');
    return { success: true, message: 'تم تحديث حالة الطلب بنجاح!' };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'حدث خطأ أثناء تحديث حالة الطلب.' };
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.ADMIN_PASSWORD || 'xero123';
  return password === correctPassword;
}
