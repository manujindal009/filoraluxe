"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldAlert, User, Package, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

interface DiagnosticData {
  currentUser: {
    uid: string;
    email: string;
    role: string;
  };
  totalOrders: number;
  ordersAudit?: any[];
  orphanedOrders: any[];
  userOrders: any[];
  profileStatus: {
    exists: boolean;
    data: any;
  }
}

export default function DiagnosticsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push("/");
      return;
    }

    const runDiagnostics = async () => {
      try {
        const { data: { session } } = await (await import("@/lib/supabaseClient")).supabase.auth.getSession();
        
        const response = await fetch("/api/admin/diagnostics", {
          headers: {
            "Authorization": `Bearer ${session?.access_token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch diagnostics");
        }
        
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) runDiagnostics();
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return <div className="h-screen flex items-center justify-center bg-white"><Loader size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white min-h-screen pt-24">
        <ShieldAlert className="w-12 h-12 text-rose mx-auto mb-4" />
        <h1 className="text-2xl font-serif text-rose">Diagnostic Error</h1>
        <p className="text-foreground/60">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-6">
          <ShieldAlert className="w-8 h-8 text-rose" />
          <h1 className="text-3xl font-serif font-semibold">Order Diagnostics Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Session Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <User className="w-4 h-4" /> Current Session
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Authenticated UID</p>
                  <code className="text-xs break-all bg-slate-100 p-2 rounded block mt-1">{user?.id}</code>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Email</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Role</p>
                  <p className="text-sm font-medium">{user?.role}</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className={`p-3 rounded-lg flex items-center gap-3 ${data?.profileStatus.exists ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {data?.profileStatus.exists ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-xs font-bold">{data?.profileStatus.exists ? "Profile Verified" : "Profile Missing!"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 text-slate-700">Database Statisics</h3>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Total Orders</span>
                <span className="font-bold">{data?.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Orphaned (No User Link)</span>
                <span className={`font-bold ${data?.orphanedOrders.length ? 'text-rose' : 'text-emerald-600'}`}>
                  {data?.orphanedOrders.length}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Lists */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Orders Verification */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Your Active Orders (SELECT Check)
                </h2>
                <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                  Matches UID: {user?.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="p-6">
                {data?.userOrders && data.userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {data.userOrders.map((order: any) => (
                      <div key={order.id} className="flex justify-between items-center p-3 border border-emerald-100 bg-emerald-50/30 rounded-lg">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{order.id}</p>
                          <p className="text-[10px] text-slate-500">Placed: {new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">₹{order.final_amount || order.total}</p>
                          <p className="text-[10px] uppercase text-emerald-600 font-bold">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm italic">You have 0 orders linked to your current UID.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Orphaned Orders Warning */}
            {data?.orphanedOrders && data.orphanedOrders.length > 0 && (
              <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
                <div className="bg-rose-50 px-6 py-4 border-b border-rose-100">
                  <h2 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> CRITICAL: Orphaned Records Found
                  </h2>
                </div>
                <div className="p-0">
                  <table className="w-full text-left text-xs uppercase tracking-tight">
                    <thead className="bg-rose-50/50 text-rose-700 border-b border-rose-100">
                      <tr>
                        <th className="px-6 py-3 font-bold">Order ID</th>
                        <th className="px-6 py-3 font-bold">Reason</th>
                        <th className="px-6 py-3 font-bold">Stored user_id</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orphanedOrders.map((order: any) => (
                        <tr key={order.id} className="border-b border-rose-50 hover:bg-rose-50/30">
                          <td className="px-6 py-4 font-mono font-medium">{order.id}</td>
                          <td className="px-6 py-4">
                            <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded">
                              {!order.user_id ? "NULL ID" : "ID Mismatch / Orphan"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] break-all max-w-[150px]">{order.user_id || "EMPTY"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* NEW: Global Forensic Audit */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Global Database Forensic Audit
                </h2>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  Master Record List
                </span>
              </div>
              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-bold text-slate-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 font-bold text-slate-500 uppercase">Profile Link</th>
                        <th className="px-6 py-3 font-bold text-slate-500 uppercase">Linked Identity</th>
                        <th className="px-6 py-3 font-bold text-slate-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.ordersAudit || []).map((order: any) => (
                        <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-slate-800 font-medium">{order.id}</td>
                          <td className="px-6 py-4">
                            {order.profileFound ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 font-bold uppercase text-[9px]">
                                <CheckCircle2 className="w-3 h-3" /> Linked
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-rose-600 font-bold uppercase text-[9px]">
                                <AlertCircle className="w-3 h-3" /> Orphaned
                              </div>
                            )}
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5 mt-1 border border-slate-100 p-1 rounded bg-slate-50 inline-block max-w-[120px] truncate">
                              {order.user_id || "NULL"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-700">{order.linkedName || "N/A"}</div>
                            <div className="text-[10px] text-slate-400 italic">{order.linkedEmail || "No profile linked"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold uppercase">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 p-6 rounded-2xl">
          <h3 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" /> Next Steps
          </h3>
          <p className="text-amber-700 text-sm leading-relaxed">
            If you see 0 orders in "Your Active Orders" but they appear in the total count, the <strong>user_id</strong> in the orders table does not match your current Auth ID. 
            Run the <strong>supabase_order_hardening.sql</strong> script to fix orphaned records and enforce strict user ownership.
          </p>
        </div>
      </div>
    </div>
  );
}
