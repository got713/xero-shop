import React from 'react';
import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export const revalidate = 0; // Disable server rendering cache for real-time order logs

export const metadata: Metadata = {
  title: 'لوحة تحكم الإدارة | Xero',
  description: 'إدارة طلبات المشتريات والعملاء لمتجر Xero ملابس النوم والبيجامات.',
  robots: { index: false, follow: false }, // Prevent search engines from indexing the admin page
};

export default async function AdminPage() {
  await connectDB();
  
  // Fetch all orders sorted by newest first
  const rawOrders = await Order.find({}).sort({ createdAt: -1 });
  
  // Convert Mongoose documents to plain serializable objects for Client Component injection
  const orders = rawOrders.map((o) => {
    const obj = o.toObject();
    obj._id = obj._id.toString();
    obj.createdAt = obj.createdAt.toISOString();
    
    if (obj.items) {
      obj.items = obj.items.map((item: any) => {
        const itemObj = { ...item };
        itemObj._id = itemObj._id?.toString();
        itemObj.productId = itemObj.productId?.toString();
        return itemObj;
      });
    }
    return obj;
  });

  return (
    <div className="flex-grow flex flex-col bg-stone-50/50">
      <AdminDashboardClient orders={orders} />
    </div>
  );
}
