// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  user: User | null;
  token: string | null;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Payment types
export enum PaymentMethod {
  COD = 'COD',
  BANK_MANDIRI = 'BANK_MANDIRI',
  QRIS_MANDIRI = 'QRIS_MANDIRI'
}

export interface PaymentInfo {
  method: PaymentMethod;
  bankAccount?: string;
  accountName?: string;
  qrisCode?: string;
  instructions?: string;
}

// Order types
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export interface PaymentDetails {
  transactionId?: string;
  orderId?: string;
  grossAmount?: number;
  paymentType?: string;
  transactionTime?: string;
  transactionStatus?: string;
  fraudStatus?: string;
}

export interface Order {
  _id: string;
  user: string | User;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentInfo?: PaymentInfo;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  paymentStatus?: PaymentStatus;
  midtransTransactionId?: string;
  paymentDetails?: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Review types
export interface Review {
  _id: string;
  product: string;
  user: string | User;
  order: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface EligibleOrder {
  _id: string;
  createdAt: string;
}

export interface ReviewEligibility {
  canReview: boolean;
  eligibleOrders: EligibleOrder[];
}
