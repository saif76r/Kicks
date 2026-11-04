export type ShoeCategory = 
  | 'Sneakers'
  | 'Running Shoes'
  | 'Sports Shoes'
  | 'Casual Shoes'
  | 'Formal Shoes';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ShoeCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  availableSizes: number[]; // e.g. [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12] or [40, 41, 42, 43, 44, 45]
  images: string[];
  description: string;
  featured?: boolean;
  newArrival?: boolean;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  materials?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. productId_size)
  productId: string;
  product: Product;
  selectedSize: number;
  quantity: number;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'cod';

export type PaymentStatus = 'pending_verification' | 'verified' | 'paid_on_delivery' | 'failed';

export type OrderStatus = 
  | 'Pending'
  | 'Payment Verification'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  senderNumber?: string;
  transactionId?: string;
  amount: number;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  size: number;
  quantity: number;
}

export interface Order {
  id: string; // e.g. KICKS-88219
  userId: string;
  customerDetails: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  createdAt?: string;
}

export interface StoreSettings {
  bkashNumber: string;
  bkashAccountType: 'Merchant' | 'Personal';
  nagadNumber: string;
  nagadAccountType: 'Merchant' | 'Personal';
  whatsappNumber: string;
  standardDeliveryCharge: number;
  freeDeliveryThreshold: number;
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  currencySymbol: string;
}
