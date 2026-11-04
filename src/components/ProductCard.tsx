import React, { useState } from 'react';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { normalizeImageUrl, DEFAULT_PRODUCT_IMAGE } from '../lib/imageHelper';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, settings } = useCart();
  const [selectedSize, setSelectedSize] = useState<number>(product.availableSizes[0] || 42);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [showQuickSizes, setShowQuickSizes] = useState<boolean>(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleQuickAdd = (e: React.MouseEvent, size: number) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const ok = addToCart(product, size, 1);
    if (ok) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1500);
      setShowQuickSizes(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative rounded-2xl skeuo-card skeuo-card-hover overflow-hidden cursor-pointer flex flex-col transition-all duration-200"
    >
      {/* Visual Image Container - 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] w-full bg-[#ECECE9] overflow-hidden">
        <img
          src={normalizeImageUrl(product.images[0])}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
          }}
        />

        {/* Subtle top gradient shadow highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5 opacity-40 group-hover:opacity-20 transition-opacity" />

        {/* Status Indicators (Top-left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.newArrival && (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg skeuo-btn-primary shadow-sm">
              New Drop
            </span>
          )}
          {product.featured && !product.newArrival && (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg skeuo-btn-dark shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Stock Alert (Top-right) */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-stone-900/80 text-rose-300 backdrop-blur-sm">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] font-medium text-amber-900 bg-amber-100/90 backdrop-blur-sm px-2 py-0.5 rounded-md border border-amber-300">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Quick View / Add overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="px-3 py-1.5 rounded-lg bg-white/95 text-stone-900 text-xs font-semibold shadow-lg hover:bg-white flex items-center gap-1.5 backdrop-blur-sm"
          >
            <Eye className="w-3.5 h-3.5 text-stone-600" />
            Details
          </button>

          {!isOutOfStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickSizes(!showQuickSizes);
              }}
              className="px-3 py-1.5 rounded-lg skeuo-btn-primary text-xs font-bold shadow-lg flex items-center gap-1.5"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Quick Add
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick Size Flyout */}
        {showQuickSizes && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute inset-x-2 bottom-2 p-2.5 bg-stone-900/95 backdrop-blur-md rounded-xl text-white z-30 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between text-[11px] font-medium mb-1.5 text-stone-300">
              <span>Select Size (EU):</span>
              <button 
                onClick={() => setShowQuickSizes(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.availableSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => handleQuickAdd(e, sz)}
                  className="px-2 py-1 rounded bg-stone-800 hover:bg-[#FF6B35] text-[11px] font-mono font-bold text-white transition-colors"
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category (Unboxed zero-pill text) */}
          <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
            <span>{product.brand}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{product.category}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-display font-bold text-stone-900 text-sm leading-snug group-hover:text-[#FF6B35] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Price & Mobile CTA */}
        <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-black text-base text-stone-900 tabular-nums">
              {settings.currencySymbol}{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-mono text-xs text-stone-500 line-through tabular-nums">
                {settings.currencySymbol}{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="text-[11px] text-stone-600 font-mono">
            {product.availableSizes.length} sizes
          </div>
        </div>
      </div>
    </div>
  );
};
