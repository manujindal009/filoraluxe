"use client";

import React from "react";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { fetchAdminStats, DashboardStats } from "@/lib/api/analytics";
import { Loader } from "@/components/ui/Loader";

// Base stats template
const STATS_TEMPLATE = [
  { label: "Total Revenue", key: "totalRevenue", isCurrency: true, icon: DollarSign },
  { label: "Orders", key: "totalOrders", isCurrency: false, icon: ShoppingBag },
  { label: "Customers", key: "totalCustomers", isCurrency: false, icon: Users },
  { label: "Conversion Rate", key: "conversion", isCurrency: false, isPercent: true, icon: TrendingUp },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const dashboardStats = [
    { label: "Total Revenue", value: stats?.totalRevenue || 0, isCurrency: true, icon: DollarSign, trend: "+0%" },
    { label: "Orders", value: stats?.totalOrders || 0, isCurrency: false, icon: ShoppingBag, trend: "+0%" },
    { label: "Customers", value: stats?.totalCustomers || 0, isCurrency: false, icon: Users, trend: "+0%" },
    { label: "Conversion Rate", value: 0, isCurrency: false, isPercent: true, icon: TrendingUp, trend: "+0%" },
  ];
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-semibold text-foreground">Dashboard</h1>
        <div className="text-sm text-foreground/60">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-secondary shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose/10 rounded-lg text-rose">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-sage bg-sage/10 px-2 py-1 rounded">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/60 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-semibold">
                {stat.isCurrency ? formatPrice(stat.value) : stat.isPercent ? `${stat.value}%` : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders - Live */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-secondary shadow-sm p-6 line-clamp-2 min-h-64 flex flex-col items-center">
          <h2 className="text-xl font-serif font-semibold mb-4 w-full self-start">Recent Orders</h2>
          <div className="space-y-4 w-full">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center py-3 border-b border-secondary last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Order #{order.id}</span>
                    <span className="text-xs text-foreground/50">{order.profiles?.email || "Customer"}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-sm">{formatPrice(order.total)}</span>
                    <span className="block text-xs text-sage capitalize mt-0.5">{order.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-secondary mx-auto mb-4" />
                <p className="text-foreground/50 font-medium">No orders yet.</p>
                <p className="text-xs text-foreground/30 mt-1 italic">When customers buy your products, they will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Product - Mock */}
        <div className="bg-white rounded-xl border border-secondary shadow-sm p-6 flex flex-col items-center">
          <h2 className="text-xl font-serif font-semibold mb-4 w-full">Top Selling Product</h2>
          {stats?.topProduct ? (
            <div className="w-full">
              <div className="aspect-[4/5] rounded-lg bg-secondary overflow-hidden mb-4 relative">
                <img 
                  src={stats.topProduct.image} 
                  alt={stats.topProduct.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold text-foreground">
                  TOP
                </div>
              </div>
              <h3 className="font-serif font-medium text-lg">{stats.topProduct.name}</h3>
              <p className="text-sm text-foreground/60 mb-3">{stats.topProduct.soldCount} units sold</p>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-rose h-full w-[100%]"></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-rose" />
              </div>
              <p className="text-foreground/50 font-medium">Data coming soon.</p>
              <p className="text-xs text-foreground/30 mt-1 italic">Start selling to see your top products here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
