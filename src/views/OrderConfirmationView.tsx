import React from 'react';
import { CheckCircle2, Clock, Truck, ArrowRight, Package, Copy, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface OrderConfirmationViewProps {
  orderId: string;
  onTrackOrder: (orderId: string) => void;
  onContinueShopping: () => void;
  onViewAccountOrders: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  orderId,
  onTrackOrder,
  onContinueShopping,
  onViewAccountOrders
}) => {
  const { settings } = useCart();
  const [copied, setCopied] = React.useState(false);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Confirmation Card */}
      <div className="rounded-3xl skeuo-card p-8 sm:p-12 text-center space-y-6">
        
        {/* Animated Badge */}
        <div className="w-20 h-20 rounded-3xl skeuo-btn-primary mx-auto flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
            Order Confirmed & Logged
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-stone-900">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            Your footwear order has been successfully placed. We are preparing your pairs for dispatch.
          </p>
        </div>

        {/* Order ID Box */}
        <div className="max-w-md mx-auto p-4 rounded-2xl skeuo-inset flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-semibold">
              Your Unique Order ID
            </span>
            <span className="font-mono font-black text-lg text-stone-900 tracking-wider">
              {orderId}
            </span>
          </div>

          <button
            onClick={handleCopyOrderId}
            className="px-3 py-1.5 rounded-xl skeuo-btn-soft text-xs font-semibold flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-600" />
                Copy ID
              </>
            )}
          </button>
        </div>

        {/* Next Steps / Payment Status Note */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Verification & Dispatch Timeline</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            • <strong>bKash / Nagad Orders:</strong> Our admin team verifies your Transaction ID with the payment gateway and confirms your order shortly.
            <br />
            • <strong>Cash on Delivery (COD):</strong> You will receive a verification SMS or phone call before your order is handed over to the courier.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onTrackOrder(orderId)}
            className="px-6 py-3 rounded-xl skeuo-btn-primary font-display font-bold text-xs tracking-wider uppercase shadow-lg flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            Track Order Live
          </button>

          <button
            onClick={onViewAccountOrders}
            className="px-6 py-3 rounded-xl skeuo-btn-soft font-display font-bold text-xs tracking-wider uppercase flex items-center gap-2 text-stone-800 hover:text-stone-900"
          >
            <Package className="w-4 h-4" />
            View in My Orders
          </button>

          <button
            onClick={onContinueShopping}
            className="px-6 py-3 rounded-xl bg-transparent hover:bg-stone-200/50 text-stone-700 font-display font-bold text-xs tracking-wider uppercase"
          >
            Continue Shopping
          </button>
        </div>

        <div className="pt-4 border-t border-black/5 flex items-center justify-center gap-2 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Order Processing. 100% Genuine Guaranteed.</span>
        </div>

      </div>

    </div>
  );
};
