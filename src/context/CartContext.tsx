import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, StoreSettings } from '../types';
import { INITIAL_SETTINGS } from '../lib/defaultData';
import { subscribeToStoreSettings } from '../services/storeService';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: number, quantity?: number) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  updateSize: (cartItemId: string, newSize: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  totalItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  settings: StoreSettings;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kicks_cart_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Sync settings
  useEffect(() => {
    const unsub = subscribeToStoreSettings((newSettings) => {
      setSettings(newSettings);
    });
    return unsub;
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [items]);

  const addToCart = (product: Product, size: number, quantity: number = 1): boolean => {
    if (product.stock <= 0) {
      return false;
    }

    const cartItemId = `${product.id}_sz${size}`;
    let success = true;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stock) {
          success = false;
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          product // Refresh product data
        };
        return updated;
      } else {
        if (quantity > product.stock) {
          success = false;
          return prev;
        }
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            product,
            selectedSize: size,
            quantity: Math.min(quantity, product.stock)
          }
        ];
      }
    });

    if (success) {
      setIsCartOpen(true);
    }
    return success;
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const targetQty = item.quantity + delta;
            if (targetQty <= 0) return null;
            if (targetQty > item.product.stock) return item; // capped at available stock
            return { ...item, quantity: targetQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const updateSize = (cartItemId: string, newSize: number) => {
    setItems((prev) => {
      const current = prev.find((i) => i.id === cartItemId);
      if (!current) return prev;

      const newId = `${current.productId}_sz${newSize}`;
      const filtered = prev.filter((i) => i.id !== cartItemId);
      const existingWithNewSize = filtered.find((i) => i.id === newId);

      if (existingWithNewSize) {
        const combinedQty = Math.min(current.product.stock, existingWithNewSize.quantity + current.quantity);
        return filtered.map((i) => (i.id === newId ? { ...i, quantity: combinedQty } : i));
      } else {
        return [...filtered, { ...current, id: newId, selectedSize: newSize }];
      }
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryCharge = items.length === 0 ? 0 : (subtotal >= settings.freeDeliveryThreshold ? 0 : settings.standardDeliveryCharge);
  const total = subtotal + deliveryCharge;
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSize,
        clearCart,
        subtotal,
        deliveryCharge,
        total,
        totalItemCount,
        isCartOpen,
        setIsCartOpen,
        settings
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
