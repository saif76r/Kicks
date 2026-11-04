import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  ShieldCheck, 
  LogOut, 
  Package, 
  LayoutDashboard,
  Menu,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  searchQuery,
  setSearchQuery
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F5F5F2]/95 backdrop-blur-md border-b border-black/8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22 gap-4 lg:gap-8">
          
          {/* ZONE 1: BRAND LOGO */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="group flex items-center text-left focus:outline-none py-1"
              aria-label="KICKS Home"
            >
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-04_at_11.08.18_PM_0f182253.jpeg"
                alt="KICKS Logo"
                className="h-14 sm:h-16 md:h-18 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
              />
            </button>
          </div>

          {/* ZONE 2: 4-5 CONCISE NAV LINKS (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                    isActive 
                      ? 'text-[#151515] font-semibold' 
                      : 'text-stone-600 hover:text-[#151515]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF6B35] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ZONE 3: ACTIONS (Search, Auth, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Search Bar / Toggle */}
            <div className="relative">
              <div className={`hidden sm:flex items-center skeuo-inset rounded-full px-3.5 py-1.5 w-44 lg:w-60 transition-all focus-within:w-64 focus-within:border-stone-400`}>
                <Search className="w-4 h-4 text-stone-500 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search sneakers..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView !== 'shop') onNavigate('shop');
                  }}
                  className="bg-transparent border-none text-xs text-stone-900 placeholder-stone-500 focus:outline-none w-full"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-stone-400 hover:text-stone-700 text-xs shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="sm:hidden p-2 text-stone-700 hover:text-[#FF6B35]"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Shopping Bag Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl skeuo-btn-soft flex items-center justify-center text-stone-800 hover:text-[#FF6B35] transition-all"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B35] text-white text-[11px] font-bold font-mono h-5 min-w-5 px-1 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl skeuo-btn-soft text-stone-800 text-xs font-semibold"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#151515] text-white flex items-center justify-center font-bold text-[11px]">
                    {userProfile?.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:inline-block max-w-[100px] truncate">
                    {userProfile?.fullName?.split(' ')[0] || 'My Account'}
                  </span>
                  {isAdmin && (
                    <span className="hidden lg:inline text-[10px] bg-amber-500/15 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                      ADMIN
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-2xl skeuo-card p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-black/5 mb-1">
                      <p className="text-xs font-semibold text-stone-900 truncate">{userProfile?.fullName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                      {isAdmin && (
                        <p className="text-[10px] text-[#FF6B35] font-semibold mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Authorized Admin
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('account');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100/70 rounded-lg text-left"
                    >
                      <UserIcon className="w-4 h-4 text-stone-500" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('account', 'orders');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100/70 rounded-lg text-left"
                    >
                      <Package className="w-4 h-4 text-stone-500" />
                      My Orders & Tracking
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#FF6B35] hover:bg-orange-50 rounded-lg text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#FF6B35]" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-black/5 mt-1 pt-1">
                      <button
                        onClick={async () => {
                          await logout();
                          setUserMenuOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth()}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl skeuo-btn-primary whitespace-nowrap shrink-0"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-800 hover:text-stone-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row if open */}
        {showSearchInput && (
          <div className="sm:hidden pb-3 pt-1">
            <div className="flex items-center skeuo-inset rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-stone-500 mr-2" />
              <input
                type="text"
                placeholder="Search kicks, brands, models..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'shop') onNavigate('shop');
                }}
                className="bg-transparent border-none text-xs text-stone-900 placeholder-stone-500 focus:outline-none w-full"
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-black/8 space-y-2 animate-in slide-in-from-top-4 duration-200">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  currentView === link.id
                    ? 'bg-stone-200 text-[#151515]'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-2 border-t border-black/5 space-y-2">
              <button
                onClick={() => {
                  onNavigate('tracking');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Track Any Order
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#FF6B35]"
                >
                  Open Admin Dashboard
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
