"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sliders, ShieldCheck, DollarSign, Layers } from "lucide-react";
import { ExpenseCategory, ExpensePaymentMethod, ExpenseSettings, ExpenseStatus, EXPENSE_CATEGORIES } from "@/types/expense";
import { fetchExpenseSettings, saveExpenseSettings, DEFAULT_EXPENSE_SETTINGS } from "@/lib/api/expenses";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/utils";

export default function ExpenseSettingsPage() {
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ExpenseSettings>(DEFAULT_EXPENSE_SETTINGS);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchExpenseSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.warn("Failed to load settings from DB:", err);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      await saveExpenseSettings(settings);
      addToast("Expense preferences and budget saved successfully", "success");
    } catch (err) {
      addToast("Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-secondary/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/expenses"
            className="p-2 border border-secondary rounded-xl hover:bg-secondary/40 text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">Expense Configuration</h1>
            <p className="text-xs text-foreground/60">
              Customize sequential numbering, monthly budget thresholds, and default preferences.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-rose text-white rounded-xl text-xs font-semibold hover:bg-rose/90 flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm shadow-rose/20"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Budget & Prefix Card */}
        <div className="bg-white p-6 rounded-2xl border border-secondary/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-secondary/40 pb-3">
            <DollarSign className="w-4 h-4 text-rose" />
            <h3 className="text-sm font-semibold text-foreground">Budget & Identifiers</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                Monthly Spending Budget Target (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-foreground/40 text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  value={settings.monthlyBudget}
                  onChange={(e) => setSettings({ ...settings, monthlyBudget: Number(e.target.value) })}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose/30"
                />
              </div>
              <p className="text-[11px] text-foreground/50 mt-1">
                Used to display spending progress bars and budget warnings on the expense dashboard.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                Expense Voucher Prefix
              </label>
              <input
                type="text"
                value={settings.prefix}
                onChange={(e) => setSettings({ ...settings, prefix: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose/30"
                placeholder="EXP-"
              />
              <p className="text-[11px] text-foreground/50 mt-1">
                E.g. EXP- will generate EXP-0001, EXP-0002...
              </p>
            </div>
          </div>
        </div>

        {/* Default Values Card */}
        <div className="bg-white p-6 rounded-2xl border border-secondary/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-secondary/40 pb-3">
            <Sliders className="w-4 h-4 text-rose" />
            <h3 className="text-sm font-semibold text-foreground">Default Logging Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                Default Category
              </label>
              <select
                value={settings.defaultCategory}
                onChange={(e) => setSettings({ ...settings, defaultCategory: e.target.value as ExpenseCategory })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30 font-medium"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                Default Payment Method
              </label>
              <select
                value={settings.defaultPaymentMethod}
                onChange={(e) => setSettings({ ...settings, defaultPaymentMethod: e.target.value as ExpensePaymentMethod })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30 font-medium"
              >
                <option value="upi">UPI (GPay / PhonePe)</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                Default Payment Status
              </label>
              <select
                value={settings.defaultPaymentStatus}
                onChange={(e) => setSettings({ ...settings, defaultPaymentStatus: e.target.value as ExpenseStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30 font-medium"
              >
                <option value="paid">Paid (Fully Cleared)</option>
                <option value="pending">Pending (To be paid)</option>
                <option value="partially_paid">Partially Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Reference Guide */}
        <div className="bg-white p-6 rounded-2xl border border-secondary/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-secondary/40 pb-3">
            <Layers className="w-4 h-4 text-rose" />
            <h3 className="text-sm font-semibold text-foreground">Active Expense Categories</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {EXPENSE_CATEGORIES.map((cat) => (
              <div key={cat.key} className="p-3 rounded-xl border border-secondary/40 bg-secondary/15 flex items-start justify-between gap-3">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${cat.badgeBg} ${cat.badgeText}`}>
                    {cat.label}
                  </span>
                  <p className="text-foreground/60 text-[11px] mt-1.5">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
