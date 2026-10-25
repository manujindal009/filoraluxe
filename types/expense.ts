export type ExpenseCategory =
  | 'raw_materials'
  | 'packaging'
  | 'shipping_logistics'
  | 'marketing_ads'
  | 'tools_equipment'
  | 'salaries_wages'
  | 'rent_utilities'
  | 'software_subscriptions'
  | 'taxes_legal'
  | 'other';

export type ExpenseStatus = 'paid' | 'pending' | 'partially_paid';

export type ExpensePaymentMethod = 'upi' | 'card' | 'bank_transfer' | 'cash' | 'other';

export interface ExpenseCategoryMeta {
  key: ExpenseCategory;
  label: string;
  badgeBg: string;
  badgeText: string;
  iconName?: string;
  description: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
  {
    key: 'raw_materials',
    label: 'Raw Materials & Yarn',
    badgeBg: 'bg-rose/10',
    badgeText: 'text-rose',
    description: 'Cotton yarn, wool, threads, beads, clasps'
  },
  {
    key: 'packaging',
    label: 'Packaging & Branding',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    description: 'Boxes, butter paper, ribbons, thank you cards, tape'
  },
  {
    key: 'shipping_logistics',
    label: 'Shipping & Couriers',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    description: 'Shiprocket, Delhivery, speed post, local pickup'
  },
  {
    key: 'marketing_ads',
    label: 'Marketing & Ads',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    description: 'Meta ads, Instagram boosts, influencer gifting'
  },
  {
    key: 'tools_equipment',
    label: 'Tools & Equipment',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    description: 'Crochet hooks, blocking boards, cutters, lighting'
  },
  {
    key: 'salaries_wages',
    label: 'Artisan Wages & Salaries',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    description: 'Payments to artisans, helpers, assistants'
  },
  {
    key: 'rent_utilities',
    label: 'Studio Rent & Utilities',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    description: 'Studio rent, electricity, studio maintenance'
  },
  {
    key: 'software_subscriptions',
    label: 'Software & Tools',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    description: 'Shopify, Canva, Google Workspace, domain hosting'
  },
  {
    key: 'taxes_legal',
    label: 'Taxes & Compliance',
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-800',
    description: 'GST payments, CA fees, legal filing'
  },
  {
    key: 'other',
    label: 'Other & Miscellaneous',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-800',
    description: 'Any other business-related operational cost'
  }
];

export interface ExpenseItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface ExpenseVendor {
  name: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string; // e.g. EXP-0001
  title: string;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  
  // Amounts
  subtotal: number;
  taxEnabled: boolean;
  taxRate: number; // e.g. 5, 12, 18%
  taxAmount: number;
  total: number;
  
  // Payment info
  status: ExpenseStatus;
  paymentMethod: ExpensePaymentMethod;
  amountPaid: number;
  balanceDue: number;
  referenceNumber?: string; // UTR, transaction ID, or vendor bill number
  
  // Vendor
  vendor: ExpenseVendor;
  
  // Optional breakdown
  items?: ExpenseItem[];
  
  notes?: string;
  receiptUrl?: string; // uploaded image or URL
  
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSettings {
  id: string;
  prefix: string; // e.g. EXP-
  startingNumber: number;
  monthlyBudget: number; // e.g. 50000
  defaultPaymentMethod: ExpensePaymentMethod;
  defaultPaymentStatus: ExpenseStatus;
  defaultCategory: ExpenseCategory;
  updatedAt: string;
}
