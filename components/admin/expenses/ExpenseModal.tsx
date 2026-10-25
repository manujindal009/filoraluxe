"use client";

import React from "react";
import { X, Download, Printer, Edit, Copy, Trash2 } from "lucide-react";
import { Expense } from "@/types/expense";
import { ExpenseVoucherTemplate } from "./ExpenseVoucherTemplate";
import { downloadInvoicePdf, printInvoice } from "@/lib/utils/pdf";

interface ExpenseModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (expense: Expense) => void;
  onDuplicate?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  expense,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  if (!isOpen || !expense) return null;

  const handleDownload = () => {
    downloadInvoicePdf("expense-voucher-printable", `${expense.expenseNumber}_voucher.pdf`);
  };

  const handlePrint = () => {
    printInvoice("expense-voucher-printable");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-secondary shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Action Bar */}
        <div className="px-5 py-3.5 border-b border-secondary flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="font-serif font-bold text-base text-foreground">
              {expense.expenseNumber}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                expense.status === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : expense.status === "partially_paid"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {expense.status.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleDownload}
              className="px-2.5 sm:px-3 py-1.5 border border-secondary rounded-lg text-xs font-medium hover:bg-secondary/40 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 border border-secondary rounded-lg text-xs font-medium hover:bg-secondary/40 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(expense);
                }}
                className="px-2.5 sm:px-3 py-1.5 bg-rose text-white rounded-lg text-xs font-medium hover:bg-rose/90 flex items-center gap-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={() => {
                  onClose();
                  onDuplicate(expense);
                }}
                className="p-1.5 text-foreground/60 hover:text-foreground border border-secondary rounded-lg transition-colors"
                title="Duplicate Expense"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete expense ${expense.expenseNumber}?`)) {
                    onDelete(expense.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-rose hover:bg-rose/10 border border-rose/20 rounded-lg transition-colors"
                title="Delete Expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-foreground/40 hover:text-foreground rounded-lg ml-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content containing Voucher Template */}
        <div className="p-4 sm:p-5 overflow-y-auto bg-[#faf8f6] flex justify-center">
          <ExpenseVoucherTemplate expense={expense} isModalView={true} />
        </div>
      </div>
    </div>
  );
};
