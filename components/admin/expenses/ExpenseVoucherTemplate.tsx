"use client";

import React from "react";
import { Expense, EXPENSE_CATEGORIES } from "@/types/expense";
import { formatPrice } from "@/lib/utils";

interface ExpenseVoucherTemplateProps {
  expense: Partial<Expense>;
  isModalView?: boolean;
}

export const ExpenseVoucherTemplate: React.FC<ExpenseVoucherTemplateProps> = ({ 
  expense,
}) => {
  const categoryMeta = EXPENSE_CATEGORIES.find((c) => c.key === expense.category) || {
    label: expense.category || "General",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-800"
  };

  const vendor = expense.vendor || { name: "" };
  const items = expense.items && expense.items.length > 0 ? expense.items : null;

  // Clean helper to ignore dummy values like '.' or '-'
  const isValidVal = (val?: string) => {
    if (!val) return false;
    const clean = val.trim();
    return clean.length > 1 && clean !== "." && clean !== "-" && clean !== "—";
  };

  return (
    <div
      id="expense-voucher-printable"
      className="w-full max-w-xl mx-auto bg-white text-gray-900 font-sans p-6 sm:p-7 rounded-2xl border border-secondary/70 shadow-sm relative overflow-hidden"
    >
      {/* Top Banner Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose via-rose/70 to-rose/40" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-200 mt-1">
        <div>
          <span className="text-xl font-serif font-bold text-gray-900 tracking-tight">
            Filora Luxe
          </span>
          <p className="text-[11px] uppercase tracking-widest text-rose font-medium mt-0.5">
            Handmade Luxury Crochet
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Accounts & Expense Verification Department
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="inline-block bg-secondary/50 px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase text-foreground/80 mb-1">
            Expense Voucher
          </div>
          <h2 className="text-base font-bold font-mono text-gray-900">
            {expense.expenseNumber || "EXP-0000"}
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Date: <span className="font-medium text-gray-800">{expense.date || new Date().toISOString().split("T")[0]}</span>
          </p>
          <div className="mt-1">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                expense.status === "paid"
                  ? "bg-emerald-100 text-emerald-800"
                  : expense.status === "partially_paid"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Payment: {expense.status || "paid"}
            </span>
          </div>
        </div>
      </div>

      {/* Expense Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-3.5 rounded-xl bg-secondary/20 border border-secondary/40 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Expense Title & Category
          </span>
          <p className="text-xs font-semibold text-gray-900 mt-1 break-words">
            {expense.title || "Untitled Expense"}
          </p>
          <div className="mt-2">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${categoryMeta.badgeBg} ${categoryMeta.badgeText}`}>
              {categoryMeta.label}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Vendor / Payee Details
          </span>
          <p className="text-xs font-semibold text-gray-900 mt-1">
            {vendor.name || "Vendor / Self"}
          </p>
          {isValidVal(vendor.phone) && <p className="text-gray-600 mt-0.5 text-[11px]">Phone: {vendor.phone}</p>}
          {isValidVal(vendor.email) && <p className="text-gray-600 mt-0.5 text-[11px]">Email: {vendor.email}</p>}
          {isValidVal(vendor.gstin) && <p className="text-gray-600 mt-0.5 text-[11px]">GSTIN: {vendor.gstin}</p>}
          {isValidVal(vendor.address) && <p className="text-gray-600 mt-0.5 text-[11px]">{vendor.address}</p>}
        </div>
      </div>

      {/* Payment Meta Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-gray-200 text-xs">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">Payment Method</span>
          <span className="font-semibold uppercase text-gray-800 mt-0.5 block">
            {expense.paymentMethod || "UPI"}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">Ref / UTR No.</span>
          <span className="font-mono text-gray-800 mt-0.5 block truncate">
            {expense.referenceNumber || "—"}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">Amount Paid</span>
          <span className="font-semibold text-emerald-700 mt-0.5 block">
            {formatPrice(expense.amountPaid ?? 0)}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">Balance Due</span>
          <span className={`font-semibold mt-0.5 block ${(expense.balanceDue ?? 0) > 0 ? "text-rose" : "text-gray-800"}`}>
            {formatPrice(expense.balanceDue ?? 0)}
          </span>
        </div>
      </div>

      {/* Itemized or Single Expense Breakdown */}
      <div className="my-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
          Expense Particulars & Breakdown
        </h4>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-[11px]">
              <th className="py-2 px-2.5 font-semibold">Description</th>
              <th className="py-2 px-2.5 text-center font-semibold w-16">Qty</th>
              <th className="py-2 px-2.5 text-right font-semibold w-24">Rate</th>
              <th className="py-2 px-2.5 text-right font-semibold w-28">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items ? (
              items.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="py-2 px-2.5 font-medium text-gray-800">{item.name}</td>
                  <td className="py-2 px-2.5 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-2 px-2.5 text-right text-gray-600">{formatPrice(item.unitPrice)}</td>
                  <td className="py-2 px-2.5 text-right font-semibold text-gray-900">{formatPrice(item.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-2 px-2.5 font-medium text-gray-800">{expense.title || "Business Expense"}</td>
                <td className="py-2 px-2.5 text-center text-gray-600">1</td>
                <td className="py-2 px-2.5 text-right text-gray-600">{formatPrice(expense.subtotal ?? 0)}</td>
                <td className="py-2 px-2.5 text-right font-semibold text-gray-900">{formatPrice(expense.subtotal ?? 0)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-3 border-t border-gray-200">
        <div className="w-full sm:max-w-xs text-xs text-gray-600">
          {expense.notes && (
            <div className="p-2.5 bg-secondary/20 rounded-md border border-secondary/40 text-[11px]">
              <span className="font-semibold text-gray-700 block mb-0.5">Notes / Remarks:</span>
              <p className="whitespace-pre-line text-gray-600">{expense.notes}</p>
            </div>
          )}
          {expense.receiptUrl && (
            <div className="mt-1 text-[11px] text-gray-500">
              Receipt: <span className="font-mono text-rose underline truncate block">{expense.receiptUrl}</span>
            </div>
          )}
        </div>

        <div className="w-full sm:w-56 space-y-1.5 text-xs ml-auto">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span className="font-medium text-gray-800">{formatPrice(expense.subtotal ?? 0)}</span>
          </div>
          {expense.taxEnabled && (
            <div className="flex justify-between text-gray-600">
              <span>GST / Tax ({expense.taxRate || 0}%):</span>
              <span className="font-medium text-gray-800">{formatPrice(expense.taxAmount ?? 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-gray-300 text-gray-900">
            <span>Total Expense:</span>
            <span className="text-rose text-sm font-serif font-bold">{formatPrice(expense.total ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Signature & Authorization Section */}
      <div className="mt-6 pt-4 border-t border-dashed border-gray-300 grid grid-cols-2 gap-6 text-center text-xs">
        <div>
          <div className="h-8 flex items-end justify-center">
            <span className="font-serif italic text-xs text-gray-500">Filora Luxe Admin</span>
          </div>
          <div className="border-t border-gray-300 pt-1 text-gray-500 text-[11px] font-medium">
            Prepared & Verified By
          </div>
        </div>
        <div>
          <div className="h-8 flex items-end justify-center">
            <span className="font-serif italic text-xs text-gray-500">Authorized Signatory</span>
          </div>
          <div className="border-t border-gray-300 pt-1 text-gray-500 text-[11px] font-medium">
            Approved By
          </div>
        </div>
      </div>
    </div>
  );
};
