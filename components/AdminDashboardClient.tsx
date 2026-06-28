'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { 
  verifyAdminPassword, 
  updateOrderStatus, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createCoupon,
  deleteCoupon
} from '@/actions/admin';

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
  shippingFee: number;
  discountAmount: number;
  couponCode: string;
  grandTotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface ProductType {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  sizes: ('S' | 'M' | 'L' | 'XL')[];
  inStock: boolean;
  createdAt: string;
}

interface CouponType {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  createdAt: string;
}

interface AdminDashboardClientProps {
  orders: Order[];
  products: ProductType[];
  coupons: CouponType[];
}

export default function AdminDashboardClient({ orders, products, coupons }: AdminDashboardClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'coupons'>('orders');

  // Printing state
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  
  // Product Form Fields
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pImages, setPImages] = useState('');
  const [pSizes, setPSizes] = useState<('S' | 'M' | 'L' | 'XL')[]>(['S', 'M', 'L', 'XL']);
  const [pInStock, setPInStock] = useState(true);

  // Coupon Form Fields
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percentage' | 'fixed'>('percentage');
  const [cValue, setCValue] = useState('');

  // Check auth session
  useEffect(() => {
    const authSession = localStorage.getItem('xero_admin_auth');
    if (authSession) {
      setIsAuthenticated(true);
    }
  }, []);

  const getAdminPassword = () => {
    return localStorage.getItem('xero_admin_auth') || '';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsCheckingPassword(true);

    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        localStorage.setItem('xero_admin_auth', password);
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

  // Orders: Update status
  const handleStatusChange = (orderId: string, newStatus: string) => {
    startTransition(async () => {
      const pass = getAdminPassword();
      const res = await updateOrderStatus(pass, orderId, newStatus);
      if (!res.success) alert(res.message);
    });
  };

  // Products: Toggle Stock
  const handleStockToggle = (productId: string, currentStockStatus: boolean) => {
    startTransition(async () => {
      const pass = getAdminPassword();
      const res = await updateProduct(pass, productId, { inStock: !currentStockStatus });
      if (!res.success) alert(res.message);
    });
  };

  // Products: Open Add Modal
  const openAddProductModal = () => {
    setEditingProduct(null);
    setPName('');
    setPPrice('');
    setPDescription('');
    setPImages('');
    setPSizes(['S', 'M', 'L', 'XL']);
    setPInStock(true);
    setIsProductModalOpen(true);
  };

  // Products: Open Edit Modal
  const openEditProductModal = (product: ProductType) => {
    setEditingProduct(product);
    setPName(product.name);
    setPPrice(product.price.toString());
    setPDescription(product.description);
    setPImages(product.images.join(', '));
    setPSizes(product.sizes);
    setPInStock(product.inStock);
    setIsProductModalOpen(true);
  };

  // Products: Save (Create/Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice || !pDescription || !pImages) {
      alert('يرجى ملء جميع الحقول المطلوبة للمنتج.');
      return;
    }

    const imagesArray = pImages.split(',').map(img => img.trim()).filter(Boolean);
    const productData = {
      name: pName,
      price: Number(pPrice),
      description: pDescription,
      images: imagesArray,
      sizes: pSizes,
      inStock: pInStock
    };

    startTransition(async () => {
      let res;
      const pass = getAdminPassword();
      if (editingProduct) {
        res = await updateProduct(pass, editingProduct._id, productData);
      } else {
        res = await createProduct(pass, productData);
      }

      if (res.success) {
        setIsProductModalOpen(false);
        alert(res.message);
      } else {
        alert(res.message);
      }
    });
  };

  // Products: Delete
  const handleDeleteProduct = (productId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟')) return;
    startTransition(async () => {
      const pass = getAdminPassword();
      const res = await deleteProduct(pass, productId);
      alert(res.message);
    });
  };

  // Coupons: Create
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode || !cValue) {
      alert('يرجى إدخال الكود وقيمة الخصم.');
      return;
    }

    startTransition(async () => {
      const pass = getAdminPassword();
      const res = await createCoupon(pass, {
        code: cCode,
        discountType: cType,
        discountValue: Number(cValue)
      });
      
      if (res.success) {
        setCCode('');
        setCValue('');
        alert(res.message);
      } else {
        alert(res.message);
      }
    });
  };

  // Coupons: Delete
  const handleDeleteCoupon = (couponId: string) => {
    if (!confirm('هل تريد حذف كود الخصم هذا؟')) return;
    startTransition(async () => {
      const pass = getAdminPassword();
      const res = await deleteCoupon(pass, couponId);
      alert(res.message);
    });
  };

  // Trigger Print Receipt
  const handlePrint = (order: Order) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Password Gate
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

  // Calculate statistics (Ignore cancelled orders)
  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const totalSales = activeOrders.reduce((sum, o) => sum + (o.grandTotal || o.totalPrice), 0);
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-right flex flex-col w-full">
      
      {/* Printable Invoice section (Hidden on screen, visible only on print) */}
      {printOrder && (
        <div id="print-section" className="hidden print:block text-right p-8 text-stone-900 font-sans" dir="rtl">
          <style>{`
            @media print {
              body * { display: none !important; }
              #print-section, #print-section * { display: block !important; }
              #print-section { width: 100% !important; direction: rtl !important; }
            }
          `}</style>
          
          {/* Header */}
          <div className="border-b-2 border-stone-800 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black tracking-wider">فاتورة شحن متجر XERO</h1>
              <p className="text-xs text-stone-500 mt-1">تاريخ الطلب: {new Date(printOrder.createdAt).toLocaleDateString('ar-EG')}</p>
            </div>
            <div className="text-left">
              <span className="text-xl font-bold">رقم الفاتورة: #{printOrder._id.substring(18)}</span>
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border border-stone-200 rounded-xl p-4">
              <h3 className="font-bold border-b border-stone-250 pb-2 mb-2 text-sm text-stone-700">بيانات العميل:</h3>
              <p className="text-sm font-bold">{printOrder.customerName}</p>
              <p className="text-xs text-stone-600 mt-1" dir="ltr">رقم الهاتف: {printOrder.phone}</p>
            </div>
            
            <div className="border border-stone-200 rounded-xl p-4">
              <h3 className="font-bold border-b border-stone-250 pb-2 mb-2 text-sm text-stone-700">عنوان التوصيل:</h3>
              <p className="text-sm font-bold">محافظة: {printOrder.governorate}</p>
              <p className="text-xs text-stone-600 mt-1">{printOrder.address}</p>
            </div>
          </div>

          {/* Order Items */}
          <h3 className="font-bold text-stone-800 mb-2">المنتجات المطلوبة:</h3>
          <table className="w-full text-right border-collapse mb-8">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-100 font-bold text-xs">
                <th className="py-2 px-4">اسم المنتج</th>
                <th className="py-2 px-4 text-center">المقاس</th>
                <th className="py-2 px-4 text-center">الكمية</th>
                <th className="py-2 px-4 text-left">التكلفة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-xs">
              {printOrder.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-bold">{item.name}</td>
                  <td className="py-3 px-4 text-center">{item.size}</td>
                  <td className="py-3 px-4 text-center">{item.quantity}</td>
                  <td className="py-3 px-4 text-left font-bold">{item.price.toLocaleString('ar-EG')} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Breakdown */}
          <div className="flex justify-end">
            <div className="w-80 border border-stone-300 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{printOrder.totalPrice.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة الشحن:</span>
                <span>{printOrder.shippingFee.toLocaleString('ar-EG')} ج.م</span>
              </div>
              {printOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>الخصم المطبق ({printOrder.couponCode}):</span>
                  <span>-{printOrder.discountAmount.toLocaleString('ar-EG')} ج.م</span>
                </div>
              )}
              <div className="border-t border-stone-800 pt-2 flex justify-between font-black text-sm text-stone-950">
                <span>المطلوب تحصيله عند الاستلام:</span>
                <span>{(printOrder.grandTotal || printOrder.totalPrice).toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>
          </div>
          
          <div className="mt-20 border-t border-stone-200 pt-4 text-center text-[10px] text-stone-400">
            شكراً لتسوقك من متجر XERO. ملابس نوم حريرية فاخرة.
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">لوحة التحكم وإدارة المتجر</h1>
          <p className="text-xs text-stone-500 mt-1">مرحباً بك في لوحة تحكم متجر Xero Loungewear.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
          >
            الطلبات
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'products' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
          >
            الكتالوج
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'coupons' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
          >
            الكوبونات
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex max-w-max items-center justify-center h-10 px-4 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* Metrics Bar (Only on Orders Tab) */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-stone-400">إجمالي المبيعات النشطة</p>
            <p className="text-lg sm:text-2xl font-black text-stone-900 mt-2">
              {totalSales.toLocaleString('ar-EG')} ج.م
            </p>
          </div>
          <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-stone-400">إجمالي عدد الطلبات</p>
            <p className="text-lg sm:text-2xl font-black text-stone-900 mt-2">{totalOrders} طلبات</p>
          </div>
          <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-stone-400">طلبات قيد المراجعة</p>
            <p className="text-lg sm:text-2xl font-black text-amber-600 mt-2">{pendingCount} معلق</p>
          </div>
          <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-stone-400">طلبات مكتملة</p>
            <p className="text-lg sm:text-2xl font-black text-emerald-600 mt-2">{deliveredCount} مستلمة</p>
          </div>
        </div>
      )}

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">سجل الطلبات الواردة</h2>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
              مجموع السجلات: {orders.length}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-stone-500">لا توجد طلبات مسجلة حالياً.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-xs font-bold text-stone-600 border-b border-stone-200/60">
                    <th className="py-4 px-6">العميل والشحن</th>
                    <th className="py-4 px-6">العنوان والتكلفة</th>
                    <th className="py-4 px-6">المنتجات المطلوبة</th>
                    <th className="py-4 px-6 text-left">المبلغ المطلوب</th>
                    <th className="py-4 px-6 text-center">حالة الطلب</th>
                    <th className="py-4 px-6 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-xs font-medium text-stone-700">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-stone-50/40 transition-colors">
                      
                      {/* Customer info */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="text-sm font-bold text-stone-850">{order.customerName}</div>
                        <div className="text-stone-500">
                          الهاتف: <a href={`tel:${order.phone}`} className="text-primary-accent font-bold hover:underline" dir="ltr">{order.phone}</a>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">ID: {order._id}</div>
                      </td>

                      {/* Address & Cost details */}
                      <td className="py-4 px-6 space-y-1 max-w-[200px]">
                        <span className="rounded bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 text-[10px] inline-block mb-1">
                          {order.governorate}
                        </span>
                        <div className="leading-relaxed text-stone-600 line-clamp-2">{order.address}</div>
                        <div className="text-[10px] text-stone-400 mt-1">
                          فرعي: {order.totalPrice} ج.م | شحن: {order.shippingFee || 0} ج.م
                          {order.discountAmount > 0 && ` | خصم: -${order.discountAmount} ج.م (${order.couponCode})`}
                        </div>
                      </td>

                      {/* Products list */}
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between gap-4 py-0.5 border-b border-stone-100 last:border-0">
                              <span className="text-stone-800 font-semibold truncate max-w-[150px]">{item.name}</span>
                              <span className="text-stone-500 text-[10px] shrink-0 font-bold">
                                مقاس {item.size} × {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Grand Total */}
                      <td className="py-4 px-6 text-left text-sm font-black text-stone-900">
                        {(order.grandTotal || order.totalPrice).toLocaleString('ar-EG')} ج.م
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`rounded-lg border px-2 py-1 font-bold text-[10px] focus:outline-none cursor-pointer
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
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handlePrint(order)}
                          className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-900 hover:text-white font-bold text-[10px] transition-colors"
                        >
                          طباعة الفاتورة
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          <div className="flex justify-between items-center bg-white border border-stone-200/60 rounded-3xl px-6 py-5 shadow-sm">
            <h2 className="text-base font-bold text-stone-900">كتالوج المنتجات</h2>
            <button
              onClick={openAddProductModal}
              className="h-10 px-5 rounded-xl bg-stone-900 hover:bg-primary-accent text-white text-xs font-bold transition-colors"
            >
              إضافة منتج جديد +
            </button>
          </div>

          <div className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-stone-50 text-xs font-bold text-stone-600 border-b border-stone-200/60">
                  <th className="py-4 px-6">المنتج</th>
                  <th className="py-4 px-6">المقاسات المتاحة</th>
                  <th className="py-4 px-6 text-left">السعر</th>
                  <th className="py-4 px-6 text-center">حالة التوفر</th>
                  <th className="py-4 px-6 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 text-xs font-medium text-stone-700">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-stone-50/40 transition-colors">
                    
                    {/* Thumbnail & Name */}
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100 border border-stone-200/40">
                        <img
                          src={prod.images[0] || '/images/placeholder.png'}
                          alt={prod.name}
                          className="object-cover object-center w-full h-full"
                        />
                      </div>
                      <div className="font-bold text-stone-850">{prod.name}</div>
                    </td>

                    {/* Sizes */}
                    <td className="py-4 px-6">
                      <div className="flex gap-1.5">
                        {prod.sizes.map((s) => (
                          <span key={s} className="rounded border border-stone-300 px-1.5 py-0.5 text-[9px] font-bold bg-white text-stone-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 text-left font-black text-stone-900">
                      {prod.price.toLocaleString('ar-EG')} ج.م
                    </td>

                    {/* Stock Status Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleStockToggle(prod._id, prod.inStock)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border
                          ${prod.inStock 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                      >
                        {prod.inStock ? 'متوفر في المخزن' : 'غير متوفر'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center space-x-reverse space-x-2">
                      <button
                        onClick={() => openEditProductModal(prod)}
                        className="inline-flex h-8 px-3 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-[10px] font-bold transition-colors"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="inline-flex h-8 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white text-[10px] font-bold transition-colors"
                      >
                        حذف
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE COUPONS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Add Coupon Form */}
          <form onSubmit={handleCreateCoupon} className="lg:col-span-4 bg-white border border-stone-200/60 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 border-b border-stone-150 pb-3">
              إنشاء كود خصم جديد
            </h3>
            
            <div className="space-y-1.5">
              <label htmlFor="code" className="block text-xs font-bold text-stone-700">كود الخصم (كبير تلقائياً) *</label>
              <input
                type="text"
                id="code"
                value={cCode}
                onChange={(e) => setCCode(e.target.value)}
                placeholder="مثال: XERO20"
                required
                className="w-full h-10 rounded-xl border border-stone-300 px-3 text-xs font-medium focus:outline-none focus:border-primary-accent uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="type" className="block text-xs font-bold text-stone-700">نوع الخصم *</label>
              <select
                id="type"
                value={cType}
                onChange={(e) => setCType(e.target.value as any)}
                className="w-full h-10 rounded-xl border border-stone-300 px-3 text-xs font-medium focus:outline-none focus:border-primary-accent bg-white"
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ج.م)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="value" className="block text-xs font-bold text-stone-700">قيمة الخصم *</label>
              <input
                type="number"
                id="value"
                value={cValue}
                onChange={(e) => setCValue(e.target.value)}
                placeholder="مثال: 10 أو 150"
                required
                className="w-full h-10 rounded-xl border border-stone-300 px-3 text-xs font-medium focus:outline-none focus:border-primary-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-stone-900 hover:bg-primary-accent text-white text-xs font-bold transition-all"
            >
              حفظ كود الخصم
            </button>
          </form>

          {/* List of Coupons */}
          <div className="lg:col-span-8 bg-white border border-stone-200/60 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">الكوبونات النشطة</h3>
            </div>
            
            {coupons.length === 0 ? (
              <div className="text-center py-12 text-stone-500">لا توجد أكواد خصم حالياً.</div>
            ) : (
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-xs font-bold text-stone-600 border-b border-stone-200/60">
                    <th className="py-3 px-6">الكود</th>
                    <th className="py-3 px-6">الخصم الممنوح</th>
                    <th className="py-3 px-6 text-center">حالة التفعيل</th>
                    <th className="py-3 px-6 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-xs font-medium text-stone-700">
                  {coupons.map((c) => (
                    <tr key={c._id}>
                      <td className="py-3 px-6 font-bold text-stone-900 font-mono tracking-wider">{c.code}</td>
                      <td className="py-3 px-6">
                        {c.discountType === 'percentage' 
                          ? `${c.discountValue}% خصم` 
                          : `${c.discountValue.toLocaleString('ar-EG')} ج.م خصم ثابت`
                        }
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className="rounded bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 text-[10px]">
                          نشط
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="inline-flex h-8 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white text-[10px] font-bold transition-colors"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* Add/Edit Product Modal Dialog */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-right space-y-5 animate-scaleIn">
            
            <div className="flex items-center justify-between border-b border-stone-250 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة بيجامة نوم جديدة'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-stone-400 hover:text-stone-750 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">اسم المنتج *</label>
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="مثال: طقم بيجامة حريرية"
                  required
                  className="w-full h-10 rounded-lg border border-stone-300 px-3 text-xs focus:outline-none focus:border-primary-accent bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">السعر (ج.م) *</label>
                <input
                  type="number"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  placeholder="مثال: 1500"
                  required
                  className="w-full h-10 rounded-lg border border-stone-300 px-3 text-xs focus:outline-none focus:border-primary-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">وصف المنتج وتفاصيله *</label>
                <textarea
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="اكتب وصفاً مفصلاً يبرز مزايا البيجامة وراحتها..."
                  required
                  rows={3}
                  className="w-full rounded-lg border border-stone-300 p-3 text-xs focus:outline-none focus:border-primary-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">رابط صورة المنتج (مفصولة بفاصلة في حال تعدد الصور) *</label>
                <input
                  type="text"
                  value={pImages}
                  onChange={(e) => setPImages(e.target.value)}
                  placeholder="مثال: /images/silk-cream.png"
                  required
                  className="w-full h-10 rounded-lg border border-stone-300 px-3 text-xs focus:outline-none focus:border-primary-accent"
                />
                <p className="text-[10px] text-stone-400">يمكنك استخدام الصور المتاحة: `/images/silk-cream.png` أو `/images/linen-gray.png` أو `/images/cotton-rose.png` أو `/images/waffle-beige.png` لتجربة سريعة.</p>
              </div>

              {/* Sizes checkboxes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">المقاسات المتوفرة:</label>
                <div className="flex gap-6">
                  {['S', 'M', 'L', 'XL'].map((s) => {
                    const isChecked = pSizes.includes(s as any);
                    return (
                      <label key={s} className="flex items-center gap-2 font-bold text-xs text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setPSizes(prev => prev.filter(x => x !== s));
                            } else {
                              setPSizes(prev => [...prev, s as any]);
                            }
                          }}
                          className="h-4 w-4 rounded border-stone-300 accent-primary-accent"
                        />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 font-bold text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pInStock}
                    onChange={(e) => setPInStock(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 accent-primary-accent"
                  />
                  هذا المنتج متوفر للبيع فوراً
                </label>
              </div>

              <div className="pt-4 border-t border-stone-150 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-stone-900 hover:bg-primary-accent text-white text-xs font-bold transition-all"
                >
                  {editingProduct ? 'تحديث المنتج' : 'حفظ المنتج الجديد'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="h-11 px-5 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-all"
                >
                  إلغاء
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
