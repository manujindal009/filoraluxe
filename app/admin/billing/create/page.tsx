"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, CheckCircle, Download, Printer, Share2 } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { fetchInvoiceSettings, getNextInvoiceNumber, saveInvoice } from "@/lib/api/invoices";
import { fetchAllOrders } from "@/lib/api/orders";
import { InvoiceForm } from "@/components/admin/billing/InvoiceForm";
import { InvoiceTemplate } from "@/components/admin/billing/InvoiceTemplate";
import { useToast } from "@/context/ToastContext";
import { downloadInvoicePdf, printInvoice, shareInvoiceWhatsApp } from "@/lib/utils/pdf";

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const { addToast } = useToast();

  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: "",
    orderNumber: "",
    status: "draft",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    customer: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pin: "",
      gstin: ""
    },
    items: [],
    subtotal: 0,
    discount: 0,
    shipping: 0,
    taxEnabled: false,
    taxRate: 0,
    tax: 0,
    total: 0,
    payment: {
      method: "upi",
      status: "pending",
      amountPaid: 0,
      balanceDue: 0,
      transactionId: ""
    },
    notes: "",
    visibilitySettings: {
      showGst: false,
      showDiscount: true,
      showShipping: true,
      showCustomerPhone: true,
      showCustomerEmail: true,
      showCustomerGstin: false,
      showNotes: true,
      showPaymentRef: true,
      showDueDate: true,
      showCareInstructions: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<"form" | "preview">("form");

  useEffect(() => {
    async function init() {
      try {
        const settings = await fetchInvoiceSettings();
        const nextNum = await getNextInvoiceNumber(settings.defaults.invoicePrefix);

        setInvoice((prev) => ({
          ...prev,
          invoiceNumber: nextNum,
          business: settings.business,
          notes: settings.defaults.defaultNotes,
          visibilitySettings: settings.visibility,
          payment: {
            method: settings.defaults.defaultPaymentMethod,
            status: settings.defaults.defaultPaymentStatus,
            amountPaid: 0,
            balanceDue: 0,
            transactionId: ""
          }
        }));

        // If orderId was passed in URL query
        if (orderIdParam) {
          const allOrders = await fetchAllOrders();
          const targetOrder = allOrders.find((o) => o.id === orderIdParam);
          if (targetOrder) {
            const items = (targetOrder.items || []).map((oi, idx) => ({
              id: `item-${Date.now()}-${idx}`,
              productId: oi.product?.id || "",
              name: oi.product?.name || "Crochet Item",
              quantity: oi.quantity || 1,
              unitPrice: oi.price_at_time || oi.product?.price || 0,
              discount: 0,
              amount: (oi.quantity || 1) * (oi.price_at_time || oi.product?.price || 0)
            }));

            const sub = items.reduce((a, b) => a + b.amount, 0);
            const disc = targetOrder.discountAmount || 0;
            const ship = targetOrder.deliveryCharge || 0;
            const tot = Math.max(0, sub - disc + ship);

            setInvoice((prev) => ({
              ...prev,
              orderId: targetOrder.id,
              orderNumber: targetOrder.id.replace("ORD-", "FL-"),
              customer: {
                name: targetOrder.shippingAddress?.name || "",
                email: targetOrder.shippingAddress?.email || "",
                phone: targetOrder.shippingAddress?.phone || "",
                address: targetOrder.shippingAddress?.street || "",
                city: targetOrder.shippingAddress?.city || "",
                state: targetOrder.shippingAddress?.state || "",
                pin: targetOrder.shippingAddress?.zipCode || "",
                gstin: ""
              },
              items,
              subtotal: sub,
              discount: disc,
              shipping: ship,
              total: tot,
              payment: {
                method: (targetOrder.paymentMethod as any) || "upi",
                status: targetOrder.status === "delivered" ? "paid" : "pending",
                amountPaid: targetOrder.status === "delivered" ? tot : 0,
                balanceDue: targetOrder.status === "delivered" ? 0 : tot,
                transactionId: targetOrder.utrNumber || ""
              }
            }));
          }
        }
      } catch (err) {
        console.error("Init invoice creation error:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [orderIdParam]);

  const handleSave = async (statusOverride?: "draft" | "pending" | "paid") => {
    try {
      setIsSaving(true);
      const toSave = {
        ...invoice,
        status: statusOverride || invoice.status || "draft"
      };

      const saved = await saveInvoice(toSave);
      addToast(
        statusOverride === "draft"
          ? `Draft invoice ${saved.invoiceNumber} saved!`
          : `Invoice ${saved.invoiceNumber} finalized & saved successfully!`,
        "success"
      );
      router.push("/admin/billing");
    } catch (err) {
      addToast("Failed to save invoice", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-foreground/50">Loading invoice workspace...</div>;
  }

  return (
    <div className="space-y-6 w-full text-foreground pb-16">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/billing"
            className="p-2 border border-secondary bg-white hover:bg-secondary/50 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-semibold">Create New Invoice</h1>
            <p className="text-xs text-foreground/60">
              Generate a handcrafted Filora Luxe invoice with live side-by-side preview.
            </p>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden items-center gap-2 border border-secondary rounded-lg p-1 bg-white w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTabMobile("form")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold ${
              activeTabMobile === "form" ? "bg-rose text-white" : "text-foreground/70"
            }`}
          >
            Edit Form
          </button>
          <button
            onClick={() => setActiveTabMobile("preview")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold ${
              activeTabMobile === "preview" ? "bg-rose text-white" : "text-foreground/70"
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div
          className={`lg:col-span-6 space-y-6 ${
            activeTabMobile === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          <InvoiceForm
            invoice={invoice}
            onChange={(updated) => setInvoice(updated)}
            onSaveDraft={() => handleSave("draft")}
            onFinalize={() => handleSave("pending")}
            onDownloadPdf={() => downloadInvoicePdf("invoice-template-printable")}
            onPrint={() => printInvoice("invoice-template-printable")}
            onShareWhatsApp={() =>
              shareInvoiceWhatsApp(
                invoice.customer?.name || "",
                invoice.invoiceNumber || "",
                invoice.total || 0,
                invoice.shareToken || invoice.invoiceNumber || invoice.id,
                invoice.customer?.phone
              )
            }
            isSaving={isSaving}
          />
        </div>

        {/* Right Column: Live Invoice Preview */}
        <div
          className={`lg:col-span-6 sticky top-24 space-y-4 ${
            activeTabMobile === "form" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="bg-white p-3 rounded-xl border border-secondary shadow-sm flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-foreground/70">
              Live Invoice Preview
            </span>
            <span className="text-[10px] text-rose font-medium bg-rose/10 px-2 py-0.5 rounded-full">
              Updates Instantly
            </span>
          </div>

          <div className="overflow-x-auto pb-4 max-h-[82vh] overflow-y-auto rounded-xl shadow-lg border border-secondary">
            <InvoiceTemplate invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  );
}
