"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, Copy, Download, Printer,
  Receipt, DollarSign, Clock, CheckCircle2, TrendingDown, Settings as SettingsIcon,
  RefreshCw, PieChart, AlertCircle
} from "lucide-react";
import { Expense, ExpenseCategory, ExpenseSettings, ExpenseStatus, EXPENSE_CATEGORIES } from "@/types/expense";
import { fetchExpenses, deleteExpense, duplicateExpense, updateExpenseStatus, fetchExpenseSettings, checkExpenseTableStatus } from "@/lib/api/expenses";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { ExpenseModal } from "@/components/admin/expenses/ExpenseModal";

export default function AdminExpensesPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<ExpenseSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbTableExists, setDbTableExists] = useState<boolean>(true);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selected for modal preview
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expData, settingsData, statusData] = await Promise.all([
        fetchExpenses(),
        fetchExpenseSettings(),
        checkExpenseTableStatus()
      ]);
      setExpenses(expData);
      setSettings(settingsData);
      setDbTableExists(statusData.tableExists);
    } catch (err) {
      addToast("Failed to load business expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearMockData = () => {
    if (confirm("Reset local cache to start completely clean? All sample items will be removed.")) {
      localStorage.removeItem("filora_luxe_expenses_v1");
      setExpenses([]);
      addToast("Local mock cache cleared.", "success");
    }
  };

  // Metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalExpenseSum = expenses.reduce((acc, e) => acc + (e.total || 0), 0);

  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const thisMonthExpenseSum = thisMonthExpenses.reduce((acc, e) => acc + (e.total || 0), 0);

  const paidExpenses = expenses.filter((e) => e.status === "paid");
  const paidExpenseSum = paidExpenses.reduce((acc, e) => acc + (e.amountPaid || e.total || 0), 0);

  const pendingExpenses = expenses.filter((e) => e.status === "pending" || e.status === "partially_paid");
  const pendingExpenseSum = pendingExpenses.reduce((acc, e) => acc + (e.balanceDue || (e.status === "pending" ? e.total : 0)), 0);

  const monthlyBudget = settings?.monthlyBudget || 50000;
  const budgetUsedPct = Math.min(100, Math.round((thisMonthExpenseSum / monthlyBudget) * 100));

  // Category Spend Breakdown
  const categorySpendMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + (e.total || 0);
  });

  // Filtered List
  const filteredExpenses = expenses.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.expenseNumber.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      (e.vendor?.name && e.vendor.name.toLowerCase().includes(q)) ||
      (e.referenceNumber && e.referenceNumber.toLowerCase().includes(q)) ||
      (e.notes && e.notes.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesMethod = methodFilter === "all" || e.paymentMethod === methodFilter;

    const expDate = new Date(e.date);
    const matchesStartDate = !startDate || expDate >= new Date(startDate);
    const matchesEndDate = !endDate || expDate <= new Date(endDate);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesMethod &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      try {
        await deleteExpense(id);
        setExpenses(expenses.filter((e) => e.id !== id));
        addToast("Expense record deleted", "success");
      } catch (err) {
        addToast("Failed to delete expense", "error");
      }
    }
  };

  const handleDuplicate = async (exp: Expense) => {
    try {
      const duplicated = await duplicateExpense(exp.id);
      if (duplicated) {
        setExpenses([duplicated, ...expenses]);
        addToast(`Duplicated into ${duplicated.expenseNumber}`, "success");
        router.push(`/admin/expenses/edit/${duplicated.id}`);
      }
    } catch (err) {
      addToast("Failed to duplicate expense", "error");
    }
  };

  const handleStatusChange = async (id: string, newStatus: ExpenseStatus) => {
    try {
      const updated = await updateExpenseStatus(id, newStatus);
      if (updated) {
        setExpenses(expenses.map((e) => (e.id === id ? updated : e)));
        addToast(`Expense ${updated.expenseNumber} status updated to ${newStatus}`, "success");
      }
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      addToast("No expenses to export", "error");
      return;
    }

    const headers = [
      "Expense Number",
      "Date",
      "Title",
      "Category",
      "Vendor",
      "Payment Method",
      "Status",
      "Subtotal",
      "Tax Rate %",
      "Tax Amount",
      "Total Amount",
      "Amount Paid",
      "Balance Due",
      "Ref / Bill No.",
      "Notes"
    ];

    const rows = filteredExpenses.map((e) => [
      `"${e.expenseNumber}"`,
      `"${e.date}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${(e.vendor?.name || '').replace(/"/g, '""')}"`,
      `"${e.paymentMethod}"`,
      `"${e.status}"`,
      e.subtotal,
      e.taxRate || 0,
      e.taxAmount || 0,
      e.total,
      e.amountPaid,
      e.balanceDue,
      `"${(e.referenceNumber || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `filora_luxe_expenses_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported expenses to CSV", "success");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-foreground">Business Expenses</h1>
            <span className="text-xs bg-rose/10 text-rose font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Finance & Accounts
            </span>
          </div>
          <p className="text-sm text-foreground/60 mt-1">
            Track and manage raw material purchases, packaging, marketing ads, couriers, and operational expenses.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleClearMockData}
            className="px-3 py-2 rounded-xl border border-secondary bg-white hover:bg-secondary/40 text-foreground/70 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            title="Remove any sample demo items"
          >
            Clear Sample Data
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-secondary bg-white hover:bg-secondary/40 text-foreground/80 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-foreground/60" /> Export CSV
          </button>

          <Link
            href="/admin/expenses/settings"
            className="p-2.5 rounded-xl border border-secondary bg-white hover:bg-secondary/40 text-foreground/70 transition-colors shadow-sm"
            title="Expense Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>

          <Link
            href="/admin/expenses/create"
            className="px-4 py-2.5 rounded-xl bg-rose text-white text-xs font-semibold hover:bg-rose/90 flex items-center gap-2 shadow-sm transition-all shadow-rose/20"
          >
            <Plus className="w-4 h-4" /> Log Expense
          </Link>
        </div>
      </div>

      {/* Supabase Table Setup Banner if not yet executed in Supabase */}
      {!dbTableExists && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">Live Supabase Database Setup Required</p>
              <p className="text-xs text-amber-700 mt-0.5">
                The <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">expenses</code> table is not yet created in your Supabase project. Run the 1-minute SQL script in Supabase to start saving all real records directly to your database.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shadow-sm shrink-0"
          >
            View & Copy SQL Script
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-secondary/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/60">Total All-Time Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose/10 text-rose flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-foreground">
              {formatPrice(totalExpenseSum)}
            </span>
            <p className="text-xs text-foreground/50 mt-1">{expenses.length} Total records logged</p>
          </div>
        </div>

        {/* This Month's Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-secondary/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/60">This Month Spending</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-foreground">
              {formatPrice(thisMonthExpenseSum)}
            </span>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px] text-foreground/60">
                <span>Monthly Budget: {formatPrice(monthlyBudget)}</span>
                <span className="font-semibold">{budgetUsedPct}%</span>
              </div>
              <div className="w-full bg-secondary/60 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsedPct > 90 ? "bg-red-500" : budgetUsedPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                  }`} 
                  style={{ width: `${budgetUsedPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paid Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-secondary/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/60">Cleared / Paid Out</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-emerald-700">
              {formatPrice(paidExpenseSum)}
            </span>
            <p className="text-xs text-foreground/50 mt-1">{paidExpenses.length} Cleared expenses</p>
          </div>
        </div>

        {/* Pending Due Payments */}
        <div className="bg-white p-5 rounded-2xl border border-secondary/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/60">Pending Payables Due</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-amber-700">
              {formatPrice(pendingExpenseSum)}
            </span>
            <p className="text-xs text-foreground/50 mt-1">{pendingExpenses.length} Bills awaiting clearance</p>
          </div>
        </div>
      </div>

      {/* Top Categories Pill Breakdown */}
      <div className="bg-white p-4 rounded-2xl border border-secondary/60 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-4 h-4 text-rose" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
            Category Spending Summary
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const sum = categorySpendMap[cat.key] || 0;
            const isSelected = categoryFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCategoryFilter(isSelected ? "all" : cat.key)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-rose text-white border-rose shadow-sm"
                    : `${cat.badgeBg} ${cat.badgeText} border-transparent hover:border-foreground/20`
                }`}
              >
                <span className="font-medium">{cat.label}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-white/60 font-semibold"}`}>
                  {formatPrice(sum)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-secondary/60 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by expense #, title, vendor, ref..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-secondary bg-secondary/10 text-xs focus:outline-none focus:ring-2 focus:ring-rose/30"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-secondary bg-white text-xs font-medium focus:ring-rose/30"
            >
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-secondary bg-white text-xs font-medium focus:ring-rose/30"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-secondary bg-white text-xs font-medium focus:ring-rose/30"
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Date Filter & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-secondary/40 text-xs text-foreground/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-foreground/50">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-secondary bg-white text-xs"
            />
            <span className="text-foreground/40">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-secondary bg-white text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <span>Showing <span className="font-semibold text-foreground">{filteredExpenses.length}</span> of {expenses.length} records</span>
            {(searchQuery || categoryFilter !== "all" || statusFilter !== "all" || methodFilter !== "all" || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                  setMethodFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-rose hover:underline font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-secondary/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-foreground/50">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose" />
            Loading business expenses...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 mx-auto text-foreground/30 stroke-[1.5]" />
            <h3 className="text-base font-semibold text-foreground">No Expense Records Found</h3>
            <p className="text-xs text-foreground/60 max-w-sm mx-auto">
              No expenses matched your search or filters. You can log raw materials, packaging, marketing ads, or other operational costs.
            </p>
            <Link
              href="/admin/expenses/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose text-white text-xs font-semibold hover:bg-rose/90 transition-colors mt-2"
            >
              <Plus className="w-4 h-4" /> Log First Expense
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-secondary/60 bg-secondary/15 text-foreground/70 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Voucher / Date</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Vendor / Payee</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/40">
                {filteredExpenses.map((exp) => {
                  const catMeta = EXPENSE_CATEGORIES.find((c) => c.key === exp.category) || {
                    label: exp.category,
                    badgeBg: "bg-gray-100",
                    badgeText: "text-gray-700"
                  };

                  return (
                    <tr key={exp.id} className="hover:bg-secondary/10 transition-colors">
                      {/* Voucher & Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-foreground block">
                          {exp.expenseNumber}
                        </span>
                        <span className="text-[11px] text-foreground/50 block">
                          {exp.date}
                        </span>
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-medium text-foreground block truncate">
                          {exp.title}
                        </span>
                        {exp.referenceNumber && (
                          <span className="text-[10px] font-mono text-foreground/60 block truncate">
                            Ref: {exp.referenceNumber}
                          </span>
                        )}
                        {exp.notes && (
                          <span className="text-[11px] text-foreground/50 block truncate">
                            {exp.notes}
                          </span>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${catMeta.badgeBg} ${catMeta.badgeText}`}>
                          {catMeta.label}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-foreground block">
                          {exp.vendor?.name || "—"}
                        </span>
                        {exp.vendor?.phone && (
                          <span className="text-[11px] text-foreground/50 block">
                            {exp.vendor.phone}
                          </span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              exp.status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : exp.status === "partially_paid"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {exp.status.replace("_", " ")}
                          </span>
                        </div>
                        <span className="text-[11px] text-foreground/60 uppercase">
                          {exp.paymentMethod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-sm text-foreground block">
                          {formatPrice(exp.total)}
                        </span>
                        {exp.taxEnabled && (
                          <span className="text-[10px] text-foreground/50 block">
                            Incl. {exp.taxRate}% GST
                          </span>
                        )}
                        {exp.status === "pending" && (
                          <span className="text-[10px] text-rose font-medium block">
                            Due: {formatPrice(exp.balanceDue || exp.total)}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedExpense(exp)}
                            className="p-1.5 text-foreground/60 hover:text-foreground hover:bg-secondary/40 rounded-lg transition-colors"
                            title="View Voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/admin/expenses/edit/${exp.id}`}
                            className="p-1.5 text-foreground/60 hover:text-rose hover:bg-rose/10 rounded-lg transition-colors"
                            title="Edit Expense"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDuplicate(exp)}
                            className="p-1.5 text-foreground/60 hover:text-foreground hover:bg-secondary/40 rounded-lg transition-colors"
                            title="Duplicate Expense"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1.5 text-rose/70 hover:text-rose hover:bg-rose/10 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Voucher Preview Modal */}
      <ExpenseModal
        expense={selectedExpense}
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        onEdit={(exp) => router.push(`/admin/expenses/edit/${exp.id}`)}
        onDuplicate={(exp) => handleDuplicate(exp)}
        onDelete={(id) => handleDelete(id)}
      />

      {/* Supabase Database Setup Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-secondary shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-secondary flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose" />
                <h3 className="font-serif font-bold text-base text-foreground">
                  Supabase Database Setup for Expenses
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 text-foreground/40 hover:text-foreground rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-secondary/30 rounded-xl space-y-1.5 text-foreground/80">
                <p className="font-semibold text-foreground">Follow these 2 simple steps to link your Supabase DB:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Open your{" "}
                    <a
                      href="https://supabase.com/dashboard/project/mpewokuvkijukarwcgci/sql/new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose font-semibold underline inline-flex items-center gap-1"
                    >
                      Supabase SQL Editor (mpewokuvkijukarwcgci) ↗
                    </a>
                  </li>
                  <li>Copy and paste the SQL script below, then click <strong>"Run"</strong>.</li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-mono text-[11px] text-foreground/60">supabase_expenses_setup.sql</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_EXPENSES_SQL);
                      setCopiedSql(true);
                      addToast("SQL Script copied to clipboard!", "success");
                      setTimeout(() => setCopiedSql(false), 3000);
                    }}
                    className="px-3 py-1.5 bg-rose text-white rounded-lg text-xs font-semibold hover:bg-rose/90 flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedSql ? "✓ Copied to Clipboard" : "Copy SQL Script"}
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto text-[11px] font-mono max-h-72 leading-relaxed">
                  {SUPABASE_EXPENSES_SQL}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-secondary bg-secondary/10 flex items-center justify-between">
              <span className="text-[11px] text-foreground/50">
                After running, all expenses will be stored directly in PostgreSQL.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await loadData();
                    setShowSqlModal(false);
                    addToast("Checked database connection", "success");
                  }}
                  className="px-4 py-2 bg-foreground text-white rounded-xl text-xs font-semibold hover:bg-foreground/90 transition-colors"
                >
                  I have run it (Refresh)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SUPABASE_EXPENSES_SQL = `-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS expense_settings (
  id text PRIMARY KEY DEFAULT 'default',
  prefix text NOT NULL DEFAULT 'EXP-',
  starting_number integer NOT NULL DEFAULT 1,
  monthly_budget numeric NOT NULL DEFAULT 50000,
  default_payment_method text NOT NULL DEFAULT 'upi',
  default_payment_status text NOT NULL DEFAULT 'paid',
  default_category text NOT NULL DEFAULT 'raw_materials',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE expense_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on expense_settings" ON expense_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow admin full access on expense_settings" ON expense_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TABLE IF NOT EXISTS expense_sequences (
  key text PRIMARY KEY,
  current_val integer NOT NULL DEFAULT 0
);

INSERT INTO expense_sequences (key, current_val)
VALUES ('expense_num', 0)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION get_next_expense_number(p_prefix text DEFAULT 'EXP-')
RETURNS text AS $$
DECLARE
  v_next_val integer;
  v_result text;
BEGIN
  UPDATE expense_sequences
  SET current_val = current_val + 1
  WHERE key = 'expense_num'
  RETURNING current_val INTO v_next_val;
  
  v_result := p_prefix || lpad(v_next_val::text, 4, '0');
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TABLE IF NOT EXISTS expenses (
  id text PRIMARY KEY,
  expense_number text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  
  subtotal numeric NOT NULL DEFAULT 0,
  tax_enabled boolean NOT NULL DEFAULT false,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  
  status text CHECK (status IN ('paid', 'pending', 'partially_paid')) NOT NULL DEFAULT 'paid',
  payment_method text NOT NULL DEFAULT 'upi',
  amount_paid numeric NOT NULL DEFAULT 0,
  balance_due numeric NOT NULL DEFAULT 0,
  reference_number text,
  
  vendor jsonb NOT NULL DEFAULT '{}'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  notes text,
  receipt_url text,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_expense_number ON expenses(expense_number);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to expenses" ON expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO expense_settings (id, prefix, starting_number, monthly_budget, default_payment_method, default_payment_status, default_category)
VALUES ('default', 'EXP-', 1, 50000, 'upi', 'paid', 'raw_materials')
ON CONFLICT (id) DO NOTHING;`;

