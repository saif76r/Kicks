import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Phone, 
  MapPin, 
  AlertCircle,
  Copy,
  Check,
  Truck,
  Lock,
  MessageCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../services/storeService';
import { Order, PaymentMethod, PaymentStatus, OrderStatus } from '../types';

interface CheckoutViewProps {
  onBackToCart: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onBackToCart,
  onOrderSuccess
}) => {
  const { items, subtotal, deliveryCharge, total, clearCart, settings } = useCart();
  const { currentUser, userProfile } = useAuth();

  // Customer Delivery Info State
  const [fullName, setFullName] = useState(userProfile?.fullName || currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [city, setCity] = useState(userProfile?.city || 'Dhaka');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  // UI States
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      if (!fullName) setFullName(userProfile.fullName || '');
      if (!phone && userProfile.phone) setPhone(userProfile.phone);
      if (!address && userProfile.address) setAddress(userProfile.address);
      if (!city && userProfile.city) setCity(userProfile.city);
    }
  }, [userProfile]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(type);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (items.length === 0) {
      setErrorMessage('Your bag is empty. Please add shoes before checking out.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setErrorMessage('Please fill in all required delivery fields.');
      return;
    }

    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!senderNumber.trim() || !transactionId.trim()) {
        setErrorMessage(`Please provide your sender ${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} number and Transaction ID.`);
        return;
      }
      if (transactionId.trim().length < 6) {
        setErrorMessage('Please enter a valid Transaction ID.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const orderStatus: OrderStatus = paymentMethod === 'cod' ? 'Pending' : 'Payment Verification';
      const paymentStatus: PaymentStatus = paymentMethod === 'cod' ? 'paid_on_delivery' : 'pending_verification';

      const orderData: Omit<Order, 'id'> = {
        userId: currentUser ? currentUser.uid : 'guest_customer',
        customerDetails: {
          fullName: fullName.trim(),
          email: email.trim() || (currentUser?.email || 'guest@kicksstore.com'),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          notes: notes.trim()
        },
        items: items.map(item => ({
          productId: item.productId,
          name: item.product.name,
          brand: item.product.brand,
          image: item.product.images[0] || '',
          price: item.product.price,
          size: item.selectedSize,
          quantity: item.quantity
        })),
        subtotal,
        deliveryCharge,
        totalAmount: total,
        paymentMethod,
        paymentDetails: {
          method: paymentMethod,
          senderNumber: senderNumber.trim() || undefined,
          transactionId: transactionId.trim() ? transactionId.trim().toUpperCase() : undefined,
          amount: total
        },
        paymentStatus,
        orderStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newOrderId = await placeOrder(orderData);
      clearCart();
      onOrderSuccess(newOrderId);
    } catch (err: any) {
      console.error('Error placing order:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToCart}
          className="p-2 rounded-xl skeuo-btn-soft text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900">
            Secure Checkout
          </h1>
          <p className="text-xs text-stone-500">
            Complete your shipping details and select payment method
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Delivery Form + Payment Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* STEP 1: DELIVERY ADDRESS */}
          <div className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#151515] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="font-display font-bold text-base text-stone-900">
                  Customer & Delivery Information
                </h2>
              </div>
              <span className="text-xs text-stone-400">All fields required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saif Meer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number (Active for Delivery) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address (For Order Receipts)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City / Area *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 focus:outline-none focus:border-stone-400 cursor-pointer"
                >
                  <option value="Dhaka">Dhaka (Express 24-48h)</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                  <option value="Other District">Other District</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Street Address, House & Road No. *
              </label>
              <textarea
                required
                rows={2}
                placeholder="House #, Road #, Sector/Area, Landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl skeuo-inset-light text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Order Notes / Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Call before arrival, leave with security..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl skeuo-inset-light text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>

          </div>

          {/* STEP 2: PAYMENT METHOD */}
          <div className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FF6B35] text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="font-display font-bold text-base text-stone-900">
                  Select Payment Option
                </h2>
              </div>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure
              </span>
            </div>

            {/* Payment Options Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Option A: bKash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  paymentMethod === 'bkash'
                    ? 'border-[#E2136E] bg-[#E2136E]/5 shadow-md'
                    : 'border-black/5 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-sm text-[#E2136E]">bKash</span>
                  {paymentMethod === 'bkash' && (
                    <div className="w-4 h-4 rounded-full bg-[#E2136E] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">Send Money with TrxID</p>
              </button>

              {/* Option B: Nagad */}
              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  paymentMethod === 'nagad'
                    ? 'border-[#F7941D] bg-[#F7941D]/5 shadow-md'
                    : 'border-black/5 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-sm text-[#F7941D]">Nagad</span>
                  {paymentMethod === 'nagad' && (
                    <div className="w-4 h-4 rounded-full bg-[#F7941D] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">Send Money with TrxID</p>
              </button>

              {/* Option C: Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  paymentMethod === 'cod'
                    ? 'border-[#151515] bg-stone-100 shadow-md'
                    : 'border-black/5 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-sm text-stone-900">Cash on Delivery</span>
                  {paymentMethod === 'cod' && (
                    <div className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">Pay when shoes arrive</p>
              </button>

            </div>

            {/* CONDITIONAL PAYMENT FORM: BKASH */}
            {paymentMethod === 'bkash' && (
              <div className="p-5 rounded-2xl bg-white border border-[#E2136E]/20 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E2136E]">
                      Official bKash Payment Details
                    </span>
                    <h3 className="font-display font-bold text-stone-900 text-sm mt-0.5">
                      Send Money to KICKS Official Account
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono bg-pink-100 text-[#E2136E] px-2 py-0.5 rounded font-bold">
                    {settings.bkashAccountType}
                  </span>
                </div>

                {/* Account Number Box */}
                <div className="p-3.5 rounded-xl skeuo-inset flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 block">bKash Number:</span>
                    <span className="font-mono font-black text-base text-stone-900 tracking-wider">
                      {settings.bkashNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.bkashNumber, 'bkash')}
                    className="px-3 py-1.5 rounded-lg skeuo-btn-soft text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copiedNumber === 'bkash' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-600" />
                        Copy Number
                      </>
                    )}
                  </button>
                </div>

                {/* Amount to Send */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-black/5">
                  <span className="text-stone-600">Exact Payable Amount:</span>
                  <span className="font-mono font-black text-sm text-[#E2136E]">
                    {settings.currencySymbol}{total.toLocaleString()}
                  </span>
                </div>

                {/* Instructions */}
                <div className="text-[11px] text-stone-500 space-y-1">
                  <p>1. Open bKash app → Select <strong>Send Money</strong>.</p>
                  <p>2. Enter <strong className="font-mono text-stone-800">{settings.bkashNumber}</strong> and send <strong className="font-mono text-stone-800">{settings.currencySymbol}{total.toLocaleString()}</strong>.</p>
                  <p>3. Copy the 10-digit <strong>Transaction ID (TrxID)</strong> from your bKash receipt and submit below.</p>
                </div>

                {/* Verification Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Sender bKash Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl skeuo-inset-light text-xs font-mono text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      bKash Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BL9A8X7Q"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl skeuo-inset-light text-xs font-mono uppercase text-stone-900 focus:outline-none tracking-wider"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 italic">
                  * Note: Admin verifies payment details before confirming order dispatch. Never share your bKash PIN.
                </p>
              </div>
            )}

            {/* CONDITIONAL PAYMENT FORM: NAGAD */}
            {paymentMethod === 'nagad' && (
              <div className="p-5 rounded-2xl bg-white border border-[#F7941D]/20 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F7941D]">
                      Official Nagad Payment Details
                    </span>
                    <h3 className="font-display font-bold text-stone-900 text-sm mt-0.5">
                      Send Money to KICKS Official Account
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono bg-orange-100 text-[#F7941D] px-2 py-0.5 rounded font-bold">
                    {settings.nagadAccountType}
                  </span>
                </div>

                {/* Account Number Box */}
                <div className="p-3.5 rounded-xl skeuo-inset flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Nagad Number:</span>
                    <span className="font-mono font-black text-base text-stone-900 tracking-wider">
                      {settings.nagadNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.nagadNumber, 'nagad')}
                    className="px-3 py-1.5 rounded-lg skeuo-btn-soft text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copiedNumber === 'nagad' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-600" />
                        Copy Number
                      </>
                    )}
                  </button>
                </div>

                {/* Amount to Send */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-black/5">
                  <span className="text-stone-600">Exact Payable Amount:</span>
                  <span className="font-mono font-black text-sm text-[#F7941D]">
                    {settings.currencySymbol}{total.toLocaleString()}
                  </span>
                </div>

                {/* Instructions */}
                <div className="text-[11px] text-stone-500 space-y-1">
                  <p>1. Open Nagad app → Select <strong>Send Money</strong>.</p>
                  <p>2. Enter <strong className="font-mono text-stone-800">{settings.nagadNumber}</strong> and send <strong className="font-mono text-stone-800">{settings.currencySymbol}{total.toLocaleString()}</strong>.</p>
                  <p>3. Enter your Nagad <strong>Transaction ID (TrxID)</strong> below.</p>
                </div>

                {/* Verification Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Sender Nagad Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl skeuo-inset-light text-xs font-mono text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nagad Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7X8K9L2P"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl skeuo-inset-light text-xs font-mono uppercase text-stone-900 focus:outline-none tracking-wider"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CONDITIONAL PAYMENT FORM: COD */}
            {paymentMethod === 'cod' && (
              <div className="p-5 rounded-2xl bg-stone-100 border border-stone-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <Truck className="w-4 h-4 text-[#FF6B35]" />
                  <span>Cash on Delivery (COD)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  You will pay the total amount of <strong className="font-mono text-stone-900">{settings.currencySymbol}{total.toLocaleString()}</strong> in cash directly to the courier agent when your package arrives. Please inspect the shoe box before payment.
                </p>
              </div>
            )}

            {/* WhatsApp Assistance Banner */}
            <a
              href="https://wa.me/8801706695247?text=Hello%20KICKS,%20I%20have%20a%20question%20about%20payment%20and%20product%20details."
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 border border-emerald-300/80 text-emerald-950 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 leading-tight">
                    Product details ও পেমেন্ট সহায়তায় WhatsApp-এ নক দিন
                  </p>
                  <p className="text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>WhatsApp: 01706695247</span>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-xs group-hover:bg-[#25D366] group-hover:text-white transition-all shrink-0">
                Chat Now →
              </span>
            </a>

          </div>

        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-6 sticky top-28">
            
            <h2 className="font-display font-bold text-lg text-stone-900 pb-3 border-b border-black/8">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.images[0] || '/src/assets/images/kicks_hero_sneaker_1793611731340.jpg'}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-200 shrink-0 border border-black/5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{item.product.name}</p>
                    <p className="text-stone-500 text-[11px] font-mono">
                      Size: EU {item.selectedSize} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-stone-900 tabular-nums shrink-0">
                    {settings.currencySymbol}{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="pt-4 border-t border-black/8 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-stone-900 tabular-nums">
                  {settings.currencySymbol}{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge ({city})</span>
                <span className="font-mono font-semibold text-stone-900 tabular-nums">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `${settings.currencySymbol}${deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-black/8 flex justify-between text-base font-bold text-stone-900">
                <span className="font-display">Total Amount</span>
                <span className="font-mono font-black text-xl text-[#FF6B35] tabular-nums">
                  {settings.currencySymbol}{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 px-6 rounded-2xl skeuo-btn-primary font-display font-bold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 ${
                submitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Confirming Your Order...' : 'Confirm & Place Order'}
            </button>

            <div className="text-center">
              <span className="text-[11px] text-stone-400">
                By ordering, you agree to KICKS Terms & 7-Day Size Exchange Policy.
              </span>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
};
