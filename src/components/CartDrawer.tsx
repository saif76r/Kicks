import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { normalizeImageUrl, DEFAULT_PRODUCT_IMAGE } from '../lib/imageHelper';

interface CartDrawerProps {
  onCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onExplore }) => {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    updateSize, 
    subtotal, 
    deliveryCharge, 
    total, 
    settings 
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = settings.freeDeliveryThreshold;
  const remainingForFreeShipping = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F5F5F2] shadow-2xl flex flex-col border-l border-black/10 animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-5 border-b border-black/8 flex items-center justify-between bg-white/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF6B35]" />
              <h2 className="font-display font-bold text-lg text-stone-900">Your Bag</h2>
              <span className="text-xs font-mono font-bold bg-stone-200 text-stone-800 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl skeuo-btn-soft text-stone-600 hover:text-stone-900"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="px-5 py-3 bg-stone-100/80 border-b border-black/5">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5 text-stone-700">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#FF6B35]" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="font-mono text-stone-900">{settings.currencySymbol}{remainingForFreeShipping.toLocaleString()}</strong> for Free Delivery
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold">
                    ✓ You qualified for Free Delivery!
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-stone-500">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF6B35] transition-all duration-300 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl skeuo-inset flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-stone-800">Your bag is empty</h3>
                  <p className="text-xs text-stone-500 max-w-xs mt-1">
                    Explore our freshest drops and athletic sneakers to fill your collection.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExplore();
                  }}
                  className="px-5 py-2.5 rounded-xl skeuo-btn-primary text-xs font-bold shadow-md"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id}
                  className="rounded-xl skeuo-card p-3 flex gap-3.5 items-center relative transition-all"
                >
                  {/* Thumbnail */}
                  <img
                    src={normalizeImageUrl(item.product.images[0])}
                    alt={item.product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                    }}
                    className="w-20 h-20 rounded-lg object-cover bg-stone-200 shrink-0 border border-black/5"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600 truncate">
                      {item.product.brand}
                    </p>
                    <h4 className="font-display font-bold text-xs text-stone-900 truncate">
                      {item.product.name}
                    </h4>

                    {/* Size Selector */}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-stone-600">Size:</span>
                      <select
                        value={item.selectedSize}
                        onChange={(e) => updateSize(item.id, Number(e.target.value))}
                        className="text-[11px] font-mono font-semibold bg-white border border-black/10 rounded px-1.5 py-0.5 text-stone-800 focus:outline-none"
                      >
                        {item.product.availableSizes.map((sz) => (
                          <option key={sz} value={sz}>
                            EU {sz}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stepper & Price */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center skeuo-inset rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-700 hover:text-black rounded"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-700 hover:text-black rounded disabled:opacity-40"
                          disabled={item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-bold text-xs text-stone-900 tabular-nums">
                        {settings.currencySymbol}{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-2.5 right-2.5 p-1 text-stone-500 hover:text-rose-600 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer / Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-black/8 bg-white/80 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-stone-900 tabular-nums">
                    {settings.currencySymbol}{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated Delivery</span>
                  <span className="font-mono font-semibold text-stone-900 tabular-nums">
                    {deliveryCharge === 0 ? 'FREE' : `${settings.currencySymbol}${deliveryCharge}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-black/5 flex justify-between text-sm font-bold text-stone-900">
                  <span className="font-display">Total</span>
                  <span className="font-mono font-black text-base text-[#151515] tabular-nums">
                    {settings.currencySymbol}{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3 px-4 rounded-xl skeuo-btn-primary font-display font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Manual bKash, Nagad & Cash on Delivery Accepted</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
