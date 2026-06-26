import React from 'react';
import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { Coupon } from '@/models/Coupon';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export const revalidate = 0; // Prevent server caching for instant database updates

export const metadata: Metadata = {
  title: 'لوحة التحكم الإدارية | Xero',
  description: 'إدارة متجر Xero لملابس النوم والبيجامات، سجل الطلبات، كتالوج المنتجات، وأكواد الخصم.',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await connectDB();
  
  // Fetch raw records from MongoDB
  const rawOrders = await Order.find({}).sort({ createdAt: -1 });
  const rawProducts = await Product.find({}).sort({ createdAt: -1 });
  const rawCoupons = await Coupon.find({}).sort({ createdAt: -1 });

  // Serialize Mongoose structures to plain JS objects for Client Component injection
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

  const products = rawProducts.map((p) => {
    const obj = p.toObject();
    obj._id = obj._id.toString();
    obj.createdAt = obj.createdAt.toISOString();
    return obj;
  });

  const coupons = rawCoupons.map((c) => {
    const obj = c.toObject();
    obj._id = obj._id.toString();
    obj.createdAt = obj.createdAt.toISOString();
    return obj;
  });

  return (
    <div className="flex-grow flex flex-col bg-stone-50/50">
      <AdminDashboardClient 
        orders={orders} 
        products={products} 
        coupons={coupons} 
      />
    </div>
  );
}
