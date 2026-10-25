"use client";

import React, { useState } from "react";
import { Plus, Trash2, Sparkles, Building, DollarSign, FileText, CheckCircle2 } from "lucide-react";
import { Expense, ExpenseCategory, ExpenseItem, ExpensePaymentMethod, ExpenseStatus, EXPENSE_CATEGORIES } from "@/types/expense";

interface ExpenseFormProps {
  expense: Partial<Expense>;
  onChange: (updated: Partial<Expense>) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onChange }) => {
  const [isItemized, setIsItemized] = useState<boolean>(
    Boolean(expense.items && expense.items.length > 0)
  );

  const presets = [
    { title: "Yarn & Raw Material Restock", category: "raw_materials" as ExpenseCategory },
    { title: "Rigid Packaging Boxes & Ribbons", category: "packaging" as ExpenseCategory },
    { title: "Courier Shipping Wallet Recharge", category: "shipping_logistics" as ExpenseCategory },
    { title: "Instagram & Meta Ads Campaign", category: "marketing_ads" as ExpenseCategory },
    { title: "Crochet Hooks & Tools", category: "tools_equipment" as ExpenseCategory },
    { title: "Artisan Wages & Production Help", category: "salaries_wages" as ExpenseCategory },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    onChange({
      ...expense,
      title: preset.title,
      category: preset.category
    });
  };

  const handleSubtotalChange = (val: number) => {
    const taxRate = expense.taxEnabled ? (expense.taxRate || 0) : 0;
    const taxAmount = (val * taxRate) / 100;
    const total = val + taxAmount;
    
    let amountPaid = expense.amountPaid ?? total;
    let balanceDue = expense.balanceDue ?? 0;
    if (expense.status === "paid") {
      amountPaid = total;
      balanceDue = 0;
    } else if (expense.status === "pending") {
      amountPaid = 0;
      balanceDue = total;
    }

    onChange({
      ...expense,
      subtotal: val,
      taxAmount,
      total,
      amountPaid,
      balanceDue
    });
  };

  const handleTaxToggle = (enabled: boolean) => {
    const rate = enabled ? (expense.taxRate || 18) : 0;
    const subtotal = expense.subtotal || 0;
    const taxAmount = enabled ? (subtotal * rate) / 100 : 0;
    const total = subtotal + taxAmount;

    let amountPaid = expense.amountPaid ?? total;
    let balanceDue = expense.balanceDue ?? 0;
    if (expense.status === "paid") {
      amountPaid = total;
      balanceDue = 0;
    } else if (expense.status === "pending") {
      amountPaid = 0;
      balanceDue = total;
    }

    onChange({
      ...expense,
      taxEnabled: enabled,
      taxRate: rate,
      taxAmount,
      total,
      amountPaid,
      balanceDue
    });
  };

  const handleTaxRateChange = (rate: number) => {
    const subtotal = expense.subtotal || 0;
    const taxAmount = (subtotal * rate) / 100;
    const total = subtotal + taxAmount;

    let amountPaid = expense.amountPaid ?? total;
    let balanceDue = expense.balanceDue ?? 0;
    if (expense.status === "paid") {
      amountPaid = total;
      balanceDue = 0;
    } else if (expense.status === "pending") {
      amountPaid = 0;
      balanceDue = total;
    }

    onChange({
      ...expense,
      taxRate: rate,
      taxAmount,
      total,
      amountPaid,
      balanceDue
    });
  };

  const handleStatusChange = (status: ExpenseStatus) => {
    const total = expense.total || 0;
    let amountPaid = expense.amountPaid ?? 0;
    let balanceDue = expense.balanceDue ?? 0;

    if (status === "paid") {
      amountPaid = total;
      balanceDue = 0;
    } else if (status === "pending") {
      amountPaid = 0;
      balanceDue = total;
    }

    onChange({
      ...expense,
      status,
      amountPaid,
      balanceDue
    });
  };

  // Itemized items handlers
  const handleAddItem = () => {
    const newItem: ExpenseItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    const newItems = [...(expense.items || []), newItem];
    recalculateFromItems(newItems);
  };

  const handleUpdateItem = (index: number, field: keyof ExpenseItem, value: any) => {
    const newItems = [...(expense.items || [])];
    const current = { ...newItems[index] };

    if (field === "quantity" || field === "unitPrice") {
      const numVal = Math.max(0, Number(value));
      (current as any)[field] = numVal;
      current.amount = current.quantity * current.unitPrice;
    } else {
      (current as any)[field] = value;
    }

    newItems[index] = current;
    recalculateFromItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = (expense.items || []).filter((_, i) => i !== index);
    recalculateFromItems(newItems);
  };

  const recalculateFromItems = (items: ExpenseItem[]) => {
    const subtotal = items.reduce((acc, it) => acc + (it.amount || 0), 0);
    const taxRate = expense.taxEnabled ? (expense.taxRate || 0) : 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    let amountPaid = expense.amountPaid ?? total;
    let balanceDue = expense.balanceDue ?? 0;
    if (expense.status === "paid") {
      amountPaid = total;
      balanceDue = 0;
    } else if (expense.status === "pending") {
      amountPaid = 0;
      balanceDue = total;
    }

    onChange({
      ...expense,
      items,
      subtotal,
      taxAmount,
      total,
      amountPaid,
      balanceDue
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="bg-white p-5 rounded-2xl border border-secondary/60 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-rose" />
          <h3 className="text-sm font-semibold text-foreground">Quick Presets</h3>
          <span className="text-xs text-foreground/50">(Click to auto-fill common expense details)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-lg border border-secondary/80 bg-secondary/20 hover:bg-rose/10 hover:border-rose/30 hover:text-rose transition-colors"
            >
              + {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Expense Details */}
      <div className="bg-white p-6 rounded-2xl border border-secondary/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-secondary/40 pb-3">
          <FileText className="w-4 h-4 text-rose" />
          <h3 className="text-sm font-semibold text-foreground">Expense Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">
              Expense Voucher No. <span className="text-rose">*</span>
            </label>
            <input
              type="text"
              value={expense.expenseNumber || ""}
              onChange={(e) => onChange({ ...expense, expenseNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-secondary/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose/30"
              placeholder="EXP-0001"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">
              Expense Category <span className="text-rose">*</span>
            </label>
            <select
              value={expense.category || "raw_materials"}
              onChange={(e) => onChange({ ...expense, category: e.target.value as ExpenseCategory })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30 font-medium"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">
              Expense Date <span className="text-rose">*</span>
            </label>
            <input
              type="date"
              value={expense.date || new Date().toISOString().split("T")[0]}
              onChange={(e) => onChange({ ...expense, date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground/70 mb-1.5">
            Expense Title / Description <span className="text-rose">*</span>
          </label>
          <input
            type="text"
            value={expense.title || ""}
            onChange={(e) => onChange({ ...expense, title: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
            placeholder="e.g. 10x Vardhman Milk Cotton Yarn Cones (Ivory & Sage)"
          />
        </div>
      </div>

      {/* Amount & Items Section */}
      <div className="bg-white p-6 rounded-2xl border border-secondary/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-secondary/40 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-rose" />
            <h3 className="text-sm font-semibold text-foreground">Expense Amount & Items</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              const toggle = !isItemized;
              setIsItemized(toggle);
              if (toggle && (!expense.items || expense.items.length === 0)) {
                handleAddItem();
              }
            }}
            className="text-xs px-3 py-1 rounded-lg border border-secondary bg-secondary/20 hover:bg-secondary/40 text-foreground/70 transition-colors"
          >
            {isItemized ? "Switch to Simple Amount" : "+ Add Itemized Breakdown"}
          </button>
        </div>

        {isItemized ? (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-secondary/60 text-foreground/60 text-left">
                    <th className="py-2 px-2 font-medium">Item Description</th>
                    <th className="py-2 px-2 font-medium w-20 text-center">Qty</th>
                    <th className="py-2 px-2 font-medium w-28 text-right">Unit Price (₹)</th>
                    <th className="py-2 px-2 font-medium w-28 text-right">Total (₹)</th>
                    <th className="py-2 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/40">
                  {(expense.items || []).map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(idx, "name", e.target.value)}
                          placeholder="Item name / specification"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-secondary bg-white text-xs focus:ring-1 focus:ring-rose/30"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, "quantity", e.target.value)}
                          className="w-16 px-2 py-1.5 text-center rounded-lg border border-secondary bg-white text-xs focus:ring-1 focus:ring-rose/30"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, "unitPrice", e.target.value)}
                          className="w-24 px-2 py-1.5 text-right rounded-lg border border-secondary bg-white text-xs focus:ring-1 focus:ring-rose/30"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-foreground">
                        ₹{(item.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-rose/70 hover:text-rose hover:bg-rose/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-secondary bg-secondary/10 hover:bg-secondary/30 flex items-center gap-1.5 text-foreground/70"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Item
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">
              Expense Subtotal (₹) <span className="text-rose">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-foreground/40 font-medium text-sm">₹</span>
              <input
                type="number"
                min="0"
                value={expense.subtotal || ""}
                onChange={(e) => handleSubtotalChange(Number(e.target.value))}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose/30"
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {/* GST / Tax Toggle */}
        <div className="p-4 rounded-xl bg-secondary/20 border border-secondary/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="taxToggle"
                checked={expense.taxEnabled || false}
                onChange={(e) => handleTaxToggle(e.target.checked)}
                className="rounded border-secondary text-rose focus:ring-rose"
              />
              <label htmlFor="taxToggle" className="text-xs font-semibold text-foreground cursor-pointer">
                Include GST / Tax on this Expense
              </label>
            </div>

            {expense.taxEnabled && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/60">GST Rate:</span>
                <select
                  value={expense.taxRate || 18}
                  onChange={(e) => handleTaxRateChange(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs rounded-lg border border-secondary bg-white focus:ring-rose font-medium"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5% (Yarn / Raw Handloom)</option>
                  <option value={12}>12% (Packaging / Ready Goods)</option>
                  <option value={18}>18% (Services / Ads / Courier)</option>
                  <option value={28}>28% (Luxury / Specific)</option>
                </select>
              </div>
            )}
          </div>

          {expense.taxEnabled && (
            <div className="flex justify-between items-center text-xs text-foreground/70 pt-2 border-t border-secondary/30">
              <span>Calculated GST Amount:</span>
              <span className="font-semibold text-foreground">₹{(expense.taxAmount || 0).toLocaleString("en-IN")}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm font-bold text-foreground pt-2 border-t border-secondary/50">
            <span>Total Expense Amount:</span>
            <span className="text-rose text-base font-serif">₹{(expense.total || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white p-6 rounded-2xl border border-secondary/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-secondary/40 pb-3">
          <CheckCircle2 className="w-4 h-4 text-rose" />
          <h3 className="text-sm font-semibold text-foreground">Payment Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">
              Payment Status <span className="text-rose">*</span>
            </label>
            <select
              value={expense.status || "paid"}
              onChange={(e) => handleStatusChange(e.target.value as ExpenseStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30 font-medium"
            >
              <option value="paid">Paid (Fully Cleared)</option>
              <option value="pending">Pending (To be Paid)</option>
              <option value="partially_paid">Partially Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">
              Payment Method
            </label>
            <select
              value={expense.paymentMethod || "upi"}
              onChange={(e) => onChange({ ...expense, paymentMethod: e.target.value as ExpensePaymentMethod })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30 font-medium"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
              <option value="card">Credit / Debit Card</option>
              <option value="cash">Cash in Hand</option>
              <option value="other">Other Mode</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">
              Ref No. / UTR / Vendor Bill No.
            </label>
            <input
              type="text"
              value={expense.referenceNumber || ""}
              onChange={(e) => onChange({ ...expense, referenceNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose/30"
              placeholder="e.g. UPI/508492019482"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">
              Amount Paid (₹)
            </label>
            <input
              type="number"
              min="0"
              value={expense.amountPaid ?? 0}
              onChange={(e) => {
                const paid = Number(e.target.value);
                const total = expense.total || 0;
                onChange({
                  ...expense,
                  amountPaid: paid,
                  balanceDue: Math.max(0, total - paid)
                });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">
              Balance Due (₹)
            </label>
            <input
              type="number"
              min="0"
              value={expense.balanceDue ?? 0}
              onChange={(e) => onChange({ ...expense, balanceDue: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
            />
          </div>
        </div>
      </div>

      {/* Vendor Details */}
      <div className="bg-white p-6 rounded-2xl border border-secondary/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-secondary/40 pb-3">
          <Building className="w-4 h-4 text-rose" />
          <h3 className="text-sm font-semibold text-foreground">Vendor / Payee Details (Optional)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">Vendor / Payee Name</label>
            <input
              type="text"
              value={expense.vendor?.name || ""}
              onChange={(e) =>
                onChange({
                  ...expense,
                  vendor: { ...(expense.vendor || { name: "" }), name: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
              placeholder="e.g. Vardhman Textiles Ltd"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">Vendor Contact / Phone</label>
            <input
              type="text"
              value={expense.vendor?.phone || ""}
              onChange={(e) =>
                onChange({
                  ...expense,
                  vendor: { ...(expense.vendor || { name: "" }), phone: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">Vendor GSTIN</label>
            <input
              type="text"
              value={expense.vendor?.gstin || ""}
              onChange={(e) =>
                onChange({
                  ...expense,
                  vendor: { ...(expense.vendor || { name: "" }), gstin: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-rose/30"
              placeholder="03AAACV0123M1Z8"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1.5">Vendor City / Address</label>
            <input
              type="text"
              value={expense.vendor?.address || ""}
              onChange={(e) =>
                onChange({
                  ...expense,
                  vendor: { ...(expense.vendor || { name: "" }), address: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
              placeholder="e.g. Ludhiana, Punjab"
            />
          </div>
        </div>
      </div>

      {/* Notes & Receipt Attachment */}
      <div className="bg-white p-6 rounded-2xl border border-secondary/60 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-secondary/40 pb-3">
          Additional Remarks & Attachments
        </h3>

        <div>
          <label className="block text-xs font-medium text-foreground/70 mb-1.5">Notes / Purpose of Expense</label>
          <textarea
            rows={3}
            value={expense.notes || ""}
            onChange={(e) => onChange({ ...expense, notes: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
            placeholder="Add any internal comments, purpose, or batch details..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground/70 mb-1.5">
            Receipt / Bill URL or Document Link
          </label>
          <input
            type="text"
            value={expense.receiptUrl || ""}
            onChange={(e) => onChange({ ...expense, receiptUrl: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
            placeholder="https://drive.google.com/... or bill reference link"
          />
        </div>
      </div>
    </div>
  );
};
