"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, X, Loader2 } from "lucide-react";
import { Coupon } from "@/types";
import { fetchAllCoupons, createCoupon, deleteCoupon } from "@/lib/api/coupons";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/utils";

const COMMISSION_RATE = 0.10;

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercentage: "",
    ownerName: "",
    expiryDate: "",
    maxUsage: "100",
    isFreeShipping: false,
  });

  useEffect(() => {
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCoupons();
      setCoupons(data);
    } catch {
      addToast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await createCoupon({
        code: newCoupon.code,
        discountPercentage: parseFloat(newCoupon.discountPercentage),
        ownerName: newCoupon.ownerName,
        expiryDate: new Date(newCoupon.expiryDate).toISOString(),
        maxUsage: parseInt(newCoupon.maxUsage),
        isFreeShipping: newCoupon.isFreeShipping,
      });
      setCoupons([created, ...coupons]);
      addToast(`Coupon ${created.code} created!`, "success");
      setIsModalOpen(false);
      setNewCoupon({ code: "", discountPercentage: "", ownerName: "", expiryDate: "", maxUsage: "100", isFreeShipping: false });
    } catch {
      addToast("Failed to create coupon", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon ${coupon.code}? This cannot be undone.`)) return;
    setDeletingId(coupon.id);
    try {
      await deleteCoupon(coupon.id);
      setCoupons(coupons.filter(c => c.id !== coupon.id));
      addToast(`Coupon ${coupon.code} deleted`, "success");
    } catch {
      addToast("Failed to delete coupon", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();
  const usagePercent = (coupon: Coupon) => Math.min(100, Math.round((coupon.usedCount / coupon.maxUsage) * 100));

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-serif font-semibold text-foreground">Coupons & Affiliates</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-foreground text-white px-4 py-2 rounded-md font-medium hover:bg-rose transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-secondary p-4 shadow-sm">
            <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">Total Coupons</p>
            <p className="text-2xl font-serif font-bold">{coupons.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-secondary p-4 shadow-sm">
            <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">Active</p>
            <p className="text-2xl font-serif font-bold text-sage">
              {coupons.filter(c => !isExpired(c.expiryDate) && c.usedCount < c.maxUsage).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-secondary p-4 shadow-sm">
            <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">Total Uses</p>
            <p className="text-2xl font-serif font-bold">
              {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-secondary p-4 shadow-sm">
            <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">Unique Affiliates</p>
            <p className="text-2xl font-serif font-bold">
              {new Set(coupons.map(c => c.ownerName)).size}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden w-full">
          <div className="p-4 border-b border-secondary flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                type="text"
                placeholder="Search by code or affiliate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-secondary rounded-md text-sm focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose"
              />
            </div>
            <span className="text-sm text-foreground/50 whitespace-nowrap">{filtered.length} results</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
              <thead className="bg-secondary/30 uppercase text-xs font-semibold text-foreground/60">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Affiliate</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Expires</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-foreground/40" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-foreground/50">
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((coupon) => {
                    const expired = isExpired(coupon.expiryDate);
                    const exhausted = coupon.usedCount >= coupon.maxUsage;
                    const pct = usagePercent(coupon);

                    return (
                      <tr key={coupon.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-foreground tracking-wider">
                          {coupon.code}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{coupon.ownerName}</span>
                            <span className="text-xs text-foreground/50">
                              Est. commission: {(coupon.discountPercentage * COMMISSION_RATE).toFixed(1)}% per sale
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {coupon.isFreeShipping ? (
                            <span className="bg-sage/20 text-sage px-2 py-1 rounded text-xs font-semibold">
                              FREE SHIPPING
                            </span>
                          ) : (
                            <span className="bg-primary/20 text-foreground px-2 py-1 rounded text-xs font-semibold">
                              {coupon.discountPercentage}% OFF
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <div className="flex justify-between text-xs">
                              <span>{coupon.usedCount} / {coupon.maxUsage}</span>
                              <span className="text-foreground/50">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-rose" : pct > 70 ? "bg-amber-400" : "bg-sage"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground/70">
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {expired ? (
                            <span className="bg-foreground/10 text-foreground/50 text-xs px-2 py-1 rounded uppercase tracking-wider font-medium">Expired</span>
                          ) : exhausted ? (
                            <span className="bg-rose/10 text-rose text-xs px-2 py-1 rounded uppercase tracking-wider font-medium">Limit Reached</span>
                          ) : (
                            <span className="bg-sage/10 text-sage text-xs px-2 py-1 rounded uppercase tracking-wider font-medium">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(coupon)}
                            disabled={deletingId === coupon.id}
                            className="p-2 hover:text-rose hover:bg-rose/10 rounded transition-colors text-foreground/40 disabled:opacity-40"
                          >
                            {deletingId === coupon.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />
                            }
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md border border-secondary overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-secondary flex justify-between items-center">
              <h2 className="font-serif font-semibold text-xl">Create New Coupon</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-secondary/50 rounded-full text-foreground/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Coupon Code</label>
                <input
                  required
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full border border-secondary rounded-md px-4 py-2 font-mono uppercase focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                  placeholder="e.g. MANU20"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg mb-2">
                <input
                  type="checkbox"
                  id="isFreeShipping"
                  checked={newCoupon.isFreeShipping}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setNewCoupon({ 
                      ...newCoupon, 
                      isFreeShipping: checked,
                      discountPercentage: checked ? "0" : newCoupon.discountPercentage
                    });
                  }}
                  className="w-4 h-4 rounded border-secondary text-rose focus:ring-rose"
                />
                <label htmlFor="isFreeShipping" className="text-sm font-medium text-foreground cursor-pointer">
                  This coupon provides **Free Shipping**
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Discount %</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    disabled={newCoupon.isFreeShipping}
                    value={newCoupon.discountPercentage}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountPercentage: e.target.value })}
                    className="w-full border border-secondary rounded-md px-4 py-2 focus:ring-1 focus:ring-rose focus:border-rose outline-none disabled:bg-secondary/30 disabled:text-foreground/40"
                    placeholder="e.g. 20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Max Uses</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newCoupon.maxUsage}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxUsage: e.target.value })}
                    className="w-full border border-secondary rounded-md px-4 py-2 focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Affiliate Owner Name</label>
                <input
                  required
                  type="text"
                  value={newCoupon.ownerName}
                  onChange={(e) => setNewCoupon({ ...newCoupon, ownerName: e.target.value })}
                  className="w-full border border-secondary rounded-md px-4 py-2 focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                  placeholder="e.g. jane_influencer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Expiry Date</label>
                <input
                  required
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  className="w-full border border-secondary rounded-md px-4 py-2 focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                />
              </div>

              <div className="pt-4 border-t border-secondary flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-secondary/50 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-foreground text-white px-6 py-2 rounded-md font-medium hover:bg-rose transition-colors flex items-center justify-center gap-2 min-w-[130px]"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
