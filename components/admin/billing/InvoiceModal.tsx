"use client";

import React from "react";
import { X, Download, Printer, Share2, Copy, Edit, Trash2 } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { InvoiceTemplate } from "./InvoiceTemplate";
import { downloadInvoicePdf, printInvoice, shareInvoiceWhatsApp } from "@/lib/utils/pdf";

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
  onDuplicate?: (invoice: Invoice) => void;
  onDelete?: (id: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  if (!isOpen || !invoice) return null;

  const handleDownload = () => {
    downloadInvoicePdf("invoice-template-printable", `${invoice.invoiceNumber}.pdf`);
  };

  const handlePrint = () => {
    printInvoice("invoice-template-printable");
  };

  const handleWhatsApp = () => {
    shareInvoiceWhatsApp(
      invoice.customer.name, 
      invoice.invoiceNumber, 
      invoice.total,
      invoice.shareToken || invoice.invoiceNumber || invoice.id,
      invoice.customer.phone
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-secondary shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-secondary flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-lg text-foreground">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                invoice.status === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : invoice.status === "partially_paid"
                  ? "bg-amber-100 text-amber-700"
                  : invoice.status === "draft"
                  ? "bg-secondary text-foreground/60"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {invoice.status.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 border border-secondary rounded-lg text-xs font-medium hover:bg-secondary/40 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-secondary rounded-lg text-xs font-medium hover:bg-secondary/40 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(invoice);
                }}
                className="px-3 py-1.5 bg-rose text-white rounded-lg text-xs font-medium hover:bg-rose/90 flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={() => {
                  onClose();
                  onDuplicate(invoice);
                }}
                className="p-2 text-foreground/60 hover:text-foreground border border-secondary rounded-lg"
                title="Duplicate Invoice"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
                    onDelete(invoice.id);
                    onClose();
                  }
                }}
                className="p-2 text-rose hover:bg-rose/10 border border-rose/20 rounded-lg"
                title="Delete Invoice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-foreground/40 hover:text-foreground rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content containing Invoice Template */}
        <div className="p-6 overflow-y-auto bg-secondary/10 flex justify-center">
          <InvoiceTemplate invoice={invoice} />
        </div>
      </div>
    </div>
  );
};
