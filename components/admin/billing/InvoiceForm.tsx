"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, User, Package, ChevronDown, ChevronUp, 
  Settings, Eye, RefreshCw, Save, CheckCircle, FileText, Download, Printer, Share2 
} from "lucide-react";
import { Invoice, InvoiceItem, InvoiceStatus, PaymentMethod } from "@/types/invoice";
import { Product, Order } from "@/types";
import { fetchProducts } from "@/lib/api/products";
import { fetchAllOrders } from "@/lib/api/orders";
import { fetchAdminCustomers, CustomerStats } from "@/lib/api/analytics";
import { getNextInvoiceNumber, fetchInvoiceSettings } from "@/lib/api/invoices";
import { formatPrice } from "@/lib/utils";

interface InvoiceFormProps {
  invoice: Partial<Invoice>;
  onChange: (updated: Partial<Invoice>) => void;
  onSaveDraft: () => void;
  onFinalize: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onShareWhatsApp: () => void;
  isSaving?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onChange,
  onSaveDraft,
  onFinalize,
  onDownloadPdf,
  onPrint,
  onShareWhatsApp,
  isSaving = false
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [showVisibilityOptions, setShowVisibilityOptions] = useState(false);
  const [showBusinessOptions, setShowBusinessOptions] = useState(false);
  const [selectedOrderRef, setSelectedOrderRef] = useState<string>("");
  const [selectedCustomerRef, setSelectedCustomerRef] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const [prodsData, ordersData, custsData] = await Promise.all([
          fetchProducts().catch(() => []),
          fetchAllOrders().catch(() => []),
          fetchAdminCustomers().catch(() => [])
        ]);
        setProducts(prodsData);
        setOrders(ordersData);
        setCustomers(custsData);
      } catch (err) {
        console.error("Error loading reference data for invoice form:", err);
      }
    }
    loadData();
  }, []);

  // Update calculation whenever items, discount, shipping, tax change
  const recalculateTotals = (
    items: InvoiceItem[] = invoice.items || [],
    discount: number = invoice.discount || 0,
    shipping: number = invoice.shipping || 0,
    taxEnabled: boolean = invoice.taxEnabled || false,
    taxRate: number = invoice.taxRate || 0
  ) => {
    const subtotal = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = taxEnabled ? (afterDiscount * taxRate) / 100 : 0;
    const total = Math.max(0, afterDiscount + shipping + tax);

    const paymentStatus = invoice.payment?.status || invoice.status || "pending";
    let amountPaid = invoice.payment?.amountPaid || 0;
    if (paymentStatus === "paid") {
      amountPaid = total;
    }
    const balanceDue = Math.max(0, total - amountPaid);

    onChange({
      ...invoice,
      items,
      subtotal,
      discount,
      shipping,
      taxEnabled,
      taxRate,
      tax,
      total,
      payment: {
        method: invoice.payment?.method || "upi",
        status: paymentStatus,
        amountPaid,
        balanceDue,
        transactionId: invoice.payment?.transactionId || ""
      }
    });
  };

  // Populate from database Order
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderRef(orderId);
    if (!orderId) return;

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const populatedItems: InvoiceItem[] = (order.items || []).map((oi, idx) => {
      const price = oi.price_at_time || oi.product?.price || 0;
      const qty = oi.quantity || 1;
      return {
        id: `item-${Date.now()}-${idx}`,
        productId: oi.product?.id || "",
        name: oi.product?.name || "Handcrafted Crochet Item",
        description: "",
        quantity: qty,
        unitPrice: price,
        discount: 0,
        amount: qty * price
      };
    });

    const shippingAddr = order.shippingAddress || ({} as any);

    const updatedCustomer = {
      name: shippingAddr.name || "Customer Name",
      email: shippingAddr.email || "",
      phone: shippingAddr.phone || "",
      address: shippingAddr.street || "",
      city: shippingAddr.city || "",
      state: shippingAddr.state || "",
      pin: shippingAddr.zipCode || "",
      gstin: ""
    };

    const newDiscount = order.discountAmount || 0;
    const newShipping = order.deliveryCharge || 0;

    onChange({
      ...invoice,
      orderId: order.id,
      orderNumber: order.id.replace("ORD-", "FL-"),
      customer: updatedCustomer,
      items: populatedItems,
      discount: newDiscount,
      shipping: newShipping,
      payment: {
        method: (order.paymentMethod as PaymentMethod) || "upi",
        status: order.status === "delivered" ? "paid" : "pending",
        amountPaid: order.status === "delivered" ? order.total : 0,
        balanceDue: order.status === "delivered" ? 0 : order.total,
        transactionId: order.utrNumber || ""
      }
    });

    recalculateTotals(populatedItems, newDiscount, newShipping);
  };

  // Populate from existing Customer
  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerRef(custId);
    if (!custId) return;

    const cust = customers.find((c) => c.id === custId);
    if (!cust) return;

    onChange({
      ...invoice,
      customer: {
        name: cust.name,
        email: cust.email,
        phone: cust.phone !== "N/A" ? cust.phone : "",
        address: cust.location !== "No address" ? cust.location : "",
        city: "",
        state: "",
        pin: "",
        gstin: ""
      }
    });
  };

  // Item additions & edits
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      amount: 0
    };
    const newItems = [...(invoice.items || []), newItem];
    recalculateTotals(newItems);
  };

  const handleRemoveItem = (id: string) => {
    const newItems = (invoice.items || []).filter((item) => item.id !== id);
    recalculateTotals(newItems);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = (invoice.items || []).map((item) => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };

      // Auto calculation for amount
      if (field === "quantity" || field === "unitPrice" || field === "discount") {
        const qty = Number(field === "quantity" ? value : updated.quantity) || 0;
        const price = Number(field === "unitPrice" ? value : updated.unitPrice) || 0;
        const disc = Number(field === "discount" ? value : updated.discount) || 0;
        updated.amount = Math.max(0, qty * price - disc);
      }

      return updated;
    });

    recalculateTotals(newItems);
  };

  const handleSelectProduct = (itemId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    handleItemChange(itemId, "name", product.name);
    handleItemChange(itemId, "unitPrice", product.price);
    handleItemChange(itemId, "productId", product.id);
  };

  const currentVis = invoice.visibilitySettings || {
    showLogo: true,
    showGst: false,
    showDiscount: true,
    showShipping: true,
    showCustomerPhone: true,
    showCustomerEmail: true,
    showCustomerGstin: true,
    showNotes: true,
    showPaymentRef: true,
    showDueDate: true,
    showCareInstructions: true,
    showSignature: true,
    signatureTitle: "Authorized Signatory",
    signatureName: "Anshuma • Founder & Creator"
  };

  const handleToggleVis = (key: keyof typeof currentVis) => {
    const updatedVis = { ...currentVis, [key]: !currentVis[key] };
    onChange({ ...invoice, visibilitySettings: updatedVis });
  };

  return (
    <div className="space-y-6 w-full text-foreground text-sm">
      {/* Primary Action Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-secondary shadow-sm flex flex-wrap items-center justify-between gap-3 sticky top-20 z-10">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose" />
          <span className="font-serif font-bold text-lg">
            {invoice.invoiceNumber || "New Invoice"}
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              invoice.status === "paid"
                ? "bg-emerald-100 text-emerald-700"
                : invoice.status === "draft"
                ? "bg-secondary text-foreground/60"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {invoice.status || "DRAFT"}
          </span>

          {/* Quick Mark as Paid / Pending Toggle */}
          <button
            type="button"
            onClick={() => {
              const newStatus: InvoiceStatus = invoice.status === "paid" ? "pending" : "paid";
              const paid = newStatus === "paid" ? (invoice.total || 0) : 0;
              const bal = Math.max(0, (invoice.total || 0) - paid);
              onChange({
                ...invoice,
                status: newStatus,
                payment: {
                  ...(invoice.payment as any),
                  status: newStatus,
                  amountPaid: paid,
                  balanceDue: bal
                }
              });
            }}
            className={`ml-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
              invoice.status === "paid"
                ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
            }`}
          >
            {invoice.status === "paid" ? "Mark as Pending" : "✓ Mark as Paid"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-2 border border-secondary bg-white hover:bg-secondary/40 text-foreground font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>

          <button
            type="button"
            onClick={onFinalize}
            disabled={isSaving}
            className="px-4 py-2 bg-rose text-white hover:bg-rose/90 font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Finalize & Save
          </button>

          <div className="h-4 w-px bg-secondary mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={onDownloadPdf}
            className="p-2 border border-secondary rounded-lg hover:bg-secondary/50 text-foreground/70"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="p-2 border border-secondary rounded-lg hover:bg-secondary/50 text-foreground/70"
            title="Print Invoice"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onShareWhatsApp}
            className="px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-medium flex items-center gap-1.5"
            title="Share via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Database Quick Population Box */}
      <div className="bg-secondary/20 p-4 rounded-xl border border-secondary/60 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-rose flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Quick Auto-Populate from Store Database
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">
              Import Existing Store Order
            </label>
            <select
              value={selectedOrderRef}
              onChange={(e) => handleSelectOrder(e.target.value)}
              className="w-full bg-white border border-secondary rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose"
            >
              <option value="">-- Select Order --</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.shippingAddress?.name || "Customer"} ({formatPrice(o.total)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">
              Import Existing Customer Profile
            </label>
            <select
              value={selectedCustomerRef}
              onChange={(e) => handleSelectCustomer(e.target.value)}
              className="w-full bg-white border border-secondary rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose"
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Meta Section */}
      <div className="bg-white p-5 rounded-xl border border-secondary space-y-4">
        <h3 className="font-serif font-semibold text-base border-b border-secondary pb-2">
          1. Invoice Meta Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">
              Invoice Number <span className="text-rose">*</span>
            </label>
            <input
              type="text"
              value={invoice.invoiceNumber || ""}
              onChange={(e) => onChange({ ...invoice, invoiceNumber: e.target.value })}
              className="w-full border border-secondary rounded-md px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-rose"
              placeholder="INV-0001"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">Order Number</label>
            <input
              type="text"
              value={invoice.orderNumber || ""}
              onChange={(e) => onChange({ ...invoice, orderNumber: e.target.value })}
              className="w-full border border-secondary rounded-md px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-rose"
              placeholder="FL-00001"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoice.invoiceDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => onChange({ ...invoice, invoiceDate: e.target.value })}
              className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-rose"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={invoice.dueDate || ""}
              onChange={(e) => onChange({ ...invoice, dueDate: e.target.value })}
              className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-rose"
            />
          </div>
        </div>
      </div>

      {/* Customer / BILL TO Section */}
      <div className="bg-white p-5 rounded-xl border border-secondary space-y-4">
        <h3 className="font-serif font-semibold text-base border-b border-secondary pb-2 flex items-center justify-between">
          <span>2. Bill To (Customer Details)</span>
          <User className="w-4 h-4 text-foreground/40" />
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">Customer Name</label>
            <input
              type="text"
              value={invoice.customer?.name || ""}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  customer: { ...(invoice.customer as any), name: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-rose"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">Email Address</label>
            <input
              type="email"
              value={invoice.customer?.email || ""}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  customer: { ...(invoice.customer as any), email: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-rose"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">Phone Number</label>
            <input
              type="text"
              value={invoice.customer?.phone || ""}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  customer: { ...(invoice.customer as any), phone: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-rose"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">GSTIN (Optional)</label>
            <input
              type="text"
              value={invoice.customer?.gstin || ""}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  customer: { ...(invoice.customer as any), gstin: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-rose"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-foreground/70 mb-1">Billing Address</label>
            <input
              type="text"
              value={invoice.customer?.address || ""}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  customer: { ...(invoice.customer as any), address: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-rose mb-2"
              placeholder="Street Address / House No."
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={invoice.customer?.city || ""}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    customer: { ...(invoice.customer as any), city: e.target.value }
                  })
                }
                className="border border-secondary rounded-md px-3 py-1 text-xs focus:outline-none focus:border-rose"
                placeholder="City"
              />
              <input
                type="text"
                value={invoice.customer?.state || ""}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    customer: { ...(invoice.customer as any), state: e.target.value }
                  })
                }
                className="border border-secondary rounded-md px-3 py-1 text-xs focus:outline-none focus:border-rose"
                placeholder="State"
              />
              <input
                type="text"
                value={invoice.customer?.pin || ""}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    customer: { ...(invoice.customer as any), pin: e.target.value }
                  })
                }
                className="border border-secondary rounded-md px-3 py-1 text-xs focus:outline-none focus:border-rose"
                placeholder="PIN Code"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Invoice Products Table */}
      <div className="bg-white p-5 rounded-xl border border-secondary space-y-4">
        <div className="flex items-center justify-between border-b border-secondary pb-2">
          <h3 className="font-serif font-semibold text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-foreground/40" />
            3. Products / Invoice Items
          </h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-1.5 bg-rose/10 text-rose hover:bg-rose/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>

        <div className="space-y-4">
          {(invoice.items || []).map((item, idx) => (
            <div
              key={item.id}
              className="p-3 bg-secondary/10 rounded-lg border border-secondary/60 space-y-3 relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground/40 font-mono">Item #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-foreground/40 hover:text-rose p-1 rounded transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Product Dropdown & Name */}
                <div className="sm:col-span-6 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-foreground/70">Item Name</label>
                    {products.length > 0 && (
                      <select
                        onChange={(e) => handleSelectProduct(item.id, e.target.value)}
                        className="text-[10px] border border-secondary rounded px-1.5 py-0.5 bg-white text-foreground/70"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Import Catalog Product...
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatPrice(p.price)})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                    placeholder="e.g. Classic Beige Crochet Tote"
                    className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-rose bg-white"
                  />
                  <input
                    type="text"
                    value={item.description || ""}
                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                    placeholder="Custom description / specifications (optional)"
                    className="w-full border border-secondary rounded-md px-3 py-1 text-[11px] text-foreground/70 focus:outline-none focus:border-rose bg-white"
                  />
                </div>

                {/* Qty */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-foreground/70 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                    className="w-full border border-secondary rounded-md px-2 py-1.5 text-xs text-center font-semibold focus:outline-none focus:border-rose bg-white"
                  />
                </div>

                {/* Unit Price */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-foreground/70 mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                    className="w-full border border-secondary rounded-md px-2 py-1.5 text-xs text-right font-mono focus:outline-none focus:border-rose bg-white"
                  />
                </div>

                {/* Item Discount */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-foreground/70 mb-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.discount}
                    onChange={(e) => handleItemChange(item.id, "discount", e.target.value)}
                    className="w-full border border-secondary rounded-md px-2 py-1.5 text-xs text-right font-mono text-emerald-600 focus:outline-none focus:border-rose bg-white"
                  />
                </div>
              </div>

              <div className="text-right text-xs pt-1 border-t border-secondary/40 font-semibold font-mono">
                Amount: {formatPrice(item.amount)}
              </div>
            </div>
          ))}

          {invoice.items?.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed border-secondary rounded-xl">
              <p className="text-xs text-foreground/50 mb-3">No products added yet.</p>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-rose text-white rounded-lg text-xs font-medium hover:bg-rose/90"
              >
                + Add First Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Calculations & Summary Section */}
      <div className="bg-white p-5 rounded-xl border border-secondary space-y-4">
        <h3 className="font-serif font-semibold text-base border-b border-secondary pb-2">
          4. Automatic Calculations & Adjustments
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1">
                Overall Invoice Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={invoice.discount || 0}
                onChange={(e) => recalculateTotals(invoice.items, Number(e.target.value), invoice.shipping, invoice.taxEnabled, invoice.taxRate)}
                className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs font-mono text-emerald-600 focus:outline-none focus:border-rose"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1">
                Shipping & Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                value={invoice.shipping || 0}
                onChange={(e) => recalculateTotals(invoice.items, invoice.discount, Number(e.target.value), invoice.taxEnabled, invoice.taxRate)}
                className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-rose"
              />
            </div>

            {/* Tax Toggle */}
            <div className="p-3 bg-secondary/30 rounded-lg border border-secondary flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">GST / Tax Charge</span>
                <span className="text-[10px] text-foreground/50">Optional GST tax line item</span>
              </div>
              <button
                type="button"
                onClick={() => recalculateTotals(invoice.items, invoice.discount, invoice.shipping, !invoice.taxEnabled, invoice.taxRate)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  invoice.taxEnabled ? "bg-emerald-600 text-white" : "bg-secondary text-foreground/60"
                }`}
              >
                {invoice.taxEnabled ? "TAX: ON" : "TAX: OFF"}
              </button>
            </div>

            {invoice.taxEnabled && (
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invoice.taxRate || 0}
                  onChange={(e) => recalculateTotals(invoice.items, invoice.discount, invoice.shipping, true, Number(e.target.value))}
                  className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-rose"
                  placeholder="e.g. 5, 12, 18"
                />
              </div>
            )}
          </div>

          <div className="bg-secondary/20 p-4 rounded-xl border border-secondary/60 flex flex-col justify-between space-y-2 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground/70">Subtotal:</span>
                <span className="font-mono font-medium">{formatPrice(invoice.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-mono">-{formatPrice(invoice.discount || 0)}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Shipping:</span>
                <span className="font-mono">{formatPrice(invoice.shipping || 0)}</span>
              </div>
              {invoice.taxEnabled && (
                <div className="flex justify-between text-foreground/70">
                  <span>Tax ({invoice.taxRate || 0}%):</span>
                  <span className="font-mono">{formatPrice(invoice.tax || 0)}</span>
                </div>
              )}
            </div>

            <div className="border-t-2 border-rose/30 pt-3 flex justify-between items-center font-bold">
              <span className="font-serif text-sm">Grand Total:</span>
              <span className="font-serif text-lg text-rose font-mono">
                {formatPrice(invoice.total || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white p-5 rounded-xl border border-secondary space-y-4">
        <h3 className="font-serif font-semibold text-base border-b border-secondary pb-2">
          5. Payment Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">Payment Method</label>
            <select
              value={invoice.payment?.method || "upi"}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  payment: { ...(invoice.payment as any), method: e.target.value as PaymentMethod }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-rose bg-white"
            >
              <option value="upi">UPI / GPay / PhonePe</option>
              <option value="card">Credit / Debit Card</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="bank_transfer">Direct Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">Payment Status</label>
            <select
              value={invoice.payment?.status || invoice.status || "pending"}
              onChange={(e) => {
                const newStatus = e.target.value as InvoiceStatus;
                let paid = invoice.payment?.amountPaid || 0;
                if (newStatus === "paid") paid = invoice.total || 0;
                if (newStatus === "pending" || newStatus === "draft") paid = 0;
                const bal = Math.max(0, (invoice.total || 0) - paid);

                onChange({
                  ...invoice,
                  status: newStatus,
                  payment: {
                    ...(invoice.payment as any),
                    status: newStatus,
                    amountPaid: paid,
                    balanceDue: bal
                  }
                });
              }}
              className="w-full border border-secondary rounded-md px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-rose bg-white"
            >
              <option value="draft">DRAFT</option>
              <option value="pending">PENDING</option>
              <option value="paid">PAID</option>
              <option value="partially_paid">PARTIALLY PAID</option>
              <option value="refunded">REFUNDED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">
              Transaction ID / Ref / UTR
            </label>
            <input
              type="text"
              value={invoice.payment?.transactionId || ""}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  payment: { ...(invoice.payment as any), transactionId: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-rose"
              placeholder="e.g. UTR-982138712"
            />
          </div>
        </div>

        {invoice.payment?.status === "partially_paid" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-amber-800 mb-1">Amount Paid (₹)</label>
              <input
                type="number"
                min="0"
                value={invoice.payment.amountPaid}
                onChange={(e) => {
                  const paid = Number(e.target.value) || 0;
                  const bal = Math.max(0, (invoice.total || 0) - paid);
                  onChange({
                    ...invoice,
                    payment: { ...(invoice.payment as any), amountPaid: paid, balanceDue: bal }
                  });
                }}
                className="w-full bg-white border border-amber-300 rounded px-2 py-1 font-mono"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-amber-800 font-medium">Balance Due:</span>
              <span className="font-mono font-bold text-rose text-sm">
                {formatPrice(invoice.payment.balanceDue || 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notes Field */}
      <div className="bg-white p-5 rounded-xl border border-secondary space-y-3">
        <h3 className="font-serif font-semibold text-base border-b border-secondary pb-2">
          6. Notes & Special Instructions
        </h3>
        <textarea
          rows={3}
          value={invoice.notes || ""}
          onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
          className="w-full border border-secondary rounded-md p-3 text-xs focus:outline-none focus:border-rose"
          placeholder="e.g. Handcrafted with love • Custom color customization applied"
        />
      </div>

      {/* Customize Visibility Toggles */}
      <div className="bg-white rounded-xl border border-secondary overflow-hidden">
        <button
          type="button"
          onClick={() => setShowVisibilityOptions(!showVisibilityOptions)}
          className="w-full p-4 text-left font-serif font-semibold text-base flex items-center justify-between hover:bg-secondary/20 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-rose" /> Customize Invoice Field Visibility
          </span>
          {showVisibilityOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showVisibilityOptions && (
          <div className="p-5 border-t border-secondary bg-secondary/10 space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(currentVis)
                .filter(([k]) => k.startsWith("show"))
                .map(([key, val]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded border border-secondary hover:border-rose/50"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={() => handleToggleVis(key as any)}
                      className="rounded text-rose focus:ring-rose"
                    />
                    <span className="capitalize font-medium text-foreground/80">
                      {key.replace("show", "Show ")}
                    </span>
                  </label>
                ))}
            </div>

            {currentVis.showSignature !== false && (
              <div className="pt-3 border-t border-secondary/60 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-secondary">
                <div>
                  <label className="block text-[11px] font-medium text-foreground/70 mb-1">
                    Signatory Name / Text
                  </label>
                  <input
                    type="text"
                    value={currentVis.signatureName || "Anshuma • Founder & Creator"}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        visibilitySettings: { ...currentVis, signatureName: e.target.value }
                      })
                    }
                    className="w-full border border-secondary rounded px-2.5 py-1 text-xs"
                    placeholder="e.g. Anshuma"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground/70 mb-1">
                    Signatory Title
                  </label>
                  <input
                    type="text"
                    value={currentVis.signatureTitle || "Authorized Signatory"}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        visibilitySettings: { ...currentVis, signatureTitle: e.target.value }
                      })
                    }
                    className="w-full border border-secondary rounded px-2.5 py-1 text-xs"
                    placeholder="e.g. Authorized Signatory"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customize Business Details Toggle */}
      <div className="bg-white rounded-xl border border-secondary overflow-hidden">
        <button
          type="button"
          onClick={() => setShowBusinessOptions(!showBusinessOptions)}
          className="w-full p-4 text-left font-serif font-semibold text-base flex items-center justify-between hover:bg-secondary/20 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-rose" /> Customize FROM (Business Details for this invoice)
          </span>
          {showBusinessOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showBusinessOptions && (
          <div className="p-5 border-t border-secondary bg-secondary/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-foreground/70 mb-1 font-medium">Business Name</label>
              <input
                type="text"
                value={invoice.business?.name || ""}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    business: { ...(invoice.business as any), name: e.target.value }
                  })
                }
                className="w-full border border-secondary rounded p-1.5 bg-white"
              />
            </div>
            <div>
              <label className="block text-foreground/70 mb-1 font-medium">Tagline</label>
              <input
                type="text"
                value={invoice.business?.tagline || ""}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    business: { ...(invoice.business as any), tagline: e.target.value }
                  })
                }
                className="w-full border border-secondary rounded p-1.5 bg-white"
              />
            </div>
            <div>
              <label className="block text-foreground/70 mb-1 font-medium">Address</label>
              <input
                type="text"
                value={invoice.business?.address || ""}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    business: { ...(invoice.business as any), address: e.target.value }
                  })
                }
                className="w-full border border-secondary rounded p-1.5 bg-white"
              />
            </div>
            <div>
              <label className="block text-foreground/70 mb-1 font-medium">Email</label>
              <input
                type="text"
                value={invoice.business?.email || ""}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    business: { ...(invoice.business as any), email: e.target.value }
                  })
                }
                className="w-full border border-secondary rounded p-1.5 bg-white"
              />
            </div>
            <div>
              <label className="block text-foreground/70 mb-1 font-medium">Phone</label>
              <input
                type="text"
                value={invoice.business?.phone || ""}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    business: { ...(invoice.business as any), phone: e.target.value }
                  })
                }
                className="w-full border border-secondary rounded p-1.5 bg-white"
              />
            </div>
            <div>
              <label className="block text-foreground/70 mb-1 font-medium">GSTIN</label>
              <input
                type="text"
                value={invoice.business?.gstin || ""}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    business: { ...(invoice.business as any), gstin: e.target.value }
                  })
                }
                className="w-full border border-secondary rounded p-1.5 bg-white font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
