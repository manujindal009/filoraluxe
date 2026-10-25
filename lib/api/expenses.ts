import { supabase } from "@/lib/supabaseClient";
import { Expense, ExpenseSettings, ExpenseStatus } from "@/types/expense";

export const DEFAULT_EXPENSE_SETTINGS: ExpenseSettings = {
  id: "default",
  prefix: "EXP-",
  startingNumber: 1,
  monthlyBudget: 50000,
  defaultPaymentMethod: "upi",
  defaultPaymentStatus: "paid",
  defaultCategory: "raw_materials",
  updatedAt: new Date().toISOString()
};

const LOCAL_STORAGE_KEY_EXPENSES = "filora_luxe_expenses_v1";
const LOCAL_STORAGE_KEY_EXPENSE_SETTINGS = "filora_luxe_expense_settings_v1";

// Helper for local storage access
function getLocalExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse local expenses:", err);
    return [];
  }
}

function setLocalExpenses(expenses: Expense[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error("Failed to save local expenses:", err);
  }
}

// ----------------------------------------------------
// EXPENSE SETTINGS API
// ----------------------------------------------------
export async function fetchExpenseSettings(): Promise<ExpenseSettings> {
  try {
    const { data, error } = await supabase
      .from("expense_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (!error && data) {
      return {
        id: data.id,
        prefix: data.prefix || DEFAULT_EXPENSE_SETTINGS.prefix,
        startingNumber: data.starting_number ?? DEFAULT_EXPENSE_SETTINGS.startingNumber,
        monthlyBudget: Number(data.monthly_budget ?? DEFAULT_EXPENSE_SETTINGS.monthlyBudget),
        defaultPaymentMethod: data.default_payment_method || DEFAULT_EXPENSE_SETTINGS.defaultPaymentMethod,
        defaultPaymentStatus: data.default_payment_status || DEFAULT_EXPENSE_SETTINGS.defaultPaymentStatus,
        defaultCategory: data.default_category || DEFAULT_EXPENSE_SETTINGS.defaultCategory,
        updatedAt: data.updated_at || new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn("[fetchExpenseSettings] DB query error, using local fallback:", err);
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSE_SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Local settings error:", e);
    }
  }

  return DEFAULT_EXPENSE_SETTINGS;
}

export async function saveExpenseSettings(settings: ExpenseSettings): Promise<ExpenseSettings> {
  const updated = {
    ...settings,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSE_SETTINGS, JSON.stringify(updated));
  }

  try {
    const { error } = await supabase.from("expense_settings").upsert({
      id: "default",
      prefix: updated.prefix,
      starting_number: updated.startingNumber,
      monthly_budget: updated.monthlyBudget,
      default_payment_method: updated.defaultPaymentMethod,
      default_payment_status: updated.defaultPaymentStatus,
      default_category: updated.defaultCategory,
      updated_at: updated.updatedAt
    });

    if (error) {
      console.warn("[saveExpenseSettings] DB upsert warning:", error.message);
    }
  } catch (err) {
    console.warn("[saveExpenseSettings] DB call exception:", err);
  }

  return updated;
}

// ----------------------------------------------------
// SEQUENTIAL NUMBER GENERATOR
// Automatically finds the highest existing expense number (e.g. 76)
// and returns the next sequential number (e.g. 77 -> EXP-0077)
// ----------------------------------------------------
export async function getNextExpenseNumber(prefix: string = "EXP-"): Promise<string> {
  let maxSeq = 0;

  // 1. Check all existing expenses in Supabase database
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("expense_number");

    if (!error && data && data.length > 0) {
      data.forEach((row: any) => {
        if (row.expense_number) {
          const numPart = String(row.expense_number).replace(/[^0-9]/g, "");
          if (numPart) {
            const val = parseInt(numPart, 10);
            if (!isNaN(val) && val > maxSeq) {
              maxSeq = val;
            }
          }
        }
      });
    }
  } catch (err) {
    console.warn("[getNextExpenseNumber] Supabase query warning:", err);
  }

  // 2. Also check local storage in case of unsynced offline records
  const localList = getLocalExpenses();
  localList.forEach((item) => {
    if (item.expenseNumber) {
      const numPart = String(item.expenseNumber).replace(/[^0-9]/g, "");
      if (numPart) {
        const val = parseInt(numPart, 10);
        if (!isNaN(val) && val > maxSeq) {
          maxSeq = val;
        }
      }
    }
  });

  // 3. Next sequential number = (Highest existing number) + 1
  // If max is 76 -> next is 77 (EXP-0077)
  // If database is empty (max is 0) -> next is startingNumber (EXP-0001)
  const nextSeq = maxSeq > 0 ? maxSeq + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

// ----------------------------------------------------
// EXPENSE CRUD OPERATIONS
// ----------------------------------------------------
export async function checkExpenseTableStatus(): Promise<{ tableExists: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("expenses").select("id").limit(1);
    if (error && (error.message.includes("does not exist") || error.message.includes("schema cache"))) {
      return { tableExists: false, error: error.message };
    }
    return { tableExists: true };
  } catch {
    return { tableExists: true };
  }
}

export async function fetchExpenses(): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (!error && data) {
      const dbExpenses = data.map((row: any) => mapRowToExpense(row));
      
      // Merge with local expenses if any exist
      const localExpenses = getLocalExpenses();
      const map = new Map<string, Expense>();
      dbExpenses.forEach((e) => map.set(e.id, e));
      localExpenses.forEach((e) => {
        if (!map.has(e.id)) map.set(e.id, e);
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setLocalExpenses(merged);
      return merged;
    }
  } catch (err) {
    console.warn("[fetchExpenses] DB query failed, falling back to local storage:", err);
  }

  return getLocalExpenses();
}

export async function fetchExpenseById(idOrNumber: string): Promise<Expense | null> {
  if (!idOrNumber) return null;

  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .or(`id.eq.${idOrNumber},expense_number.eq.${idOrNumber}`)
      .single();

    if (!error && data) {
      return mapRowToExpense(data);
    }
  } catch (err) {
    console.warn(`[fetchExpenseById] DB query failed for ${idOrNumber}:`, err);
  }

  const local = getLocalExpenses();
  return local.find((e) => e.id === idOrNumber || e.expenseNumber === idOrNumber) || null;
}

export async function saveExpense(expenseData: Partial<Expense>): Promise<Expense> {
  const settings = await fetchExpenseSettings();
  const now = new Date().toISOString();

  const id = expenseData.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const expenseNumber = expenseData.expenseNumber || (await getNextExpenseNumber(settings.prefix));

  const subtotal = Number(expenseData.subtotal ?? 0);
  const taxEnabled = Boolean(expenseData.taxEnabled);
  const taxRate = Number(expenseData.taxRate ?? 0);
  const taxAmount = taxEnabled ? (subtotal * taxRate) / 100 : 0;
  const total = Number(expenseData.total ?? subtotal + taxAmount);

  const status = expenseData.status || settings.defaultPaymentStatus;
  let amountPaid = Number(expenseData.amountPaid ?? 0);
  let balanceDue = Number(expenseData.balanceDue ?? 0);

  if (status === "paid" && amountPaid === 0) {
    amountPaid = total;
    balanceDue = 0;
  } else if (status === "pending" && balanceDue === 0) {
    balanceDue = total;
    amountPaid = 0;
  }

  const finalExpense: Expense = {
    id,
    expenseNumber,
    title: expenseData.title?.trim() || "Business Expense",
    category: expenseData.category || settings.defaultCategory,
    date: expenseData.date || new Date().toISOString().split("T")[0],

    subtotal,
    taxEnabled,
    taxRate,
    taxAmount,
    total,

    status,
    paymentMethod: expenseData.paymentMethod || settings.defaultPaymentMethod,
    amountPaid,
    balanceDue,
    referenceNumber: expenseData.referenceNumber || "",

    vendor: expenseData.vendor || {
      name: "",
      phone: "",
      email: "",
      gstin: "",
      address: ""
    },
    items: expenseData.items || [],
    notes: expenseData.notes || "",
    receiptUrl: expenseData.receiptUrl || "",

    createdAt: expenseData.createdAt || now,
    updatedAt: now
  };

  // Save to local storage first
  const localList = getLocalExpenses();
  const existingIdx = localList.findIndex((e) => e.id === id);
  if (existingIdx >= 0) {
    localList[existingIdx] = finalExpense;
  } else {
    localList.unshift(finalExpense);
  }
  setLocalExpenses(localList);

  // Sync with Supabase
  try {
    const payload = mapExpenseToRow(finalExpense);
    const { error } = await supabase.from("expenses").upsert(payload);
    if (error) {
      console.warn("[saveExpense] DB upsert warning:", error.message);
    }
  } catch (err) {
    console.warn("[saveExpense] DB call exception:", err);
  }

  return finalExpense;
}

export async function updateExpenseStatus(id: string, status: ExpenseStatus): Promise<Expense | null> {
  const existing = await fetchExpenseById(id);
  if (!existing) return null;

  let amountPaid = existing.amountPaid;
  let balanceDue = existing.balanceDue;

  if (status === "paid") {
    amountPaid = existing.total;
    balanceDue = 0;
  } else if (status === "pending") {
    amountPaid = 0;
    balanceDue = existing.total;
  }

  const updated: Expense = {
    ...existing,
    status,
    amountPaid,
    balanceDue,
    updatedAt: new Date().toISOString()
  };

  return await saveExpense(updated);
}

export async function duplicateExpense(id: string): Promise<Expense | null> {
  const existing = await fetchExpenseById(id);
  if (!existing) return null;

  const settings = await fetchExpenseSettings();
  const nextNum = await getNextExpenseNumber(settings.prefix);
  const now = new Date().toISOString();

  const duplicated: Partial<Expense> = {
    ...existing,
    id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    expenseNumber: nextNum,
    title: `${existing.title} (Copy)`,
    date: new Date().toISOString().split("T")[0],
    createdAt: now,
    updatedAt: now
  };

  return await saveExpense(duplicated);
}

export async function deleteExpense(id: string): Promise<boolean> {
  const local = getLocalExpenses().filter((e) => e.id !== id);
  setLocalExpenses(local);

  try {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      console.warn("[deleteExpense] DB delete warning:", error.message);
    }
  } catch (err) {
    console.warn("[deleteExpense] DB delete exception:", err);
  }

  return true;
}

// ----------------------------------------------------
// ROW CONVERTERS (DB Snake Case <-> App Camel Case)
// ----------------------------------------------------
function mapRowToExpense(row: any): Expense {
  return {
    id: row.id,
    expenseNumber: row.expense_number,
    title: row.title,
    category: row.category,
    date: row.date,

    subtotal: Number(row.subtotal || 0),
    taxEnabled: Boolean(row.tax_enabled),
    taxRate: Number(row.tax_rate || 0),
    taxAmount: Number(row.tax_amount || 0),
    total: Number(row.total || 0),

    status: row.status,
    paymentMethod: row.payment_method,
    amountPaid: Number(row.amount_paid || 0),
    balanceDue: Number(row.balance_due || 0),
    referenceNumber: row.reference_number || "",

    vendor: row.vendor || {
      name: "",
      phone: "",
      email: "",
      gstin: "",
      address: ""
    },
    items: Array.isArray(row.items) ? row.items : [],
    notes: row.notes || "",
    receiptUrl: row.receipt_url || "",

    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapExpenseToRow(exp: Expense): any {
  return {
    id: exp.id,
    expense_number: exp.expenseNumber,
    title: exp.title,
    category: exp.category,
    date: exp.date,

    subtotal: exp.subtotal,
    tax_enabled: exp.taxEnabled,
    tax_rate: exp.taxRate,
    tax_amount: exp.taxAmount,
    total: exp.total,

    status: exp.status,
    payment_method: exp.paymentMethod,
    amount_paid: exp.amountPaid,
    balance_due: exp.balanceDue,
    reference_number: exp.referenceNumber,

    vendor: exp.vendor,
    items: exp.items || [],
    notes: exp.notes,
    receipt_url: exp.receiptUrl,

    created_at: exp.createdAt,
    updated_at: exp.updatedAt
  };
}
