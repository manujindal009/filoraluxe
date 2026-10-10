export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'cancelled';
export type PaymentMethod = 'upi' | 'card' | 'cod' | 'bank_transfer' | 'other';

export interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

export interface InvoiceCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  gstin?: string;
}

export interface InvoiceBusiness {
  name: string;
  tagline?: string;
  address: string;
  cityStatePin?: string;
  email: string;
  phone: string;
  website?: string;
  instagram?: string;
  gstin?: string;
  logoUrl?: string;
}

export interface InvoicePayment {
  method: PaymentMethod;
  status: InvoiceStatus;
  amountPaid: number;
  balanceDue: number;
  transactionId?: string;
}

export interface InvoiceVisibility {
  showLogo?: boolean;
  showGst: boolean;
  showDiscount: boolean;
  showShipping: boolean;
  showCustomerPhone: boolean;
  showCustomerEmail: boolean;
  showCustomerGstin: boolean;
  showNotes: boolean;
  showPaymentRef: boolean;
  showDueDate: boolean;
  showCareInstructions: boolean;
  showSignature?: boolean;
  signatureTitle?: string;
  signatureName?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-0001
  orderId?: string; // e.g. ORD-123456
  orderNumber?: string; // e.g. FL-00001
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate?: string;
  
  customer: InvoiceCustomer;
  business: InvoiceBusiness;
  items: InvoiceItem[];
  
  subtotal: number;
  discount: number;
  shipping: number;
  taxEnabled: boolean;
  taxRate: number; // Percentage, e.g. 5, 12, 18
  tax: number; // Tax amount
  total: number;
  
  payment: InvoicePayment;
  notes?: string;
  
  visibilitySettings: InvoiceVisibility;
  shareToken?: string;
  
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

export interface InvoiceSettings {
  id: string;
  business: InvoiceBusiness;
  defaults: {
    invoicePrefix: string;
    orderPrefix: string;
    startingNumber: number;
    defaultPaymentMethod: PaymentMethod;
    defaultPaymentStatus: InvoiceStatus;
    defaultNotes: string;
    defaultTaxEnabled: boolean;
    defaultTaxRate: number;
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl: string;
    footerText: string;
    careInstructions: string;
  };
  visibility: InvoiceVisibility;
  updatedAt: string;
}
