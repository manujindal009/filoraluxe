"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Printer, Share2, AlertCircle } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { fetchInvoiceById } from "@/lib/api/invoices";
import { InvoiceTemplate } from "@/components/admin/billing/InvoiceTemplate";
import { downloadInvoicePdf, printInvoice, shareInvoiceWhatsApp } from "@/lib/utils/pdf";

export default function PublicInvoicePage() {
  const params = useParams();
  const idOrToken = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (idOrToken) {
          const data = await fetchInvoiceById(idOrToken);
          setInvoice(data);
        }
      } catch (err) {
        console.error("Public invoice fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [idOrToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] text-foreground/50">
        Loading Filora Luxe invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F7] p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose mb-3" />
        <h1 className="font-serif text-2xl font-bold mb-2">Invoice Not Found</h1>
        <p className="text-xs text-foreground/60 max-w-sm">
          The requested invoice link could not be found or may have expired. Please verify the URL or contact Filora Luxe support.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-8 px-4 flex flex-col items-center space-y-6">
      {/* Top Action Bar */}
      <div className="w-full max-w-[800px] bg-white p-4 rounded-xl border border-secondary shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-serif font-bold text-lg text-[#c06c74]">
            {invoice.invoiceNumber}
          </span>
          <p className="text-xs text-foreground/50">Filora Luxe Official Invoice</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadInvoicePdf("invoice-template-printable", `${invoice.invoiceNumber}.pdf`)}
            className="px-3 py-2 border border-secondary rounded-lg text-xs font-medium hover:bg-secondary/40 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>

          <button
            onClick={() => printInvoice("invoice-template-printable")}
            className="px-3 py-2 border border-secondary rounded-lg text-xs font-medium hover:bg-secondary/40 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print
          </button>

          <button
            onClick={() =>
              shareInvoiceWhatsApp(
                invoice.customer.name,
                invoice.invoiceNumber,
                invoice.total,
                invoice.shareToken || invoice.invoiceNumber || invoice.id,
                invoice.customer.phone
              )
            }
            className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Invoice Card Component */}
      <div className="w-full max-w-[800px] overflow-hidden rounded-xl shadow-xl">
        <InvoiceTemplate invoice={invoice} />
      </div>
    </div>
  );
}
