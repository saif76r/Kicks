import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Product, Order, StoreSettings, UserProfile, OrderStatus, PaymentStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../lib/defaultData';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const SETTINGS_DOC = 'settings/store';

// Product subscription with automated seed fallback
export function subscribeToProducts(onData: (products: Product[]) => void): () => void {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const unsubscribe = onSnapshot(productsRef, async (snapshot) => {
      if (snapshot.empty) {
        // Automatically seed INITIAL_PRODUCTS so the storefront is immediately alive
        try {
          for (const prod of INITIAL_PRODUCTS) {
            await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
          }
          onData(INITIAL_PRODUCTS);
        } catch (err) {
          console.warn('Seeding products to Firestore restricted or offline, using memory seed:', err);
          onData(INITIAL_PRODUCTS);
        }
      } else {
        const prods = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        onData(prods);
      }
    }, (error) => {
      console.warn('Firestore products snapshot listener warning:', error);
      onData(INITIAL_PRODUCTS);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize products listener:', err);
    onData(INITIAL_PRODUCTS);
    return () => {};
  }
}

// Manually trigger full database seed to Cloud Firestore
export async function seedFirestoreDatabase(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let count = 0;
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
      count++;
    }
    await setDoc(doc(db, 'settings', 'store'), INITIAL_SETTINGS);
    return { success: true, count };
  } catch (err: any) {
    console.error('Manual seed Firestore error:', err);
    return { 
      success: false, 
      count: 0, 
      error: err.code === 'permission-denied' 
        ? 'Firebase Firestore Rules blocked write access (permission-denied). Please update your Rules in Firebase Console.' 
        : err.message || 'Error writing to Firestore' 
    };
  }
}

// Add New Product
export async function createProduct(productData: Omit<Product, 'id'>): Promise<string> {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const now = new Date().toISOString();
  const docRef = await addDoc(productsRef, {
    ...productData,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
}

// Update Existing Product
export async function updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

// Delete Product
export async function removeProduct(productId: string): Promise<void> {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(productRef);
}

// Upload Product Image to Firebase Storage (with base64 fallback)
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const storagePath = `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.warn('Firebase Storage upload blocked or unconfigured, converting to high-res data URL fallback:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

// Orders Subscription
export function subscribeToOrders(
  userId: string | null,
  isAdmin: boolean,
  onData: (orders: Order[]) => void
): () => void {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    let q;

    if (isAdmin) {
      // Admin sees all orders
      q = query(ordersRef, orderBy('createdAt', 'desc'));
    } else if (userId) {
      // Customer sees only their own orders
      q = query(ordersRef, where('userId', '==', userId));
    } else {
      onData([]);
      return () => {};
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      // Sort in memory if composite index is pending
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(orders);
    }, (err) => {
      console.warn('Orders listener error (using fallback local store):', err);
      // Read from local storage fallback
      const savedOrders: Order[] = JSON.parse(localStorage.getItem('kicks_local_orders') || '[]');
      if (isAdmin) {
        onData(savedOrders);
      } else if (userId) {
        onData(savedOrders.filter(o => o.userId === userId));
      }
    });

    return unsubscribe;
  } catch (err) {
    console.warn('subscribeToOrders error:', err);
    return () => {};
  }
}

// Create Customer Order & Update Stock
export async function placeOrder(orderData: Omit<Order, 'id'>): Promise<string> {
  const orderId = `KICKS-${Math.floor(100000 + Math.random() * 900000)}`;
  const fullOrder: Order = {
    ...orderData,
    id: orderId
  };

  try {
    const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(orderDocRef, fullOrder);

    // Atomically decrement stock in Firestore if possible
    for (const item of orderData.items) {
      try {
        const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const currentStock = prodSnap.data().stock || 0;
          await updateDoc(prodRef, {
            stock: Math.max(0, currentStock - item.quantity),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (stockErr) {
        console.warn('Could not update individual item stock:', stockErr);
      }
    }
  } catch (err) {
    console.warn('Firestore order placement encountered an error, saving to local persistent backup:', err);
  }

  // Backup to localStorage so PC/phone can track even if offline
  const localOrders: Order[] = JSON.parse(localStorage.getItem('kicks_local_orders') || '[]');
  localOrders.unshift(fullOrder);
  localStorage.setItem('kicks_local_orders', JSON.stringify(localOrders));

  return orderId;
}

// Update Order Status (Admin Only)
export async function updateOrderStatus(
  orderId: string, 
  orderStatus: OrderStatus, 
  paymentStatus?: PaymentStatus,
  verifiedBy?: string
): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updates: Record<string, any> = {
      orderStatus,
      updatedAt: new Date().toISOString()
    };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    if (verifiedBy) {
      updates['paymentDetails.verifiedBy'] = verifiedBy;
      updates['paymentDetails.verifiedAt'] = new Date().toISOString();
    }
    await updateDoc(orderRef, updates);
  } catch (err) {
    console.warn('Firestore updateOrderStatus error, updating local state:', err);
  }

  // Also update local storage cache
  const localOrders: Order[] = JSON.parse(localStorage.getItem('kicks_local_orders') || '[]');
  const idx = localOrders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    localOrders[idx].orderStatus = orderStatus;
    if (paymentStatus) localOrders[idx].paymentStatus = paymentStatus;
    localOrders[idx].updatedAt = new Date().toISOString();
    localStorage.setItem('kicks_local_orders', JSON.stringify(localOrders));
  }
}

// Store Settings Subscription
export function subscribeToStoreSettings(onData: (settings: StoreSettings) => void): () => void {
  try {
    const settingsDocRef = doc(db, 'settings', 'store');
    const unsubscribe = onSnapshot(settingsDocRef, async (snap) => {
      if (snap.exists()) {
        const remoteData = snap.data() as Partial<StoreSettings>;
        // If remote has old mock numbers, prefer updated INITIAL_SETTINGS
        const merged: StoreSettings = {
          ...INITIAL_SETTINGS,
          ...remoteData,
          bkashNumber: (!remoteData.bkashNumber || remoteData.bkashNumber === '01888-294012') ? INITIAL_SETTINGS.bkashNumber : remoteData.bkashNumber,
          nagadNumber: (!remoteData.nagadNumber || remoteData.nagadNumber === '01777-654321') ? INITIAL_SETTINGS.nagadNumber : remoteData.nagadNumber,
          whatsappNumber: remoteData.whatsappNumber || INITIAL_SETTINGS.whatsappNumber,
        };
        onData(merged);
      } else {
        try {
          await setDoc(settingsDocRef, INITIAL_SETTINGS);
        } catch {
          // ignore if read-only
        }
        onData(INITIAL_SETTINGS);
      }
    }, (err) => {
      console.warn('Settings listener using initial settings:', err);
      const saved = localStorage.getItem('kicks_store_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          onData({
            ...INITIAL_SETTINGS,
            ...parsed,
            bkashNumber: (!parsed.bkashNumber || parsed.bkashNumber === '01888-294012') ? INITIAL_SETTINGS.bkashNumber : parsed.bkashNumber,
            nagadNumber: (!parsed.nagadNumber || parsed.nagadNumber === '01777-654321') ? INITIAL_SETTINGS.nagadNumber : parsed.nagadNumber,
            whatsappNumber: parsed.whatsappNumber || INITIAL_SETTINGS.whatsappNumber,
          });
        } catch {
          onData(INITIAL_SETTINGS);
        }
      } else {
        onData(INITIAL_SETTINGS);
      }
    });

    return unsubscribe;
  } catch {
    onData(INITIAL_SETTINGS);
    return () => {};
  }
}

// Update Store Settings (Admin Only)
export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    const settingsDocRef = doc(db, 'settings', 'store');
    await setDoc(settingsDocRef, settings, { merge: true });
  } catch (err) {
    console.warn('saveStoreSettings firestore error:', err);
  }
  localStorage.setItem('kicks_store_settings', JSON.stringify(settings));
}

// Customers Subscription (Admin)
export function subscribeToCustomers(onData: (customers: UserProfile[]) => void): () => void {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    return onSnapshot(usersRef, (snapshot) => {
      const customers = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      onData(customers);
    }, (err) => {
      console.warn('Customers listener warning:', err);
      // Retrieve fallback list
      const fallbackList: UserProfile[] = JSON.parse(localStorage.getItem('kicks_all_users') || '[]');
      onData(fallbackList);
    });
  } catch {
    onData([]);
    return () => {};
  }
}
