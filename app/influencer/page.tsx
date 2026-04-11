"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Tag, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

interface InfluencerStats {
  totalRevenue: number;
  totalCommission: number;
  totalOrders: number;
  activeCoupons: number;
  recentOrders: any[];
}

export default function InfluencerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<InfluencerStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Define affiliate commission explicitly. E.g. 10%
  const COMMISSION_RATE = 0.10; 

  useEffect(() => {
    if (user?.name) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // 1. Fetch Orders linked to this owner
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('coupon_owner', user.name)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // 2. Fetch Active Coupons
      const { data: coupons, error: couponsError } = await supabase
        .from('coupons')
        .select('*')
        .eq('owner_name', user.name);

      if (couponsError) throw couponsError;

      const totalRev = orders.reduce((sum, order) => sum + Number(order.final_amount), 0);
      const commission = totalRev * COMMISSION_RATE;

      setStats({
        totalRevenue: totalRev,
        totalCommission: commission,
        totalOrders: orders.length,
        activeCoupons: coupons.length,
        recentOrders: orders.slice(0, 5)
      });
      
    } catch (error) {
      console.error("Failed to load influencer stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 bg-secondary/50 w-64 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-secondary/30 rounded-xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">Hello, {user?.name}</h1>
        <p className="text-foreground/70">Here is how your affiliate coupons are tracking this month.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-secondary shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground/70 text-sm">Commission Earned</h3>
            <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-sage" />
            </div>
          </div>
          <p className="text-3xl font-bold font-serif text-sage">{formatPrice(stats.totalCommission)}</p>
          <p className="text-xs text-foreground/50 mt-2">At standard 10% rate</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-secondary shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground/70 text-sm">Total Revenue Driven</h3>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold font-serif">{formatPrice(stats.totalRevenue)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-secondary shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground/70 text-sm">Orders Generated</h3>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold font-serif">{stats.totalOrders}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-secondary shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground/70 text-sm">Active Coupons</h3>
            <div className="w-8 h-8 rounded-full bg-rose/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-rose" />
            </div>
          </div>
          <p className="text-3xl font-bold font-serif">{stats.activeCoupons}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden">
        <div className="p-6 border-b border-secondary">
          <h2 className="font-serif font-semibold text-xl">Recent Conversions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/30 uppercase text-xs font-semibold text-foreground/60">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Coupon Used</th>
                <th className="px-6 py-4">Order Value</th>
                <th className="px-6 py-4 text-sage font-bold">Your Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    No conversions recorded just yet. Keep promoting!
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                    <td className="px-6 py-4 text-foreground/70">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{order.coupon_code}</td>
                    <td className="px-6 py-4">{formatPrice(order.final_amount)}</td>
                    <td className="px-6 py-4 font-medium text-sage">{formatPrice(order.final_amount * COMMISSION_RATE)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
