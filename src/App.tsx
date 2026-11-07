/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, isAuthorizedAdminEmail } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { MessageCircle } from 'lucide-react';

import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { AdminDashboard } from './views/admin/AdminDashboard';

import { Product } from './types';
import { subscribeToProducts } from './services/storeService';
import { INITIAL_PRODUCTS } from './lib/defaultData';

function MainApp() {
  const { currentUser, isAdmin } = useAuth();
  const { setIsCartOpen } = useCart();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shopCategory, setShopCategory] = useState<string>('All');
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accountTab, setAccountTab] = useState<'orders' | 'profile'>('orders');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Products loaded in real-time from Firestore
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Subscribe to Firestore Products
  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    });
    return unsubscribe;
  }, []);

  // Floating WhatsApp Hint Notification State (shows once, then automatically hides after 5s)
  const [showWhatsAppHint, setShowWhatsAppHint] = useState<boolean>(true);
  const [isWhatsAppHovered, setIsWhatsAppHovered] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsAppHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProduct]);

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'shop') {
      if (param) setShopCategory(param);
      else setShopCategory('All');
      setCurrentView('shop');
    } else if (view === 'categories') {
      setShopCategory('All');
      setCurrentView('shop');
    } else if (view === 'admin') {
      if (isAdmin) {
        setCurrentView('admin');
      } else {
        setIsAuthModalOpen(true);
      }
    } else if (view === 'account') {
      if (!currentUser) {
        setIsAuthModalOpen(true);
      } else {
        if (param === 'orders') setAccountTab('orders');
        else setAccountTab('profile');
        setCurrentView('account');
      }
    } else if (view === 'tracking') {
      if (param) setTrackingOrderId(param);
      setCurrentView('tracking');
    } else {
      setCurrentView(view);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product_detail');
  };

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    setConfirmedOrderId(orderId);
    setCurrentView('confirmation');
  };

  const handleTrackOrderFromConfirmation = (orderId: string) => {
    setTrackingOrderId(orderId);
    setCurrentView('tracking');
  };

  // Render Admin Dashboard
  if (currentView === 'admin' && isAdmin) {
    return (
      <AdminDashboard
        products={products}
        onExitAdmin={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F2] text-[#151515]">
      
      {/* Universal 3-Zone Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'shop' && (
          <ShopView
            products={products}
            initialCategory={shopCategory}
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentView === 'product_detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            allProducts={products}
            onBack={() => setCurrentView('shop')}
            onSelectProduct={handleSelectProduct}
            onNavigateToCheckout={() => setCurrentView('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onBackToCart={() => setIsCartOpen(true)}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentView === 'confirmation' && (
          <OrderConfirmationView
            orderId={confirmedOrderId}
            onTrackOrder={handleTrackOrderFromConfirmation}
            onContinueShopping={() => setCurrentView('shop')}
            onViewAccountOrders={() => handleNavigate('account', 'orders')}
          />
        )}

        {currentView === 'account' && (
          <CustomerAccountView
            initialTab={accountTab}
            onTrackOrder={(id) => handleNavigate('tracking', id)}
            onExplore={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'tracking' && (
          <OrderTrackingView
            initialOrderId={trackingOrderId}
            onExplore={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'about' && (
          <AboutView onExplore={() => setCurrentView('shop')} />
        )}

        {currentView === 'contact' && (
          <ContactView />
        )}
      </main>

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer
        onCheckout={() => setCurrentView('checkout')}
        onExplore={() => setCurrentView('shop')}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(signedInEmail) => {
          if (
            isAuthorizedAdminEmail(signedInEmail) ||
            isAuthorizedAdminEmail(currentUser?.email) ||
            isAdmin
          ) {
            setCurrentView('admin');
          }
        }}
      />

      {/* Universal Footer */}
      <Footer
        onNavigate={handleNavigate}
      />

      {/* Floating WhatsApp Quick Contact Button */}
      <aside 
        aria-label="WhatsApp Support" 
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group"
        onMouseEnter={() => setIsWhatsAppHovered(true)}
        onMouseLeave={() => setIsWhatsAppHovered(false)}
      >
        <div 
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#151515] text-white text-xs font-semibold shadow-2xl border border-white/10 transition-all duration-500 ease-in-out ${
            showWhatsAppHint || isWhatsAppHovered
              ? 'opacity-100 translate-x-0 scale-100 max-w-sm pointer-events-auto'
              : 'opacity-0 translate-x-4 scale-95 max-w-0 pointer-events-none overflow-hidden py-0 px-0 border-0'
          }`}
        >
          <span className="whitespace-nowrap">
            Product details জানতে WhatsApp-এ নক দিন: <strong className="text-[#25D366] font-mono ml-1">01706695247</strong>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowWhatsAppHint(false);
              setIsWhatsAppHovered(false);
            }}
            className="text-stone-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors ml-1 text-sm font-bold"
            aria-label="Dismiss notice"
          >
            ×
          </button>
        </div>
        <a
          href="https://wa.me/8801706695247?text=Hello%20KICKS,%20I%20want%20to%20know%20product%20details."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp 01706695247"
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/40 shrink-0"
        >
          <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
        </a>
      </aside>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
