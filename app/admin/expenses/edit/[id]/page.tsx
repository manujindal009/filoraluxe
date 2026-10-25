"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Printer, Download, Eye, FileText } from "lucide-react";
import { Expense } from "@/types/expense";
import { fetchExpenseById, saveExpense, deleteExpense } from "@/lib/api/expenses";
import { ExpenseForm } from "@/components/admin/expenses/ExpenseForm";
import { ExpenseVoucherTemplate } from "@/components/admin/expenses/ExpenseVoucherTemplate";
import { useToast } from "@/context/ToastContext";
import { downloadInvoicePdf, printInvoice } from "@/lib/utils/pdf";

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"form" | "preview">("form");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchExpenseById(id);
        if (data) {
          setExpense(data);
        } else {
          addToast("Expense record not found", "error");
          router.push("/admin/expenses");
        }
      } catch (err) {
        addToast("Failed to load expense", "error");
        router.push("/admin/expenses");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router, addToast]);

  const handleSave = async () => {
    if (!expense) return;

    if (!expense.title?.trim()) {
      addToast("Please provide an expense title", "error");
      return;
    }

    if (!expense.subtotal || expense.subtotal <= 0) {
      addToast("Please enter a valid expense amount", "error");
      return;
    }

    try {
      setIsSaving(true);
      await saveExpense(expense);
      addToast(`Expense ${expense.expenseNumber} updated successfully`, "success");
      router.push("/admin/expenses");
    } catch (err: any) {
      addToast(err?.message || "Failed to update expense", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!expense) return;
    if (confirm(`Are you sure you want to delete expense ${expense.expenseNumber}?`)) {
      try {
        await deleteExpense(expense.id);
        addToast("Expense record deleted", "success");
        router.push("/admin/expenses");
      } catch (err) {
        addToast("Failed to delete expense", "error");
      }
    }
  };

  const handleDownload = () => {
    if (!expense) return;
    downloadInvoicePdf("expense-voucher-printable", `${expense.expenseNumber}_voucher.pdf`);
  };

  const handlePrint = () => {
    printInvoice("expense-voucher-printable");
  };

  if (loading || !expense) {
    return <div className="p-8 text-center text-foreground/50">Loading expense details...</div>;
  }

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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-foreground">Edit Expense</h1>
              <span className="font-mono text-sm px-2.5 py-0.5 rounded-md bg-secondary text-foreground font-semibold">
                {expense.expenseNumber}
              </span>
            </div>
            <p className="text-xs text-foreground/50 mt-0.5">
              Created on {new Date(expense.createdAt).toLocaleDateString()}
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
            onClick={handleDelete}
            className="px-3 py-2 border border-rose/30 text-rose hover:bg-rose/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-rose text-white rounded-xl text-xs font-semibold hover:bg-rose/90 flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm shadow-rose/20"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Update Expense"}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Form */}
        <div className={`lg:col-span-7 ${activeMobileTab === "preview" ? "hidden lg:block" : "block"}`}>
          <ExpenseForm
            expense={expense}
            onChange={(updated) => setExpense(updated as Expense)}
          />
        </div>

        {/* Right: Live Voucher Preview */}
        <div className={`lg:col-span-5 sticky top-24 ${activeMobileTab === "form" ? "hidden lg:block" : "block"}`}>
          <div className="bg-secondary/20 p-4 rounded-2xl border border-secondary/60">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                Live Voucher Preview
              </span>
              <span className="text-[11px] text-foreground/40">Updated live</span>
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
