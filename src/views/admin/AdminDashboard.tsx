import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings as SettingsIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Search, 
  Upload, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  DollarSign, 
  ArrowUpRight,
  Database,
  ExternalLink,
  Save,
  Check,
  UploadCloud
} from 'lucide-react';
import { Product, Order, UserProfile, StoreSettings, OrderStatus, PaymentStatus, ShoeCategory } from '../../types';
import { 
  createProduct, 
  updateProduct, 
  removeProduct, 
  updateOrderStatus, 
  saveStoreSettings, 
  uploadProductImage,
  subscribeToOrders,
  subscribeToCustomers,
  seedFirestoreDatabase
} from '../../services/storeService';
import { useAuth, DEFAULT_ADMIN_EMAIL } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface AdminDashboardProps {
  products: Product[];
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onExitAdmin
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { settings } = useCart();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'settings' | 'security'>('overview');

  // Real-time Orders & Customers state
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('KICKS Lab');
  const [pCategory, setPCategory] = useState<ShoeCategory>('Sneakers');
  const [pPrice, setPPrice] = useState<number>(5500);
  const [pOriginalPrice, setPOriginalPrice] = useState<number>(6500);
  const [pStock, setPStock] = useState<number>(10);
  const [pSizes, setPSizes] = useState<number[]>([40, 41, 42, 43, 44]);
  const [pDescription, setPDescription] = useState('');
  const [pImages, setPImages] = useState<string[]>([]);
  const [pFeatured, setPFeatured] = useState<boolean>(false);
  const [pNewArrival, setPNewArrival] = useState<boolean>(true);
  const [pMaterials, setPMaterials] = useState('');
  const [pSku, setPSku] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Settings State
  const [cfgBkash, setCfgBkash] = useState(settings.bkashNumber);
  const [cfgBkashType, setCfgBkashType] = useState(settings.bkashAccountType);
  const [cfgNagad, setCfgNagad] = useState(settings.nagadNumber);
  const [cfgNagadType, setCfgNagadType] = useState(settings.nagadAccountType);
  const [cfgWhatsapp, setCfgWhatsapp] = useState(settings.whatsappNumber || '01706695247');
  const [cfgDelivery, setCfgDelivery] = useState(settings.standardDeliveryCharge);
  const [cfgFreeThreshold, setCfgFreeThreshold] = useState(settings.freeDeliveryThreshold);
  const [cfgCurrency, setCfgCurrency] = useState(settings.currencySymbol);
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  // Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');

  // Subscribe to all orders and customers in real-time
  useEffect(() => {
    const unsubOrders = subscribeToOrders(null, true, (data) => {
      setOrders(data);
    });
    const unsubCust = subscribeToCustomers((data) => {
      setCustomers(data);
    });

    return () => {
      unsubOrders();
      unsubCust();
    };
  }, []);

  useEffect(() => {
    setCfgBkash(settings.bkashNumber);
    setCfgBkashType(settings.bkashAccountType);
    setCfgNagad(settings.nagadNumber);
    setCfgNagadType(settings.nagadAccountType);
    setCfgWhatsapp(settings.whatsappNumber || '01706695247');
    setCfgDelivery(settings.standardDeliveryCharge);
    setCfgFreeThreshold(settings.freeDeliveryThreshold);
    setCfgCurrency(settings.currencySymbol);
  }, [settings]);

  // Financial & Inventory Metrics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Payment Verification');
  const completedOrders = orders.filter(o => o.orderStatus === 'Delivered');

  // Open Create Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPName('');
    setPBrand('KICKS Lab');
    setPCategory('Sneakers');
    setPPrice(5500);
    setPOriginalPrice(6500);
    setPStock(12);
    setPSizes([40, 41, 42, 43, 44]);
    setPDescription('Crafted with premium materials for unmatched comfort, longevity, and street style.');
    setPImages(['/src/assets/images/kicks_hero_sneaker_1793611731340.jpg']);
    setPFeatured(false);
    setPNewArrival(true);
    setPMaterials('Full-Grain Leather, EVA Cushioning, Rubber Outsole');
    setPSku(`KCK-${Math.floor(100 + Math.random() * 900)}`);
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPBrand(prod.brand);
    setPCategory(prod.category);
    setPPrice(prod.price);
    setPOriginalPrice(prod.originalPrice || prod.price);
    setPStock(prod.stock);
    setPSizes(prod.availableSizes);
    setPDescription(prod.description);
    setPImages(prod.images);
    setPFeatured(!!prod.featured);
    setPNewArrival(!!prod.newArrival);
    setPMaterials(prod.materials || '');
    setPSku(prod.sku || '');
    setIsProductModalOpen(true);
  };

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setPImages(prev => [url, ...prev]);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Toggle Size
  const toggleSize = (sz: number) => {
    if (pSizes.includes(sz)) {
      setPSizes(pSizes.filter(s => s !== sz));
    } else {
      setPSizes([...pSizes, sz].sort((a, b) => a - b));
    }
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    setSavingProduct(true);

    try {
      const prodPayload = {
        name: pName.trim(),
        brand: pBrand.trim(),
        category: pCategory,
        price: Number(pPrice),
        originalPrice: Number(pOriginalPrice),
        stock: Number(pStock),
        availableSizes: pSizes.length > 0 ? pSizes : [40, 41, 42, 43],
        description: pDescription.trim(),
        images: pImages.length > 0 ? pImages : ['/src/assets/images/kicks_hero_sneaker_1793611731340.jpg'],
        featured: pFeatured,
        newArrival: pNewArrival,
        materials: pMaterials.trim(),
        sku: pSku.trim()
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, prodPayload);
      } else {
        await createProduct(prodPayload);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSavingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sneaker? This action cannot be undone.')) {
      await removeProduct(id);
    }
  };

  // Verify Payment Action
  const handleVerifyPayment = async (order: Order) => {
    await updateOrderStatus(
      order.id, 
      'Confirmed', 
      'verified', 
      userProfile?.fullName || currentUser?.email || 'Admin'
    );
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettings({
      ...settings,
      bkashNumber: cfgBkash.trim(),
      bkashAccountType: cfgBkashType,
      nagadNumber: cfgNagad.trim(),
      nagadAccountType: cfgNagadType,
      whatsappNumber: cfgWhatsapp.trim(),
      standardDeliveryCharge: Number(cfgDelivery),
      freeDeliveryThreshold: Number(cfgFreeThreshold),
      currencySymbol: cfgCurrency.trim()
    });
    setSettingsSavedNotice(true);
    setTimeout(() => setSettingsSavedNotice(false), 3000);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) {
      return false;
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.customerDetails.fullName.toLowerCase().includes(q);
      const matchPhone = o.customerDetails.phone.toLowerCase().includes(q);
      const matchTrx = o.paymentDetails?.transactionId?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchTrx) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#151515]">
      
      {/* Top Admin Nav */}
      <div className="bg-[#151515] text-white px-4 sm:px-8 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-2xl px-3 py-1.5 flex items-center justify-center shrink-0 shadow-lg">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-11-04_at_11.08.18_PM_0f182253.jpeg"
              alt="KICKS"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="font-display font-black text-lg tracking-tight flex items-center gap-2">
              KICKS Control Room
              <span className="text-[10px] bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/40 font-mono px-2 py-0.5 rounded-full uppercase">
                Admin Console
              </span>
            </h1>
            <p className="text-[11px] text-stone-400">
              Connected to Firebase Project: <strong className="font-mono text-white">kicks-8867d</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-300 hidden sm:inline">
            Logged as: <strong className="font-mono text-white">{currentUser?.email}</strong>
          </span>
          <button
            onClick={onExitAdmin}
            className="px-4 py-2 rounded-xl skeuo-btn-soft text-xs font-bold text-stone-800 hover:text-stone-900"
          >
            ← View Storefront
          </button>
        </div>
      </div>

      {/* Main Admin Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-black/8 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'settings', label: 'Payment & Delivery Config', icon: SettingsIcon },
            { id: 'security', label: 'Firebase Rules & DB', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#151515] text-white shadow-md'
                    : 'text-stone-600 hover:bg-stone-200/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B35]' : 'text-stone-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div className="p-5 rounded-2xl skeuo-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Sales</span>
                <p className="font-mono font-black text-xl text-stone-900 tabular-nums">
                  {settings.currencySymbol}{totalRevenue.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Active Revenue</span>
              </div>

              <div className="p-5 rounded-2xl skeuo-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Orders</span>
                <p className="font-mono font-black text-xl text-stone-900 tabular-nums">
                  {orders.length}
                </p>
                <span className="text-[10px] text-stone-500">Recorded in Firestore</span>
              </div>

              <div className="p-5 rounded-2xl skeuo-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Pending Actions</span>
                <p className="font-mono font-black text-xl text-[#FF6B35] tabular-nums">
                  {pendingOrders.length}
                </p>
                <span className="text-[10px] text-amber-700 font-semibold">Needs Verification</span>
              </div>

              <div className="p-5 rounded-2xl skeuo-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Delivered Orders</span>
                <p className="font-mono font-black text-xl text-emerald-700 tabular-nums">
                  {completedOrders.length}
                </p>
                <span className="text-[10px] text-emerald-600">Successfully Received</span>
              </div>

              <div className="p-5 rounded-2xl skeuo-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Live Kicks</span>
                <p className="font-mono font-black text-xl text-stone-900 tabular-nums">
                  {products.length}
                </p>
                <span className="text-[10px] text-stone-500">In Product Catalog</span>
              </div>

              <div className="p-5 rounded-2xl skeuo-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Customers</span>
                <p className="font-mono font-black text-xl text-stone-900 tabular-nums">
                  {customers.length || 1}
                </p>
                <span className="text-[10px] text-stone-500">Registered Accounts</span>
              </div>

            </div>

            {/* Quick Pending Verification Alert */}
            {pendingOrders.length > 0 && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-amber-900">
                      {pendingOrders.length} {pendingOrders.length === 1 ? 'Order' : 'Orders'} Awaiting Payment Verification / Confirmation
                    </h3>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Verify the customer's bKash or Nagad Transaction ID before marking as Confirmed.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-4 py-2 rounded-xl skeuo-btn-dark font-display font-bold text-xs uppercase tracking-wider self-start sm:self-auto"
                >
                  Review Orders Now →
                </button>
              </div>
            )}

            {/* Recent Orders Table */}
            <div className="rounded-3xl skeuo-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-stone-900">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#FF6B35] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/8 text-stone-400 uppercase font-mono tracking-wider">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Trx ID</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-stone-800 font-medium">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">{ord.id}</td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-stone-900">{ord.customerDetails.fullName}</p>
                          <p className="text-[11px] font-mono text-stone-500">{ord.customerDetails.phone}</p>
                        </td>
                        <td className="py-3 px-3 text-stone-600">{ord.customerDetails.city}</td>
                        <td className="py-3 px-3 uppercase font-mono font-bold text-[11px] text-stone-700">
                          {ord.paymentMethod}
                        </td>
                        <td className="py-3 px-3 font-mono text-stone-600">
                          {ord.paymentDetails?.transactionId || 'COD'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-800">
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 tabular-nums">
                          {settings.currencySymbol}{ord.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 2. PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-stone-900">
                  Inventory & Product Catalog
                </h2>
                <p className="text-xs text-stone-500">
                  Add new shoe silhouettes, adjust prices, edit available sizes, and upload images.
                </p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2.5 rounded-xl skeuo-btn-primary font-display font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 self-start"
              >
                <Plus className="w-4 h-4" />
                Add New Shoe
              </button>
            </div>

            {/* Products Table */}
            <div className="rounded-3xl skeuo-card p-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/8 text-stone-400 uppercase font-mono tracking-wider">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Stock</th>
                      <th className="py-2.5 px-3">Sizes</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-stone-800">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0] || '/src/assets/images/kicks_hero_sneaker_1793611731340.jpg'}
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover bg-stone-200 border border-black/5 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-stone-900 text-xs">{prod.name}</p>
                              <p className="text-[11px] text-stone-500 uppercase">{prod.brand} · {prod.sku || 'KCK'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-stone-600">{prod.category}</td>
                        <td className="py-3 px-3 font-mono font-bold text-stone-900 tabular-nums">
                          {settings.currencySymbol}{prod.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-mono font-bold ${prod.stock <= 4 ? 'text-amber-700' : 'text-stone-900'}`}>
                            {prod.stock} pairs
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-600">
                          {prod.availableSizes.join(', ')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1">
                            {prod.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-900 text-white">
                                Feat
                              </span>
                            )}
                            {prod.newArrival && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF6B35] text-white">
                                New
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg skeuo-btn-soft text-stone-700 hover:text-stone-900"
                              title="Edit Shoe"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg skeuo-btn-soft text-rose-600 hover:bg-rose-50"
                              title="Delete Shoe"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 3. ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-stone-900">
                  Customer Orders & Payment Verification
                </h2>
                <p className="text-xs text-stone-500">
                  Review customer details, shipping address, ordered items, and verify bKash/Nagad transactions.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl skeuo-inset text-xs font-semibold text-stone-800 focus:outline-none"
                >
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="Payment Verification">Payment Verification ({orders.filter(o => o.orderStatus === 'Payment Verification').length})</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="rounded-3xl skeuo-card p-12 text-center text-stone-400 text-xs">
                  No orders match this status or search filter.
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-3xl skeuo-card p-6 space-y-4 border border-black/8"
                  >
                    {/* Order Head */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-base text-stone-900">{ord.id}</span>
                          <span className="text-stone-400">·</span>
                          <span className="text-xs font-semibold text-stone-600">
                            {new Date(ord.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Updater Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-500 font-semibold">Status:</span>
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-black/10 bg-white text-stone-900 focus:outline-none cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Payment Verification">Payment Verification</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* One-click Verify Button for manual payments */}
                        {ord.orderStatus === 'Payment Verification' && (
                          <button
                            onClick={() => handleVerifyPayment(ord)}
                            className="px-3.5 py-1.5 rounded-lg skeuo-btn-primary font-display font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verify & Confirm Order
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Customer & Payment details grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      
                      {/* Col 1: Customer Details */}
                      <div className="p-3.5 rounded-xl bg-stone-100/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-stone-400">Customer Info</span>
                        <p className="font-bold text-stone-900">{ord.customerDetails.fullName}</p>
                        <p className="font-mono text-stone-600">{ord.customerDetails.phone}</p>
                        <p className="text-stone-500">{ord.customerDetails.email}</p>
                      </div>

                      {/* Col 2: Shipping Destination */}
                      <div className="p-3.5 rounded-xl bg-stone-100/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-stone-400">Delivery Address</span>
                        <p className="font-semibold text-stone-900">{ord.customerDetails.city}</p>
                        <p className="text-stone-600 leading-snug">{ord.customerDetails.address}</p>
                        {ord.customerDetails.notes && (
                          <p className="text-stone-500 italic mt-1">Note: "{ord.customerDetails.notes}"</p>
                        )}
                      </div>

                      {/* Col 3: Payment Details */}
                      <div className="p-3.5 rounded-xl bg-stone-100/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-stone-400">Payment Breakdown</span>
                        <p className="font-bold uppercase text-stone-900">Method: {ord.paymentMethod}</p>
                        {ord.paymentDetails?.transactionId && (
                          <p className="font-mono text-stone-900">
                            TrxID: <strong className="text-[#FF6B35] font-black">{ord.paymentDetails.transactionId}</strong>
                          </p>
                        )}
                        {ord.paymentDetails?.senderNumber && (
                          <p className="font-mono text-stone-700">Sender: {ord.paymentDetails.senderNumber}</p>
                        )}
                        <p className="font-mono font-black text-sm text-stone-900 pt-1">
                          Total: {settings.currencySymbol}{ord.totalAmount.toLocaleString()}
                        </p>
                      </div>

                    </div>

                    {/* Ordered Items Preview */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-stone-500 block mb-2">Ordered Pairs:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {ord.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-black/5 text-xs">
                            <img src={it.image || '/src/assets/images/kicks_hero_sneaker_1793611731340.jpg'} alt={it.name} className="w-10 h-10 rounded object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-stone-900 truncate">{it.name}</p>
                              <p className="text-[10px] font-mono text-stone-500">Size {it.size} · Qty {it.quantity} · {settings.currencySymbol}{it.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* 4. CUSTOMERS MANAGEMENT TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-bold text-xl text-stone-900">
                Registered Customer Accounts
              </h2>
              <p className="text-xs text-stone-500">
                Customer profiles stored in Firestore <code className="font-mono">users</code> collection.
              </p>
            </div>

            <div className="rounded-3xl skeuo-card p-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/8 text-stone-400 uppercase font-mono tracking-wider">
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Total Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-stone-800">
                    {customers.map((cust) => {
                      const custOrders = orders.filter(o => o.userId === cust.uid);
                      const custTotal = custOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                      return (
                        <tr key={cust.uid} className="hover:bg-stone-50">
                          <td className="py-3 px-3 font-semibold text-stone-900">
                            {cust.fullName || 'Registered User'}
                          </td>
                          <td className="py-3 px-3 font-mono text-stone-600">{cust.email}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              cust.role === 'admin' ? 'bg-[#FF6B35] text-white' : 'bg-stone-200 text-stone-800'
                            }`}>
                              {cust.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-stone-600">{cust.phone || '—'}</td>
                          <td className="py-3 px-3 text-stone-600">{cust.city || '—'}</td>
                          <td className="py-3 px-3 font-mono">
                            <strong className="text-stone-900">{custOrders.length}</strong> orders ({settings.currencySymbol}{custTotal.toLocaleString()})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-bold text-xl text-stone-900">
                Payment Gateways & Delivery Settings
              </h2>
              <p className="text-xs text-stone-500">
                Modify your manual bKash and Nagad payment numbers. All customers see these numbers in real-time.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-5">
              
              {settingsSavedNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" /> Settings updated successfully in Firestore!
                </div>
              )}

              {/* bKash configuration */}
              <div className="space-y-3 pb-4 border-b border-black/5">
                <h3 className="font-bold text-stone-900 text-sm text-[#E2136E]">
                  bKash Payment Configuration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      bKash Payment Number
                    </label>
                    <input
                      type="text"
                      required
                      value={cfgBkash}
                      onChange={(e) => setCfgBkash(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Account Type
                    </label>
                    <select
                      value={cfgBkashType}
                      onChange={(e: any) => setCfgBkashType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 cursor-pointer"
                    >
                      <option value="Personal">Personal (Send Money)</option>
                      <option value="Merchant">Merchant (Make Payment)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nagad configuration */}
              <div className="space-y-3 pb-4 border-b border-black/5">
                <h3 className="font-bold text-stone-900 text-sm text-[#F7941D]">
                  Nagad Payment Configuration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nagad Payment Number
                    </label>
                    <input
                      type="text"
                      required
                      value={cfgNagad}
                      onChange={(e) => setCfgNagad(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Account Type
                    </label>
                    <select
                      value={cfgNagadType}
                      onChange={(e: any) => setCfgNagadType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 cursor-pointer"
                    >
                      <option value="Personal">Personal (Send Money)</option>
                      <option value="Merchant">Merchant (Make Payment)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* WhatsApp Support Configuration */}
              <div className="space-y-3 pb-4 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-stone-900 text-sm text-emerald-700">
                    WhatsApp Customer Contact & Inquiries
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Official WhatsApp Number
                    </label>
                    <input
                      type="text"
                      required
                      value={cfgWhatsapp}
                      onChange={(e) => setCfgWhatsapp(e.target.value)}
                      placeholder="01706695247"
                      className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono font-bold text-stone-900"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      গ্রাহকরা প্রোডাক্ট ডিটেইলস জানতে এই নম্বরে WhatsApp-এ নক করতে পারবেন (01706695247)।
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery and currency configuration */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-sm">
                  Delivery Charges & Currency
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Standard Delivery Fee
                    </label>
                    <input
                      type="number"
                      required
                      value={cfgDelivery}
                      onChange={(e) => setCfgDelivery(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Free Delivery Threshold
                    </label>
                    <input
                      type="number"
                      required
                      value={cfgFreeThreshold}
                      onChange={(e) => setCfgFreeThreshold(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      required
                      value={cfgCurrency}
                      onChange={(e) => setCfgCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono font-bold text-stone-900"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl skeuo-btn-primary font-display font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings to Cloud Firestore
              </button>

            </form>
          </div>
        )}

        {/* 6. SECURITY & FIREBASE RULES TAB */}
        {activeTab === 'security' && (
          <div className="max-w-3xl space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-bold text-xl text-stone-900">
                Firebase Security Rules & Cloud Architecture
              </h2>
              <p className="text-xs text-stone-500">
                Recommended production rules for your Firebase console at <code className="font-mono">kicks-8867d</code>.
              </p>
            </div>

            <div className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-[#FF6B35] font-bold text-xs uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Cloud Firestore Rules (firestore.rules)</span>
              </div>
              <pre className="p-4 rounded-2xl bg-stone-950 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check if authenticated user is admin
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.admin == true ||
        request.auth.token.email == "${DEFAULT_ADMIN_EMAIL}" ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    // Products: Public can read, only admin can create, update, delete
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Settings: Public can read store info, only admin can write
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Users: Users can read/write their own profile; admin has full access
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }
    
    // Orders: Users can read/create their own orders; admin can read/update all
    match /orders/{orderId} {
      allow create: if true;
      allow read, update: if isAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      allow delete: if isAdmin();
    }
  }
}`}
              </pre>
            </div>

            <div className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cloud Storage Rules (storage.rules)</span>
              </div>
              <pre className="p-4 rounded-2xl bg-stone-950 text-cyan-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`}
              </pre>
            </div>

          </div>
        )}

      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsProductModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl bg-[#F5F5F2] rounded-3xl skeuo-card p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <h3 className="font-display font-bold text-lg text-stone-900">
                {editingProduct ? 'Edit Shoe Product' : 'Add New Shoe Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Shoe Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nitro Apex 'Electric Fire'"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KICKS Lab, Nike, Velocity"
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={pCategory}
                    onChange={(e: any) => setPCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 cursor-pointer"
                  >
                    <option value="Sneakers">Sneakers</option>
                    <option value="Running Shoes">Running Shoes</option>
                    <option value="Sports Shoes">Sports Shoes</option>
                    <option value="Casual Shoes">Casual Shoes</option>
                    <option value="Formal Shoes">Formal Shoes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sale Price ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Available Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    placeholder="e.g. KCK-891"
                    className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono text-stone-900"
                  />
                </div>
              </div>

              {/* Sizes selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Available EU Sizes * (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[38, 39, 40, 41, 42, 43, 44, 45, 46].map((sz) => {
                    const isSelected = pSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          isSelected
                            ? 'bg-[#151515] text-white shadow-sm'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900"
                />
              </div>

              {/* Shoe Image Upload / Preview */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Shoe Images (Upload from device or enter URL)
                </label>
                
                <div className="flex items-center gap-3 mb-2">
                  <label className="px-4 py-2.5 rounded-xl skeuo-btn-soft text-xs font-semibold cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#FF6B35]" />
                    <span>{uploadingImage ? 'Uploading to Firebase Storage...' : 'Upload Device Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                {/* Images Preview */}
                <div className="flex flex-wrap gap-2">
                  {pImages.map((imgUrl, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/10">
                      <img src={imgUrl} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPImages(pImages.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pFeatured}
                    onChange={(e) => setPFeatured(e.target.checked)}
                    className="rounded accent-[#FF6B35]"
                  />
                  <span>Mark as Featured</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pNewArrival}
                    onChange={(e) => setPNewArrival(e.target.checked)}
                    className="rounded accent-[#FF6B35]"
                  />
                  <span>Mark as New Arrival Drop</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/8">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl skeuo-btn-soft text-xs font-bold text-stone-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 py-2.5 rounded-xl skeuo-btn-primary font-display font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  {savingProduct ? 'Saving to Firestore...' : editingProduct ? 'Update Shoe' : 'Create Shoe'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
