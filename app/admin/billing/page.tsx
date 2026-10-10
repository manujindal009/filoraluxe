"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Plus, Search, Filter, Eye, Edit, Download, Printer, Copy, Trash2, 
  FileText, CheckCircle, Clock, DollarSign, AlertCircle, RefreshCw, Share2, Settings as SettingsIcon 
} from "lucide-react";
import { Invoice, InvoiceStatus, PaymentMethod } from "@/types/invoice";
import { fetchInvoices, deleteInvoice, duplicateInvoice, updateInvoiceStatus } from "@/lib/api/invoices";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { InvoiceModal } from "@/components/admin/billing/InvoiceModal";
import { downloadInvoicePdf, printInvoice, shareInvoiceWhatsApp } from "@/lib/utils/pdf";

export default function AdminBillingDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const initialStatus = searchParams.get("status") || "all";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Selected Invoice for View Modal
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (err) {
      addToast("Failed to load invoices", "error");
    } fontally: {
      setLoading(false);
    }
  };

  // Sync tab and status from search params if updated
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const statusParam = searchParams.get("status");
    if (tabParam) setActiveTab(tabParam);
    if (statusParam) setStatusFilter(statusParam);
  }, [searchParams]);

  // Metrics Calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalInvoicesCount = invoices.length;
  const invoicesThisMonthCount = invoices.filter(i => {
    const d = new Date(i.createdAt || i.invoiceDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const paidInvoicesList = invoices.filter(i => i.status === "paid");
  const pendingInvoicesList = invoices.filter(i => i.status === "pending" || i.status === "partially_paid");
  const draftInvoicesList = invoices.filter(i => i.status === "draft");

  const totalRevenue = paidInvoicesList.reduce((acc, i) => acc + (i.total || 0), 0) +
    pendingInvoicesList.reduce((acc, i) => acc + (i.payment?.amountPaid || 0), 0);

  const pendingAmount = pendingInvoicesList.reduce((acc, i) => acc + (i.payment?.balanceDue ?? i.total ?? 0), 0);

  // Filtering Logic
  const filteredInvoices = invoices.filter((inv) => {
    // Search query
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.orderNumber && inv.orderNumber.toLowerCase().includes(q)) ||
      (inv.customer?.name && inv.customer.name.toLowerCase().includes(q)) ||
      (inv.customer?.email && inv.customer.email.toLowerCase().includes(q)) ||
      (inv.customer?.phone && inv.customer.phone.toLowerCase().includes(q));

    // Status filter
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

    // Method filter
    const matchesMethod = methodFilter === "all" || inv.payment?.method === methodFilter;

    // Date range filter
    const invDate = new Date(inv.invoiceDate);
    const matchesStartDate = !startDate || invDate >= new Date(startDate);
    const matchesEndDate = !endDate || invDate <= new Date(endDate);

    // Amount range filter
    const amt = inv.total || 0;
    const matchesMinAmount = !minAmount || amt >= Number(minAmount);
    const matchesMaxAmount = !maxAmount || amt <= Number(maxAmount);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesMethod &&
      matchesStartDate &&
      matchesEndDate &&
      matchesMinAmount &&
      matchesMaxAmount
    );
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      try {
        await deleteInvoice(id);
        setInvoices(invoices.filter(i => i.id !== id));
        addToast("Invoice deleted successfully", "success");
      } catch (err) {
        addToast("Failed to delete invoice", "error");
      }
    }
  };

  const handleDuplicate = async (invoice: Invoice) => {
    try {
      const duplicated = await duplicateInvoice(invoice.id);
      if (duplicated) {
        setInvoices([duplicated, ...invoices]);
        addToast(`Duplicated into draft invoice ${duplicated.invoiceNumber}`, "success");
        router.push(`/admin/billing/edit/${duplicated.id}`);
      }
    } catch (err) {
      addToast("Failed to duplicate invoice", "error");
    }
  };

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    try {
      const updated = await updateInvoiceStatus(id, newStatus);
      if (updated) {
        setInvoices(invoices.map(i => i.id === id ? updated : i));
        addToast(`Invoice ${updated.invoiceNumber} status changed to ${newStatus}`, "success");
      }
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  return (
    <div className="space-y-8 w-full text-foreground">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Invoice & Billing Management</h1>
          <p className="text-xs text-foreground/60 mt-1">
            Manage handmade crochet order invoices, revenue, draft invoices, and settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/billing/settings"
            className="px-3.5 py-2 border border-secondary bg-white hover:bg-secondary/50 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <SettingsIcon className="w-4 h-4 text-foreground/60" />
            Invoice Settings
          </Link>

          <Link
            href="/admin/billing/create"
            className="px-4 py-2 bg-rose text-white hover:bg-rose/90 rounded-xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-secondary overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "dashboard", label: "Billing Dashboard" },
          { id: "all", label: `All Invoices (${totalInvoicesCount})` },
          { id: "draft", label: `Draft Invoices (${draftInvoicesList.length})` },
          { id: "paid", label: `Paid Invoices (${paidInvoicesList.length})` },
          { id: "pending", label: `Pending Invoices (${pendingInvoicesList.length})` },
        ].map((tab) => {
          const isActive =
            activeTab === tab.id || (activeTab === "invoices" && statusFilter === tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id === "dashboard" ? "dashboard" : "invoices");
                if (tab.id !== "dashboard") {
                  setStatusFilter(tab.id);
                } else {
                  setStatusFilter("all");
                }
              }}
              className={`px-4 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                isActive
                  ? "border-rose text-rose font-semibold bg-rose/5"
                  : "border-transparent text-foreground/70 hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-secondary shadow-sm space-y-1">
          <span className="text-[11px] font-medium text-foreground/50 uppercase tracking-wider">
            Total Invoices
          </span>
          <p className="text-2xl font-serif font-bold text-foreground">{totalInvoicesCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-secondary shadow-sm space-y-1">
          <span className="text-[11px] font-medium text-foreground/50 uppercase tracking-wider">
            This Month
          </span>
          <p className="text-2xl font-serif font-bold text-foreground">{invoicesThisMonthCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-secondary shadow-sm space-y-1">
          <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">
            Paid Invoices
          </span>
          <p className="text-2xl font-serif font-bold text-emerald-700">
            {paidInvoicesList.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-secondary shadow-sm space-y-1">
          <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">
            Pending Invoices
          </span>
          <p className="text-2xl font-serif font-bold text-amber-700">
            {pendingInvoicesList.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-secondary shadow-sm space-y-1">
          <span className="text-[11px] font-medium text-foreground/50 uppercase tracking-wider">
            Total Revenue
          </span>
          <p className="text-xl font-serif font-bold text-rose">{formatPrice(totalRevenue)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-secondary shadow-sm space-y-1">
          <span className="text-[11px] font-medium text-rose uppercase tracking-wider">
            Pending Amount
          </span>
          <p className="text-xl font-serif font-bold text-foreground/80">
            {formatPrice(pendingAmount)}
          </p>
        </div>
      </div>

      {/* Main Table & Filter Container */}
      <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden flex flex-col w-full">
        {/* Search and Filters Toolbar */}
        <div className="p-4 border-b border-secondary space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                type="text"
                placeholder="Search invoice #, order #, customer, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-secondary rounded-lg text-xs focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose bg-white"
              />
            </div>

            {/* Quick Status Pill Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {["all", "draft", "pending", "paid", "partially_paid", "refunded", "cancelled"].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                      statusFilter === st
                        ? "bg-rose text-white"
                        : "bg-secondary/40 text-foreground/70 hover:bg-secondary"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-secondary/50 text-xs">
            <div>
              <label className="block text-[10px] font-medium text-foreground/50 mb-1">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full border border-secondary rounded-md px-2 py-1 bg-white text-xs"
              >
                <option value="all">All Methods</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cod">COD</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-foreground/50 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-secondary rounded-md px-2 py-1 bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-foreground/50 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-secondary rounded-md px-2 py-1 bg-white text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-foreground/50 mb-1">
                  Min ₹
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full border border-secondary rounded-md px-2 py-1 bg-white text-xs"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-foreground/50 mb-1">
                  Max ₹
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full border border-secondary rounded-md px-2 py-1 bg-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[850px]">
            <thead className="bg-secondary/30 uppercase font-semibold text-foreground/60 border-b border-secondary">
              <tr>
                <th className="px-5 py-3">Invoice No.</th>
                <th className="px-5 py-3">Order No.</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Payment Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-foreground/50">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose" />
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-foreground/50 space-y-2">
                    <p className="font-serif font-semibold text-base text-foreground">
                      No invoices found
                    </p>
                    <p className="text-xs text-foreground/50">
                      Try adjusting your search criteria or create a new invoice.
                    </p>
                    <Link
                      href="/admin/billing/create"
                      className="inline-block mt-2 px-4 py-2 bg-rose text-white rounded-lg text-xs font-medium"
                    >
                      + Create Invoice
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-foreground">
                      <button
                        onClick={() => setViewInvoice(inv)}
                        className="text-rose hover:underline font-bold"
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-5 py-4 font-mono text-foreground/70">
                      {inv.orderNumber || inv.orderId || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {inv.customer?.name || "Guest Customer"}
                        </span>
                        <span className="text-[11px] text-foreground/50">
                          {inv.customer?.email || inv.customer?.phone || ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground/70">
                      {inv.invoiceDate
                        ? new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right font-serif font-bold text-foreground">
                      {formatPrice(inv.total)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={inv.status}
                          onChange={(e) =>
                            handleStatusChange(inv.id, e.target.value as InvoiceStatus)
                          }
                          className={`appearance-none border text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 focus:outline-none cursor-pointer ${
                            inv.status === "paid"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                              : inv.status === "partially_paid"
                              ? "bg-amber-100 text-amber-700 border-amber-300"
                              : inv.status === "draft"
                              ? "bg-secondary text-foreground/60 border-secondary"
                              : "bg-blue-100 text-blue-700 border-blue-300"
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="partially_paid">Partial</option>
                          <option value="refunded">Refunded</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => handleStatusChange(inv.id, inv.status === "paid" ? "pending" : "paid")}
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                            inv.status === "paid" 
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200" 
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                          title={inv.status === "paid" ? "Mark as Pending" : "Mark as Paid"}
                        >
                          {inv.status === "paid" ? "Mark Pending" : "✓ Mark Paid"}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="p-1.5 text-foreground/70 hover:text-foreground hover:bg-secondary/50 rounded"
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/admin/billing/edit/${inv.id}`}
                          className="p-1.5 text-foreground/70 hover:text-rose hover:bg-secondary/50 rounded"
                          title="Edit Invoice"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => downloadInvoicePdf("invoice-template-printable", `${inv.invoiceNumber}.pdf`)}
                          className="p-1.5 text-foreground/70 hover:text-foreground hover:bg-secondary/50 rounded"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(inv)}
                          className="p-1.5 text-foreground/70 hover:text-foreground hover:bg-secondary/50 rounded"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            shareInvoiceWhatsApp(
                              inv.customer?.name || "",
                              inv.invoiceNumber,
                              inv.total,
                              inv.shareToken || inv.invoiceNumber || inv.id,
                              inv.customer?.phone
                            )
                          }
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-rose/70 hover:text-rose hover:bg-rose/10 rounded"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice View Modal */}
      <InvoiceModal
        invoice={viewInvoice}
        isOpen={Boolean(viewInvoice)}
        onClose={() => setViewInvoice(null)}
        onEdit={(inv) => router.push(`/admin/billing/edit/${inv.id}`)}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </div>
  );
}
