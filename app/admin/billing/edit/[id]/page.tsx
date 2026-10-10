"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, CheckCircle, Download, Printer, Share2 } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { fetchInvoiceById, saveInvoice } from "@/lib/api/invoices";
import { InvoiceForm } from "@/components/admin/billing/InvoiceForm";
import { InvoiceTemplate } from "@/components/admin/billing/InvoiceTemplate";
import { useToast } from "@/context/ToastContext";
import { downloadInvoicePdf, printInvoice, shareInvoiceWhatsApp } from "@/lib/utils/pdf";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { addToast } = useToast();

  const [invoice, setInvoice] = useState<Partial<Invoice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<"form" | "preview">("form");

  useEffect(() => {
    async function loadInvoice() {
      try {
        if (invoiceId) {
          const fetched = await fetchInvoiceById(invoiceId);
          if (fetched) {
            setInvoice(fetched);
          } else {
            addToast("Invoice not found", "error");
            router.push("/admin/billing");
          }
        }
      } catch (err) {
        console.error("Load invoice error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [invoiceId, router, addToast]);

  const handleSave = async (statusOverride?: "draft" | "pending" | "paid") => {
    if (!invoice) return;
    try {
      setIsSaving(true);
      const toSave = {
        ...invoice,
        status: statusOverride || invoice.status || "draft"
      };

      const saved = await saveInvoice(toSave);
      addToast(`Invoice ${saved.invoiceNumber} updated successfully!`, "success");
      router.push("/admin/billing");
    } catch (err) {
      addToast("Failed to update invoice", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !invoice) {
    return <div className="p-8 text-center text-foreground/50">Loading invoice details...</div>;
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
            <h1 className="text-2xl font-serif font-semibold">
              Edit Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-xs text-foreground/60">
              Modify invoice data, items, calculations, and custom field visibility.
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
            onFinalize={() => handleSave(invoice.status === "draft" ? "pending" : (invoice.status as any))}
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
