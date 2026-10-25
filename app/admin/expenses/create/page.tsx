"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Printer, Download, Eye, FileText } from "lucide-react";
import { Expense } from "@/types/expense";
import { fetchExpenseSettings, getNextExpenseNumber, saveExpense } from "@/lib/api/expenses";
import { ExpenseForm } from "@/components/admin/expenses/ExpenseForm";
import { ExpenseVoucherTemplate } from "@/components/admin/expenses/ExpenseVoucherTemplate";
import { useToast } from "@/context/ToastContext";
import { downloadInvoicePdf, printInvoice } from "@/lib/utils/pdf";

export default function CreateExpensePage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [expense, setExpense] = useState<Partial<Expense>>({
    expenseNumber: "EXP-0001",
    title: "",
    category: "raw_materials",
    date: new Date().toISOString().split("T")[0],
    subtotal: 0,
    taxEnabled: false,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    status: "paid",
    paymentMethod: "upi",
    amountPaid: 0,
    balanceDue: 0,
    referenceNumber: "",
    vendor: {
      name: "",
      phone: "",
      email: "",
      gstin: "",
      address: ""
    },
    items: [],
    notes: "",
    receiptUrl: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"form" | "preview">("form");

  useEffect(() => {
    async function init() {
      try {
        const settings = await fetchExpenseSettings();
        const nextNum = await getNextExpenseNumber(settings.prefix);

        setExpense((prev) => ({
          ...prev,
          expenseNumber: nextNum,
          category: settings.defaultCategory,
          status: settings.defaultPaymentStatus,
          paymentMethod: settings.defaultPaymentMethod
        }));
      } catch (err) {
        console.error("Init expense error:", err);
      }
    }
    init();
  }, []);

  const handleSave = async () => {
    if (!expense.title?.trim()) {
      addToast("Please provide an expense title or description", "error");
      return;
    }

    if (!expense.subtotal || expense.subtotal <= 0) {
      addToast("Please enter a valid expense amount", "error");
      return;
    }

    try {
      setIsSaving(true);
      await saveExpense(expense);
      addToast(`Expense ${expense.expenseNumber} saved successfully`, "success");
      router.push("/admin/expenses");
    } catch (err: any) {
      addToast(err?.message || "Failed to save expense", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    downloadInvoicePdf("expense-voucher-printable", `${expense.expenseNumber || "Expense"}_voucher.pdf`);
  };

  const handlePrint = () => {
    printInvoice("expense-voucher-printable");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-secondary/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/expenses"
            className="p-2 border border-secondary rounded-xl hover:bg-secondary/40 text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">Log Business Expense</h1>
            <p className="text-xs text-foreground/60">
              Voucher Ref: <span className="font-mono font-semibold text-rose">{expense.expenseNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 border border-secondary bg-white rounded-xl text-xs font-medium hover:bg-secondary/40 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-foreground/60" /> PDF Voucher
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 border border-secondary bg-white rounded-xl text-xs font-medium hover:bg-secondary/40 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-foreground/60" /> Print
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-rose text-white rounded-xl text-xs font-semibold hover:bg-rose/90 flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm shadow-rose/20"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex rounded-xl bg-secondary/30 p-1 border border-secondary/50">
        <button
          onClick={() => setActiveMobileTab("form")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
            activeMobileTab === "form" ? "bg-white text-foreground shadow-sm" : "text-foreground/60"
          }`}
        >
          <FileText className="w-4 h-4" /> Form Details
        </button>
        <button
          onClick={() => setActiveMobileTab("preview")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
            activeMobileTab === "preview" ? "bg-white text-foreground shadow-sm" : "text-foreground/60"
          }`}
        >
          <Eye className="w-4 h-4" /> Live Voucher Preview
        </button>
      </div>

      {/* Main Form & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Form */}
        <div className={`lg:col-span-7 ${activeMobileTab === "preview" ? "hidden lg:block" : "block"}`}>
          <ExpenseForm expense={expense} onChange={setExpense} />
        </div>

        {/* Right: Live Voucher Preview */}
        <div className={`lg:col-span-5 sticky top-24 ${activeMobileTab === "form" ? "hidden lg:block" : "block"}`}>
          <div className="bg-secondary/20 p-4 rounded-2xl border border-secondary/60">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                Live Voucher Preview
              </span>
              <span className="text-[11px] text-foreground/40">Auto-updates as you type</span>
            </div>

            <div className="overflow-hidden rounded-xl">
              <ExpenseVoucherTemplate expense={expense} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
