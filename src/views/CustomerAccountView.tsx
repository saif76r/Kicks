import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Package, 
  Settings, 
  LogOut, 
  Check, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order, OrderStatus } from '../types';
import { subscribeToOrders } from '../services/storeService';
import { normalizeImageUrl, DEFAULT_PRODUCT_IMAGE } from '../lib/imageHelper';

interface CustomerAccountViewProps {
  initialTab?: 'orders' | 'profile';
  onTrackOrder: (orderId: string) => void;
  onExplore: () => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  initialTab = 'orders',
  onTrackOrder,
  onExplore
}) => {
  const { currentUser, userProfile, updateCustomerProfile, logout } = useAuth();
  const { settings } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  // Profile Edit State
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [city, setCity] = useState(userProfile?.city || 'Dhaka');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState<boolean>(false);

  // Subscribe to customer's orders in real-time
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToOrders(currentUser.uid, false, (data) => {
      setOrders(data);
      setLoadingOrders(false);
    });
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
      setCity(userProfile.city || 'Dhaka');
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateCustomerProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim()
      });
      setProfileSavedNotice(true);
      setTimeout(() => setProfileSavedNotice(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Pending</span>;
      case 'Payment Verification':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 animate-pulse">Payment Verification</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'Processing':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">Processing</span>;
      case 'Shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">Shipped</span>;
      case 'Delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Info Card */}
      <div className="rounded-3xl skeuo-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl skeuo-btn-dark flex items-center justify-center font-display font-black text-2xl text-white">
            {userProfile?.fullName?.[0]?.toUpperCase() || 'K'}
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-stone-900">
              {userProfile?.fullName || 'Valued Collector'}
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              {currentUser?.email}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer ID: {currentUser?.uid?.substring(0, 10)}...</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="px-4 py-2 rounded-xl skeuo-btn-soft text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 self-start sm:self-center"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-black/8 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#151515] text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-200/50'
          }`}
        >
          <Package className="w-4 h-4" />
          My Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-[#151515] text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-200/50'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Profile Settings
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-12 text-center text-xs text-stone-400 font-mono animate-pulse">
              Loading your order history...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl skeuo-card p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl skeuo-inset mx-auto flex items-center justify-center text-stone-400">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-stone-900">
                No orders yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                You haven't copped any pairs yet. Explore our latest sneaker releases and elevate your rotation.
              </p>
              <button
                onClick={onExplore}
                className="px-5 py-2.5 rounded-xl skeuo-btn-primary text-xs font-bold shadow-md"
              >
                Browse Kicks Catalog
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl skeuo-card p-5 sm:p-6 space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-stone-900">
                        {order.id}
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                        Total Amount
                      </span>
                      <span className="font-mono font-black text-base text-stone-900 tabular-nums">
                        {settings.currencySymbol}{order.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => onTrackOrder(order.id)}
                      className="px-3.5 py-2 rounded-xl skeuo-btn-primary text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Track Order
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-100/60 border border-black/5">
                      <img
                        src={normalizeImageUrl(item.image)}
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                        }}
                        className="w-12 h-12 rounded-lg object-cover bg-stone-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-stone-900 truncate">{item.name}</p>
                        <p className="text-[11px] font-mono text-stone-500">
                          Size EU {item.size} · Qty {item.quantity}
                        </p>
                        <p className="text-[11px] font-mono font-bold text-stone-800">
                          {settings.currencySymbol}{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment info bar */}
                <div className="pt-2 text-xs flex flex-wrap items-center justify-between gap-2 text-stone-600 bg-stone-50 p-3 rounded-xl border border-black/5">
                  <div className="flex items-center gap-3">
                    <span>
                      Payment: <strong className="uppercase text-stone-900">{order.paymentMethod}</strong>
                    </span>
                    {order.paymentDetails?.transactionId && (
                      <span>
                        TrxID: <strong className="font-mono text-stone-900">{order.paymentDetails.transactionId}</strong>
                      </span>
                    )}
                  </div>
                  <div>
                    Delivery: <strong className="text-stone-900">{order.customerDetails.address}, {order.customerDetails.city}</strong>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* PROFILE SETTINGS TAB */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl">
          <form onSubmit={handleSaveProfile} className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-5">
            <h3 className="font-display font-bold text-lg text-stone-900 pb-3 border-b border-black/8">
              Update Delivery & Profile Info
            </h3>

            {profileSavedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" /> Profile details saved successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-200/50 text-xs text-stone-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs font-mono text-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                City / Region
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 focus:outline-none cursor-pointer"
              >
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barisal">Barisal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Default Delivery Address
              </label>
              <textarea
                rows={3}
                placeholder="House, Road, Area..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl skeuo-inset-light text-xs text-stone-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="py-3 px-6 rounded-xl skeuo-btn-primary font-display font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2"
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
