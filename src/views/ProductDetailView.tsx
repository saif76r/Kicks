import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Ruler, 
  Check, 
  Layers,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { normalizeImageUrl, DEFAULT_PRODUCT_IMAGE } from '../lib/imageHelper';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCheckout: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  onNavigateToCheckout
}) => {
  const { addToCart, settings } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<number>(product.availableSizes[0] || 42);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'sizing' | 'payment'>('desc');
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const ok = addToCart(product, selectedSize, quantity);
    if (ok) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    onNavigateToCheckout();
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl skeuo-btn-soft text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* Main Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Sticky Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden skeuo-surface p-3 bg-white">
            <img
              src={normalizeImageUrl(product.images[activeImageIndex] || product.images[0])}
              alt={product.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
              }}
              className="w-full h-full object-cover rounded-2xl transition-all duration-300"
            />
            {discountPercent && (
              <span className="absolute top-6 left-6 px-3 py-1 rounded-lg skeuo-btn-primary font-mono font-bold text-xs shadow-md">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all p-1 bg-white ${
                    activeImageIndex === idx
                      ? 'border-[#FF6B35] shadow-md scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={normalizeImageUrl(img)} 
                    alt={`View ${idx + 1}`} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                    }}
                    className="w-full h-full object-cover rounded-lg" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Purchase Control Module (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                <span>{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span>{product.category}</span>
                {product.sku && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-stone-400">{product.sku}</span>
                  </>
                )}
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-2 text-xs">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <span className="font-mono font-bold text-stone-800">{product.rating || 4.9}</span>
                <span className="text-stone-400">({product.reviewCount || 34} customer reviews)</span>
              </div>
            </div>

            {/* Price section */}
            <div className="pt-2 border-t border-black/5 flex items-baseline gap-3">
              <span className="font-mono font-black text-3xl text-stone-900 tabular-nums">
                {settings.currencySymbol}{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-mono text-base text-stone-400 line-through tabular-nums">
                  {settings.currencySymbol}{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Level Warning */}
            <div className="text-xs">
              {isOutOfStock ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-bold">Currently Out of Stock</span>
                </div>
              ) : isLowStock ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Low Stock: Only <strong className="font-mono">{product.stock}</strong> pairs remaining!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>In Stock & Ready for Immediate Dispatch ({product.stock} pairs)</span>
                </div>
              )}
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-800">Select Shoe Size (EU)</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('sizing')}
                  className="text-[#FF6B35] font-semibold flex items-center gap-1 hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size Chart
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {[39, 40, 41, 42, 43, 44, 45].map((size) => {
                  const isAvailable = product.availableSizes.includes(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!isAvailable || isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all relative ${
                        isSelected && isAvailable
                          ? 'bg-[#151515] text-white shadow-md scale-105'
                          : isAvailable
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                          : 'bg-stone-100/40 text-stone-300 line-through cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            {!isOutOfStock && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center skeuo-inset rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-stone-700 hover:text-black disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-sm text-stone-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-stone-700 hover:text-black disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-stone-500 font-mono">
                    Max: {product.stock} available
                  </span>
                </div>
              </div>
            )}

            {/* CTA Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-2xl skeuo-btn-primary font-display font-bold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2.5 ${
                  isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={`w-full py-3 rounded-2xl skeuo-btn-dark font-display font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 ${
                  isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Zap className="w-4 h-4 text-[#FF6B35]" />
                Instant Checkout
              </button>
            </div>

            {/* Added feedback */}
            {addedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
                <Check className="w-4 h-4" /> Added to your shopping bag!
              </div>
            )}

            {/* WhatsApp Product Inquiry */}
            <a
              href={`https://wa.me/8801706695247?text=${encodeURIComponent(`Hello KICKS, I would like to know product details about "${product.name}" (Price: ৳${product.price.toLocaleString()}, SKU: ${product.sku}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-white hover:from-emerald-100/80 hover:to-emerald-50/50 border border-emerald-300/80 text-emerald-950 flex items-center justify-between gap-3 transition-all shadow-sm hover:shadow-md group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 leading-snug">
                    Product details জানতে WhatsApp-এ নক দিন
                  </p>
                  <p className="text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>WhatsApp: 01706695247</span>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs group-hover:bg-[#25D366] group-hover:text-white group-hover:border-transparent transition-all shrink-0">
                Chat Now →
              </span>
            </a>

            {/* Trust bullet list */}
            <div className="pt-4 border-t border-black/5 space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Guaranteed Authentic or Money Back</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF6B35]" />
                <span>24-48 Hours Express Delivery in Dhaka</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-stone-500" />
                <span>Hassle-Free 7-Day Size Swaps</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Product Details Tabs (Description, Specs, Sizing, Payments) */}
      <div className="rounded-3xl skeuo-card p-6 sm:p-10 space-y-6">
        
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-black/8 pb-2 overflow-x-auto">
          {[
            { id: 'desc', label: 'Overview & Craft' },
            { id: 'specs', label: 'Technical Materials' },
            { id: 'sizing', label: 'Shoe Sizing Guide' },
            { id: 'payment', label: 'bKash & Nagad Guide' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#151515] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="text-stone-700 text-xs sm:text-sm leading-relaxed max-w-3xl">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <p>
                Each shoe silhouette undergoes rigorous stress testing to maintain structural rigidity, high arch support, and heel lockdown during aggressive directional cuts and long urban walks.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl skeuo-inset-light space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-400">Upper Construction</span>
                  <p className="font-semibold text-stone-900">{product.materials || 'Full-grain leather and engineered monomesh'}</p>
                </div>
                <div className="p-4 rounded-xl skeuo-inset-light space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-400">Midsole Density</span>
                  <p className="font-semibold text-stone-900">Nitrogen-infused responsive rebound compound</p>
                </div>
                <div className="p-4 rounded-xl skeuo-inset-light space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-400">Traction Pattern</span>
                  <p className="font-semibold text-stone-900">Multidirectional zonal herringbone rubber</p>
                </div>
                <div className="p-4 rounded-xl skeuo-inset-light space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-400">SKU Reference</span>
                  <p className="font-semibold text-stone-900 font-mono">{product.sku || 'KCK-PRD-GEN'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sizing' && (
            <div className="space-y-4">
              <p>
                Our footwear uses standard European (EU) sizing measurements. If you have wider feet, we recommend ordering half a size up for racing models.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 text-stone-500">
                      <th className="py-2 pr-4">EU Size</th>
                      <th className="py-2 pr-4">US Men</th>
                      <th className="py-2 pr-4">UK Size</th>
                      <th className="py-2 pr-4">Length (CM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-stone-800">
                    <tr><td className="py-2">40</td><td>7.0</td><td>6.5</td><td>25.0 cm</td></tr>
                    <tr><td className="py-2">41</td><td>8.0</td><td>7.5</td><td>26.0 cm</td></tr>
                    <tr><td className="py-2">42</td><td>8.5</td><td>8.0</td><td>26.5 cm</td></tr>
                    <tr><td className="py-2">43</td><td>9.5</td><td>9.0</td><td>27.5 cm</td></tr>
                    <tr><td className="py-2">44</td><td>10.0</td><td>9.5</td><td>28.0 cm</td></tr>
                    <tr><td className="py-2">45</td><td>11.0</td><td>10.5</td><td>29.0 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 text-sm">How to Pay via bKash or Nagad</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-stone-600">
                <li>Select bKash or Nagad at checkout to reveal our official Send Money account number.</li>
                <li>Open your bKash/Nagad app and send the exact order amount.</li>
                <li>Enter your sender number and the 10-character Transaction ID (TrxID) in the checkout form.</li>
                <li>Our admin team verifies the transaction and immediately marks your order as Confirmed!</li>
                <li>You can also pick <strong>Cash on Delivery (COD)</strong> to pay upon inspection at your door.</li>
              </ol>
            </div>
          )}
        </div>

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-stone-900">
              You May Also Like
            </h3>
            <span className="text-xs text-stone-500 font-medium">Similar in {product.category}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
