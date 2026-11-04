import React from 'react';
import { ArrowRight, Shield, RefreshCw, Truck, Award, Star } from 'lucide-react';
import { Product, ShoeCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

interface HomeViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onSelectProduct,
  onNavigate
}) => {
  const { settings } = useCart();
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl skeuo-card p-6 sm:p-10 lg:p-14 overflow-hidden border border-black/8">
            
            {/* Background textural subtle ambient glows */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FF6B35]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-stone-300/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Text Content */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Micro kicker */}
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#FF6B35]">
                  <span>2026 Limited Edition Drop</span>
                </div>

                {/* Hero Headline */}
                <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#151515] leading-[1.08] tracking-tight">
                  SCULPTED FOR SPEED. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#f44e11]">
                    ENGINEERED
                  </span> FOR STREETS.
                </h1>

                {/* Subtitle */}
                <p className="text-stone-600 text-sm sm:text-base max-w-xl leading-relaxed">
                  Discover high-performance sneakers, carbon-plated racing silhouettes, and handcrafted leather classics with express delivery and secure bKash, Nagad, and Cash on Delivery.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-6 py-3.5 rounded-2xl skeuo-btn-primary font-display font-bold text-sm tracking-wide shadow-xl flex items-center gap-2.5"
                  >
                    <span>Shop All Kicks</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('shop', 'Running Shoes')}
                    className="px-6 py-3.5 rounded-2xl skeuo-btn-soft font-display font-bold text-sm text-stone-800 hover:text-stone-900 shadow-md"
                  >
                    Explore Performance
                  </button>
                </div>

                {/* Quick Trust Bar */}
                <div className="pt-4 flex items-center gap-6 text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">100% Authentic Guaranteed</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#FF6B35]" />
                    <span className="font-medium">Free Delivery over {settings.currencySymbol}{settings.freeDeliveryThreshold}</span>
                  </div>
                </div>

              </div>

              {/* Floating Hero Visual Showcase */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden skeuo-surface p-3 group">
                  <img
                    src="/src/assets/images/kicks_hero_sneaker_1793611731340.jpg"
                    alt="KICKS Nitro Apex Sneaker"
                    className="w-full h-full object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Floating Price Badge */}
                  <div className="absolute bottom-6 left-6 skeuo-btn-dark px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Featured Drop</p>
                      <p className="font-display font-bold text-xs text-white">Nitro Apex 'Fire'</p>
                    </div>
                    <div className="h-6 w-[1px] bg-white/20" />
                    <span className="font-mono font-black text-sm text-[#FF6B35]">
                      {settings.currencySymbol}6,850
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4-COLUMN VALUE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl skeuo-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl skeuo-inset flex items-center justify-center text-[#FF6B35] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-stone-900">Original Certified</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Every sneaker is verified for authentic factory materials and stitching.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl skeuo-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl skeuo-inset flex items-center justify-center text-[#FF6B35] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-stone-900">Express Nationwide Delivery</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                24-48 hours inside Dhaka, 72 hours across all 64 districts in Bangladesh.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl skeuo-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl skeuo-inset flex items-center justify-center text-[#FF6B35] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-stone-900">7-Day Size Exchange</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Wrong fit? Swap your pair easily with our doorstep return service.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl skeuo-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl skeuo-inset flex items-center justify-center text-emerald-600 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-stone-900">Verified bKash & Nagad</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Direct manual payments with transaction ID tracking or Cash on Delivery.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">Top Rated</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
              Featured Sneakers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-stone-700 hover:text-[#FF6B35] flex items-center gap-1.5"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">Fresh In Store</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-stone-700 hover:text-[#FF6B35] flex items-center gap-1.5"
          >
            <span>See What's New</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* PROMOTIONAL SKEUOMORPHIC BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl skeuo-surface-dark p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#FF6B35]">
              Seamless Payments
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight leading-snug">
              Curated Exclusively for Sneakerhead Collectors.
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Pay quickly via manual bKash or Nagad Send Money with instant transaction confirmation, or choose Cash on Delivery at your doorstep.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('shop')}
                className="px-5 py-3 rounded-xl skeuo-btn-primary font-display font-bold text-xs tracking-wider uppercase shadow-xl"
              >
                Shop Now
              </button>
              <button
                onClick={() => onNavigate('tracking')}
                className="px-5 py-3 rounded-xl skeuo-btn-soft font-display font-bold text-xs tracking-wider uppercase"
              >
                Track Any Order
              </button>
            </div>
          </div>

          <div className="absolute -bottom-10 -right-10 w-72 h-72 opacity-15 pointer-events-none">
            <div className="w-full h-full rounded-full border-8 border-[#FF6B35]" />
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">Community Voice</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
            Loved by Sneakerheads
          </h2>
          <p className="text-xs text-stone-500 mt-1.5">
            Real feedback from athletes and collectors across Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl skeuo-card space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              "The Nitro Apex pair is insane. The bounce is unreal on road runs, and the bKash manual verification took less than 15 minutes. Very trustworthy."
            </p>
            <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
              <strong className="text-stone-900 font-semibold">Tanvir Ahmed</strong>
              <span className="text-stone-400">Dhaka</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl skeuo-card space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              "Ordered on my laptop at office, logged in on my phone at home and my order history and saved items were seamlessly available. Best sneaker store in Bangladesh."
            </p>
            <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
              <strong className="text-stone-900 font-semibold">Saif Rahman</strong>
              <span className="text-stone-400">Chittagong</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl skeuo-card space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              "Heritage Court retro leather feels super premium. Packing was pristine, double-boxed with shoe trees. Will definitely cop the new drops."
            </p>
            <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
              <strong className="text-stone-900 font-semibold">Farzana K.</strong>
              <span className="text-stone-400">Sylhet</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
