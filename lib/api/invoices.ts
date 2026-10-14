import { supabase } from "@/lib/supabaseClient";
import { Invoice, InvoiceSettings, InvoiceStatus } from "@/types/invoice";

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  id: "default",
  business: {
    name: "Filora Luxe",
    tagline: "HANDMADE LUXURY CROCHET",
    address: "Handcrafted with ♥ in India",
    cityStatePin: "India",
    email: "filoraluxe@yahoo.com",
    phone: "+91 98765 43210",
    website: "filoraluxe.in",
    instagram: "@filora.luxe",
    gstin: "",
    logoUrl: "/logo.png"
  },
  defaults: {
    invoicePrefix: "INV-",
    orderPrefix: "FL-",
    startingNumber: 1,
    defaultPaymentMethod: "upi",
    defaultPaymentStatus: "pending",
    defaultNotes: "Thank you for supporting small handmade luxury business!",
    defaultTaxEnabled: false,
    defaultTaxRate: 0
  },
  appearance: {
    primaryColor: "#c06c74",
    secondaryColor: "#faf9f7",
    fontFamily: "Playfair Display, serif",
    logoUrl: "/logo.png",
    footerText: "Thank you for choosing handmade. ♡\nEvery Filora Luxe piece is handcrafted, so small variations are part of what makes your piece unique.",
    careInstructions: "Hand wash gently • Dry flat • Reshape while damp • Do not wring"
  },
  visibility: {
    showLogo: true,
    showGst: false,
    showDiscount: true,
    showShipping: true,
    showCustomerPhone: true,
    showCustomerEmail: true,
    showCustomerGstin: false,
    showNotes: true,
    showPaymentRef: true,
    showDueDate: true,
    showCareInstructions: true,
    showSignature: true,
    signatureTitle: "Authorized Signatory",
    signatureName: "Anshuma • Founder & Creator"
  },
  updatedAt: new Date().toISOString()
};

const LOCAL_STORAGE_KEY_INVOICES = "filora_luxe_invoices_v1";
const LOCAL_STORAGE_KEY_SETTINGS = "filora_luxe_invoice_settings_v1";

// Helper for local storage access
function getLocalInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_INVOICES);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse local invoices:", err);
    return [];
  }
}

function setLocalInvoices(invoices: Invoice[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_INVOICES, JSON.stringify(invoices));
  } catch (err) {
    console.error("Failed to save local invoices:", err);
  }
}

// ----------------------------------------------------
// INVOICE SETTINGS API
// ----------------------------------------------------
export async function fetchInvoiceSettings(): Promise<InvoiceSettings> {
  try {
    const { data, error } = await supabase
      .from("invoice_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (!error && data) {
      return {
        id: data.id,
        business: data.business || DEFAULT_INVOICE_SETTINGS.business,
        defaults: data.defaults || DEFAULT_INVOICE_SETTINGS.defaults,
        appearance: data.appearance || DEFAULT_INVOICE_SETTINGS.appearance,
        visibility: data.visibility || DEFAULT_INVOICE_SETTINGS.visibility,
        updatedAt: data.updated_at || new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn("[fetchInvoiceSettings] DB query failed, checking localStorage fallback:", err);
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Local settings error:", e);
    }
  }

  return DEFAULT_INVOICE_SETTINGS;
}

export async function saveInvoiceSettings(settings: InvoiceSettings): Promise<InvoiceSettings> {
  const updatedSettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(updatedSettings));
  }

  try {
    const { error } = await supabase
      .from("invoice_settings")
      .upsert({
        id: "default",
        business: updatedSettings.business,
        defaults: updatedSettings.defaults,
        appearance: updatedSettings.appearance,
        visibility: updatedSettings.visibility,
        updated_at: updatedSettings.updatedAt
      });

    if (error) {
      console.warn("[saveInvoiceSettings] DB save warning:", error.message);
    }
  } catch (err) {
    console.warn("[saveInvoiceSettings] DB call exception:", err);
  }

  return updatedSettings;
}

// ----------------------------------------------------
// SEQUENTIAL NUMBER GENERATOR
// ----------------------------------------------------
export async function getNextInvoiceNumber(prefix: string = "INV-"): Promise<string> {
  try {
    const { data, error } = await supabase.rpc("get_next_invoice_number", { p_prefix: prefix });
    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn("[getNextInvoiceNumber] RPC failed, falling back to count strategy:", err);
  }

  // Fallback sequential logic using maximum invoice count + 1
  const invoices = await fetchInvoices();
  let maxSeq = 0;
  
  invoices.forEach(inv => {
    const numPart = inv.invoiceNumber.replace(/[^0-9]/g, "");
    if (numPart) {
      const val = parseInt(numPart, 10);
      if (val > maxSeq) maxSeq = val;
    }
  });

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

// ----------------------------------------------------
// INVOICE CRUD OPERATIONS
// ----------------------------------------------------
export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mappedDBInvoices: Invoice[] = data.map((row: any) => mapRowToInvoice(row));
      
      // Merge with local invoices if any exist only locally
      const localInvoices = getLocalInvoices();
      const mergedMap = new Map<string, Invoice>();
      
      mappedDBInvoices.forEach(inv => mergedMap.set(inv.id, inv));
      localInvoices.forEach(inv => {
        if (!mergedMap.has(inv.id)) {
          mergedMap.set(inv.id, inv);
        }
      });
      
      return Array.from(mergedMap.values()).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn("[fetchInvoices] DB query failed, returning local storage:", err);
  }

  return getLocalInvoices();
}

export async function fetchInvoiceById(idOrNumber: string): Promise<Invoice | null> {
  if (!idOrNumber) return null;

  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .or(`id.eq.${idOrNumber},invoice_number.eq.${idOrNumber},share_token.eq.${idOrNumber}`)
      .single();

    if (!error && data) {
      return mapRowToInvoice(data);
    }
  } catch (err) {
    console.warn(`[fetchInvoiceById] DB query failed for ${idOrNumber}:`, err);
  }

  // Fallback to local storage search
  const local = getLocalInvoices();
  return local.find(i => i.id === idOrNumber || i.invoiceNumber === idOrNumber || i.shareToken === idOrNumber) || null;
}

export async function saveInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
  const settings = await fetchInvoiceSettings();
  const now = new Date().toISOString();
  
  const id = invoiceData.id || `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const invoiceNumber = invoiceData.invoiceNumber || await getNextInvoiceNumber(settings.defaults.invoicePrefix);
  const shareToken = invoiceData.shareToken || `st-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

  const finalInvoice: Invoice = {
    id,
    invoiceNumber,
    orderId: invoiceData.orderId || "",
    orderNumber: invoiceData.orderNumber || "",
    status: invoiceData.status || "draft",
    invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split("T")[0],
    dueDate: invoiceData.dueDate || "",
    
    customer: invoiceData.customer || {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pin: "",
      gstin: ""
    },
    business: invoiceData.business || settings.business,
    items: invoiceData.items || [],
    
    subtotal: invoiceData.subtotal ?? 0,
    discount: invoiceData.discount ?? 0,
    shipping: invoiceData.shipping ?? 0,
    taxEnabled: invoiceData.taxEnabled ?? settings.defaults.defaultTaxEnabled,
    taxRate: invoiceData.taxRate ?? settings.defaults.defaultTaxRate,
    tax: invoiceData.tax ?? 0,
    total: invoiceData.total ?? 0,
    
    payment: invoiceData.payment || {
      method: settings.defaults.defaultPaymentMethod,
      status: invoiceData.status || settings.defaults.defaultPaymentStatus,
      amountPaid: invoiceData.status === "paid" ? (invoiceData.total ?? 0) : 0,
      balanceDue: invoiceData.status === "paid" ? 0 : (invoiceData.total ?? 0),
      transactionId: ""
    },
    notes: invoiceData.notes !== undefined ? invoiceData.notes : settings.defaults.defaultNotes,
    visibilitySettings: invoiceData.visibilitySettings || settings.visibility,
    shareToken,
    
    createdAt: invoiceData.createdAt || now,
    updatedAt: now,
    finalizedAt: invoiceData.status !== "draft" ? (invoiceData.finalizedAt || now) : undefined
  };

  // Always update local storage first as reliable backup
  const localList = getLocalInvoices();
  const existingIdx = localList.findIndex(i => i.id === id);
  if (existingIdx >= 0) {
    localList[existingIdx] = finalInvoice;
  } else {
    localList.unshift(finalInvoice);
  }
  setLocalInvoices(localList);

  // Sync to Supabase
  try {
    const payload = mapInvoiceToRow(finalInvoice);
    const { error } = await supabase.from("invoices").upsert(payload);
    if (error) {
      console.error("[saveInvoice] DB upsert failed:", error.message);
      throw new Error(error.message);
    }
  } catch (err) {
    console.warn("[saveInvoice] DB call failed, preserved in local storage:", err);
  }

  return finalInvoice;
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice | null> {
  const existing = await fetchInvoiceById(id);
  if (!existing) return null;

  let amountPaid = existing.payment.amountPaid;
  let balanceDue = existing.payment.balanceDue;

  if (status === "paid") {
    amountPaid = existing.total;
    balanceDue = 0;
  } else if (status === "pending" || status === "draft") {
    amountPaid = 0;
    balanceDue = existing.total;
  }

  const updated: Invoice = {
    ...existing,
    status,
    payment: {
      ...existing.payment,
      status,
      amountPaid,
      balanceDue
    },
    updatedAt: new Date().toISOString(),
    finalizedAt: status !== "draft" ? (existing.finalizedAt || new Date().toISOString()) : undefined
  };

  return await saveInvoice(updated);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  // Delete locally
  const localList = getLocalInvoices().filter(i => i.id !== id);
  setLocalInvoices(localList);

  // Delete from Supabase
  try {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) {
      console.warn("[deleteInvoice] DB delete warning:", error.message);
    }
  } catch (err) {
    console.warn("[deleteInvoice] DB exception:", err);
  }

  return true;
}

export async function duplicateInvoice(id: string): Promise<Invoice | null> {
  const source = await fetchInvoiceById(id);
  if (!source) return null;

  const settings = await fetchInvoiceSettings();
  const newInvoiceNumber = await getNextInvoiceNumber(settings.defaults.invoicePrefix);

  const duplicatedData: Partial<Invoice> = {
    invoiceNumber: newInvoiceNumber,
    orderId: source.orderId ? `${source.orderId}-COPY` : "",
    orderNumber: source.orderNumber ? `${source.orderNumber}-COPY` : "",
    status: "draft",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: source.dueDate,
    customer: { ...source.customer },
    business: { ...source.business },
    items: source.items.map(item => ({ ...item, id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` })),
    subtotal: source.subtotal,
    discount: source.discount,
    shipping: source.shipping,
    taxEnabled: source.taxEnabled,
    taxRate: source.taxRate,
    tax: source.tax,
    total: source.total,
    payment: {
      method: source.payment.method,
      status: "draft",
      amountPaid: 0,
      balanceDue: source.total,
      transactionId: ""
    },
    notes: source.notes,
    visibilitySettings: { ...source.visibilitySettings }
  };

  return await saveInvoice(duplicatedData);
}

// ----------------------------------------------------
// DB MAPPERS
// ----------------------------------------------------
function mapRowToInvoice(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    orderId: row.order_id || "",
    orderNumber: row.order_number || "",
    status: row.status as InvoiceStatus,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date || "",
    customer: row.customer || {},
    business: row.business || {},
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    shipping: Number(row.shipping || 0),
    taxEnabled: Boolean(row.tax_enabled),
    taxRate: Number(row.tax_rate || 0),
    tax: Number(row.tax || 0),
    total: Number(row.total || 0),
    payment: row.payment || {},
    notes: row.notes || "",
    visibilitySettings: row.visibility_settings || {},
    shareToken: row.share_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    finalizedAt: row.finalized_at
  };
}

function mapInvoiceToRow(invoice: Invoice): any {
  return {
    id: invoice.id,
    invoice_number: invoice.invoiceNumber,
    order_id: invoice.orderId || null,
    order_number: invoice.orderNumber || null,
    status: invoice.status,
    invoice_date: invoice.invoiceDate,
    due_date: invoice.dueDate || null,
    customer: invoice.customer,
    business: invoice.business,
    items: invoice.items,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    shipping: invoice.shipping,
    tax_enabled: invoice.taxEnabled,
    tax_rate: invoice.taxRate,
    tax: invoice.tax,
    total: invoice.total,
    payment: invoice.payment,
    notes: invoice.notes,
    visibility_settings: invoice.visibilitySettings,
    share_token: invoice.shareToken,
    created_at: invoice.createdAt,
    updated_at: invoice.updatedAt,
    finalized_at: invoice.finalizedAt || null
  };
}
