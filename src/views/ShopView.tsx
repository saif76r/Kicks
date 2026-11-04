import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  X, 
  ArrowUpDown, 
  Check, 
  RotateCcw,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import { Product, ShoeCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

interface ShopViewProps {
  products: Product[];
  initialCategory?: string;
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  initialCategory,
  onSelectProduct,
  searchQuery,
  setSearchQuery
}) => {
  const { settings } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(12000);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Extract distinct brands & categories
  const categories: string[] = ['All', 'Sneakers', 'Running Shoes', 'Sports Shoes', 'Casual Shoes', 'Formal Shoes'];
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.brand));
    return ['All', ...Array.from(set)];
  }, [products]);

  const allSizes = [39, 40, 41, 42, 43, 44, 45];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCat && !matchesDesc) return false;
      }

      // Category
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Brand
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
        return false;
      }

      // Size
      if (selectedSize !== null && !p.availableSizes.includes(selectedSize)) {
        return false;
      }

      // Stock
      if (onlyInStock && p.stock <= 0) {
        return false;
      }

      // Price
      if (p.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedSize, onlyInStock, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedSize(null);
    setOnlyInStock(false);
    setMaxPrice(12000);
    setSearchQuery('');
    setSortBy('featured');
  };

  const hasActiveFilters = 
    selectedCategory !== 'All' || 
    selectedBrand !== 'All' || 
    selectedSize !== null || 
    onlyInStock || 
    searchQuery.trim().length > 0 ||
    maxPrice < 12000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/8 pb-6">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Footwear Catalog
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-stone-900 mt-1">
            {selectedCategory === 'All' ? 'All Sneakers & Shoes' : selectedCategory}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Showing <strong className="font-mono text-stone-900">{filteredProducts.length}</strong> styles available
          </p>
        </div>

        {/* Sorting Dropdown & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden px-3.5 py-2 rounded-xl skeuo-btn-soft text-xs font-semibold flex items-center gap-2"
          >
            <Filter className="w-4 h-4 text-[#FF6B35]" />
            Filters {hasActiveFilters && '•'}
          </button>

          <div className="flex items-center gap-2 skeuo-inset rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Drops</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden md:block space-y-6">
          <div className="rounded-2xl skeuo-card p-5 space-y-6 sticky top-28">
            
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <span className="font-display font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B35]" />
                Filter Footwear
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Category</label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-[#151515] text-white font-semibold'
                        : 'text-stone-600 hover:bg-stone-200/50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3 h-3 text-[#FF6B35]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Brand</label>
              <div className="space-y-1">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedBrand === b
                        ? 'bg-[#151515] text-white font-semibold'
                        : 'text-stone-600 hover:bg-stone-200/50'
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBrand === b && <Check className="w-3 h-3 text-[#FF6B35]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Shoe Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Shoe Size (EU)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {allSizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(isSelected ? null : sz)}
                      className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                        isSelected
                          ? 'bg-[#FF6B35] text-white shadow-sm'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-stone-700">Max Price</label>
                <span className="font-mono font-bold text-stone-900">
                  {settings.currencySymbol}{maxPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={12000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#FF6B35] cursor-pointer"
              />
            </div>

            {/* In Stock Only Checkbox */}
            <div className="pt-2 border-t border-black/5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded accent-[#FF6B35]"
                />
                <span>In Stock Available Only</span>
              </label>
            </div>

          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="md:col-span-3">
          
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Active Filters:</span>
              {selectedCategory !== 'All' && (
                <span className="px-2.5 py-1 rounded-md bg-stone-200 text-stone-800 font-semibold flex items-center gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')}>✕</button>
                </span>
              )}
              {selectedBrand !== 'All' && (
                <span className="px-2.5 py-1 rounded-md bg-stone-200 text-stone-800 font-semibold flex items-center gap-1">
                  {selectedBrand}
                  <button onClick={() => setSelectedBrand('All')}>✕</button>
                </span>
              )}
              {selectedSize && (
                <span className="px-2.5 py-1 rounded-md bg-stone-200 text-stone-800 font-semibold flex items-center gap-1">
                  EU {selectedSize}
                  <button onClick={() => setSelectedSize(null)}>✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-1 rounded-md bg-stone-200 text-stone-800 font-semibold flex items-center gap-1">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>✕</button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-[#FF6B35] underline font-semibold hover:text-[#e0501a]"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Empty Results State */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl skeuo-card p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl skeuo-inset mx-auto flex items-center justify-center text-stone-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-stone-900">
                No sneakers found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No items match your active filters. Try resetting size, brand, or price constraints to discover more pairs.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl skeuo-btn-primary text-xs font-bold shadow-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* MOBILE FILTER MODAL */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div 
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full sm:max-w-md bg-[#F5F5F2] rounded-t-3xl sm:rounded-3xl p-6 z-10 max-h-[85vh] overflow-y-auto space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <h3 className="font-display font-bold text-base text-stone-900">Filter Kicks</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1">
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2">Category</label>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-left ${
                      selectedCategory === c ? 'bg-[#151515] text-white' : 'bg-stone-200/70 text-stone-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Size */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2">EU Size</label>
              <div className="grid grid-cols-4 gap-2">
                {allSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold ${
                      selectedSize === sz ? 'bg-[#FF6B35] text-white' : 'bg-stone-200/70 text-stone-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 rounded-xl skeuo-btn-soft text-xs font-bold"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 rounded-xl skeuo-btn-primary text-xs font-bold"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
