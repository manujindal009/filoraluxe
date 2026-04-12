export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  ownerName: string;
  expiryDate: string;
  maxUsage: number;
  usedCount: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string; // Slug (for backward compatibility)
  subcategory?: string; // Subcategory slug
  categoryId?: string;
  subcategoryId?: string;
  images: string[];
  featured?: boolean;
  inStock: boolean;
  stockCount?: number;
  tags?: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price_at_time: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  discountAmount?: number;
  finalAmount?: number;
  deliveryCharge?: number;
  gstAmount?: number;
  paymentMethod?: 'credit_card' | 'cod' | 'upi';
  upiScreenshotUrl?: string;
  utrNumber?: string;
  isGift?: boolean;
  giftMessage?: string;
  recipientName?: string;
  isForSomeoneElse?: boolean;
  recipientPhone?: string;
  gift_wrap_charge?: number;
  couponCode?: string;
  couponOwner?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  shippingAddress: {
    name: string;
    email?: string;
    phone?: string;
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  displayOrder?: number;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
}
