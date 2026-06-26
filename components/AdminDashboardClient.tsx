'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { verifyAdminPassword, updateOrderStatus } from '@/actions/admin';

interface OrderItem {
  productId: string;
  name: string;
  size: 'S' | 'M' | 'L' | 'XL';
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface AdminDashboardClientProps {
  orders: Order[];
}

export default function AdminDashboardClient({ orders }: AdminDashboardClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Check auth session on mount
  useEffect(() => {
    const authSession = localStorage.getItem('xero_admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsCheckingPassword(true);

    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        localStorage.setItem('xero_admin_auth', 'true');
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setLoginError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      setLoginError('حدث خطأ أثناء التحقق من كلمة المرور.');
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('xero_admin_auth');
    setIsAuthenticated(false);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.success) {
        alert(res.message);
      }
      setUpdatingOrderId(null);
    });
  };

  // If not authenticated, show password lock screen
  if (!isAuthenticated) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 text-right shadow-md">
          <div className="mb-6 inline-flex rounded-full bg-amber-50 p-4 text-primary-accent border border-amber-100">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-stone-900">تسجيل دخول الإدارة</h2>
          <p className="text-stone-500 text-xs mt-2 mb-6">
            يرجى إدخال كلمة المرور الخاصة بمتجر Xero للوصول إلى لوحة التحكم الإدارية.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-700">
                ⚠️ {loginError}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="pass" className="block text-xs font-bold text-stone-700">كلمة المرور الإدارية *</label>
              <input
                type="password"
                id="pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isCheckingPassword}
                placeholder="رمز الدخول الإفتراضي xero123"
                className="w-full h-12 rounded-xl border border-stone-300 px-4 text-sm font-medium focus:border-primary-accent focus:ring-1 focus:ring-primary-accent focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isCheckingPassword}
              className="w-full h-12 flex items-center justify-center rounded-xl bg-stone-900 text-sm font-bold text-white hover:bg-primary-accent transition-all duration-300 disabled:bg-stone-300"
            >
              {isCheckingPassword ? 'جاري التحقق...' : 'دخول للوحة التحكم'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate statistics (Ignore cancelled orders for revenue)
  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const totalSales = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-right flex flex-col w-full">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">لوحة التحكم وإدارة الطلبات</h1>
          <p className="text-xs text-stone-500 mt-1">مرحباً بك في إدارة متجر Xero Loungewear.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex max-w-max items-center justify-center h-10 px-4 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total Sales */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-stone-400">إجمالي المبيعات النشطة</p>
          <p className="text-lg sm:text-2xl font-black text-stone-900 mt-2">
            {totalSales.toLocaleString('ar-EG')} ج.م
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-stone-400">إجمالي عدد الطلبات</p>
          <p className="text-lg sm:text-2xl font-black text-stone-900 mt-2">
            {totalOrders} طلبات
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-stone-400">طلبات قيد المراجعة</p>
          <p className="text-lg sm:text-2xl font-black text-amber-600 mt-2">
            {pendingCount} معلق
          </p>
        </div>

        {/* Completed Orders */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-stone-400">طلبات مكتملة</p>
          <p className="text-lg sm:text-2xl font-black text-emerald-600 mt-2">
            {deliveredCount} مستلمة
          </p>
        </div>

      </div>

      {/* Orders log table */}
      <div className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">سجل الطلبات الواردة</h2>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            مجموع السجلات: {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            لا توجد طلبات مسجلة في قاعدة البيانات حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-stone-50 text-xs font-bold text-stone-600 border-b border-stone-200/60">
                  <th className="py-4 px-6">العميل والشحن</th>
                  <th className="py-4 px-6">العنوان</th>
                  <th className="py-4 px-6">المنتجات المطلوبة</th>
                  <th className="py-4 px-6 text-left">التكلفة الإجمالية</th>
                  <th className="py-4 px-6 text-center">حالة الطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 text-xs font-medium text-stone-700">
                {orders.map((order) => {
                  const isUpdating = updatingOrderId === order._id;
                  
                  return (
                    <tr key={order._id} className="hover:bg-stone-50/40 transition-colors">
                      {/* Customer Details */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="text-sm font-bold text-stone-850">{order.customerName}</div>
                        <div className="text-stone-500">
                          الهاتف: <a href={`tel:${order.phone}`} className="text-primary-accent font-bold hover:underline" dir="ltr">{order.phone}</a>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          ID: {order._id}
                        </div>
                      </td>

                      {/* Shipping Address */}
                      <td className="py-4 px-6 space-y-1 max-w-[200px]">
                        <span className="rounded bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 text-[10px] inline-block mb-1">
                          {order.governorate}
                        </span>
                        <div className="leading-relaxed text-stone-600">{order.address}</div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between gap-4 py-0.5 border-b border-stone-100 last:border-0">
                              <span className="text-stone-800 font-semibold truncate max-w-[150px]">
                                {item.name}
                              </span>
                              <span className="text-stone-500 text-[10px] shrink-0 font-bold">
                                مقاس {item.size} × {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 text-left text-sm font-black text-stone-900">
                        {order.totalPrice.toLocaleString('ar-EG')} ج.م
                      </td>

                      {/* Status select dropdown */}
                      <td className="py-4 px-6 text-center">
                        <div className="relative inline-flex items-center justify-center">
                          {isUpdating ? (
                            <span className="flex items-center gap-1.5 text-stone-400 text-[10px] font-semibold py-1.5 px-3">
                              <svg className="animate-spin h-3.5 w-3.5 text-primary-accent" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              جاري الحفظ...
                            </span>
                          ) : (
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className={`rounded-lg border px-2.5 py-1.5 font-bold text-[11px] focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[left_0.4rem_center] bg-no-repeat pl-6
                                ${order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                ${order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                ${order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
                                ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                ${order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                              `}
                            >
                              <option value="pending">معلق (Pending)</option>
                              <option value="processing">تحت التحضير (Processing)</option>
                              <option value="shipped">تم الشحن (Shipped)</option>
                              <option value="delivered">تم التوصيل (Delivered)</option>
                              <option value="cancelled">ملغي (Cancelled)</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
