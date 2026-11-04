import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Phone
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { useCart } from '../context/CartContext';

interface OrderTrackingViewProps {
  initialOrderId?: string;
  onExplore: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderId = '',
  onExplore
}) => {
  const { settings } = useCart();
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setSearching(true);
    setSearchError(null);

    const cleanId = id.trim().toUpperCase();

    try {
      // 1. Try Firestore
      const docRef = doc(db, 'orders', cleanId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setCurrentOrder({ id: snap.id, ...snap.data() } as Order);
        setSearching(false);
        return;
      }

      // 2. Try local orders backup
      const localOrders: Order[] = JSON.parse(localStorage.getItem('kicks_local_orders') || '[]');
      const match = localOrders.find(o => o.id.toUpperCase() === cleanId);
      if (match) {
        setCurrentOrder(match);
        setSearching(false);
        return;
      }

      setSearchError(`No order found matching ID "${cleanId}". Please check the ID provided on your confirmation screen.`);
      setCurrentOrder(null);
    } catch (err: any) {
      console.warn('Error fetching order from Firestore:', err);
      // Fallback local search
      const localOrders: Order[] = JSON.parse(localStorage.getItem('kicks_local_orders') || '[]');
      const match = localOrders.find(o => o.id.toUpperCase() === cleanId);
      if (match) {
        setCurrentOrder(match);
      } else {
        setSearchError('Could not retrieve order. Please verify your connection.');
      }
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderIdInput);
  };

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'Pending', label: 'Order Received', desc: 'Order logged and verified' },
    { key: 'Payment Verification', label: 'Payment Verification', desc: 'Admin verifying bKash/Nagad TrxID' },
    { key: 'Confirmed', label: 'Confirmed & Packed', desc: 'Footwear inspected and boxed' },
    { key: 'Shipped', label: 'In Transit', desc: 'Handed to courier for delivery' },
    { key: 'Delivered', label: 'Delivered', desc: 'Received at customer address' }
  ];

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'Pending',
      'Payment Verification',
      'Confirmed',
      'Processing',
      'Shipped',
      'Delivered'
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentStatus === 'Cancelled') return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-lg mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
          Live Order Tracking
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-stone-900">
          Track Your KICKS Shipment
        </h1>
        <p className="text-xs text-stone-500">
          Enter your unique 6-digit Order ID to check real-time verification and delivery progress.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto">
        <div className="relative flex items-center skeuo-card p-1.5 rounded-2xl">
          <input
            type="text"
            required
            placeholder="e.g. KICKS-882194"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm font-mono uppercase font-bold text-stone-900 placeholder-stone-400 focus:outline-none tracking-wider"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 rounded-xl skeuo-btn-primary font-display font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-4 h-4" />
            {searching ? 'Locating...' : 'Track'}
          </button>
        </div>
      </form>

      {/* Error state */}
      {searchError && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Order Status Display */}
      {currentOrder && (
        <div className="rounded-3xl skeuo-card p-6 sm:p-10 space-y-8 animate-in fade-in duration-200">
          
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/8">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-xl text-stone-900">
                  {currentOrder.id}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-900 text-white">
                  {currentOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                Grand Total
              </span>
              <span className="font-mono font-black text-2xl text-[#FF6B35] tabular-nums">
                {settings.currencySymbol}{currentOrder.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-stone-800 mb-6">
              Dispatch & Delivery Journey
            </h3>

            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {steps.map((st, i) => {
                  const status = getStepStatus(st.key, currentOrder.orderStatus);
                  const isDone = status === 'completed';
                  return (
                    <div key={st.key} className="flex flex-col items-start sm:items-center text-left sm:text-center space-y-2">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'skeuo-btn-primary text-white shadow-md'
                            : 'skeuo-inset text-stone-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                      </div>
                      <div>
                        <h4 className={`font-display font-bold text-xs ${isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                          {st.label}
                        </h4>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment & Verification Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-black/8">
            
            {/* Payment Verification Card */}
            <div className="p-4 rounded-2xl bg-stone-100/70 border border-black/5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <CreditCard className="w-4 h-4 text-[#FF6B35]" />
                <span>Payment & Verification Status</span>
              </div>
              <div className="space-y-1 text-stone-600">
                <p>
                  Method: <strong className="uppercase font-mono text-stone-900">{currentOrder.paymentMethod}</strong>
                </p>
                {currentOrder.paymentDetails?.transactionId && (
                  <p>
                    Transaction ID (TrxID): <strong className="font-mono text-stone-900">{currentOrder.paymentDetails.transactionId}</strong>
                  </p>
                )}
                {currentOrder.paymentDetails?.senderNumber && (
                  <p>
                    Sender Number: <strong className="font-mono text-stone-900">{currentOrder.paymentDetails.senderNumber}</strong>
                  </p>
                )}
                <p>
                  Verification Status:{' '}
                  {currentOrder.paymentStatus === 'verified' ? (
                    <span className="text-emerald-700 font-bold">✓ Verified by KICKS Admin</span>
                  ) : currentOrder.paymentStatus === 'paid_on_delivery' ? (
                    <span className="text-blue-700 font-bold">Cash on Delivery (Pending Delivery)</span>
                  ) : (
                    <span className="text-amber-700 font-bold">⏳ Verification in Progress</span>
                  )}
                </p>
              </div>
            </div>

            {/* Destination Info */}
            <div className="p-4 rounded-2xl bg-stone-100/70 border border-black/5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <MapPin className="w-4 h-4 text-[#FF6B35]" />
                <span>Shipping Destination</span>
              </div>
              <div className="space-y-1 text-stone-600">
                <p>Recipient: <strong className="text-stone-900">{currentOrder.customerDetails.fullName}</strong></p>
                <p>Phone: <strong className="font-mono text-stone-900">{currentOrder.customerDetails.phone}</strong></p>
                <p>Address: <strong className="text-stone-900">{currentOrder.customerDetails.address}, {currentOrder.customerDetails.city}</strong></p>
                {currentOrder.customerDetails.notes && (
                  <p className="italic text-stone-500">Note: "{currentOrder.customerDetails.notes}"</p>
                )}
              </div>
            </div>

          </div>

          {/* Ordered Pairs */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-stone-800 mb-3">
              Items in this Package
            </h4>
            <div className="space-y-2">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl skeuo-inset-light">
                  <img
                    src={item.image || '/src/assets/images/kicks_hero_sneaker_1793611731340.jpg'}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-stone-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-stone-500 font-mono">
                      EU Size: {item.size} · Quantity: {item.quantity} · Unit Price: {settings.currencySymbol}{item.price.toLocaleString()}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-xs text-stone-900 tabular-nums">
                    {settings.currencySymbol}{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
