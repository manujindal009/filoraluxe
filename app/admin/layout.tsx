"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package, Tag, MessageSquare, Star, Gift, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Loading admin panel...</div>;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
    { icon: Star, label: "Custom Orders", href: "/admin/custom-orders" },
    { icon: Gift, label: "Coupons", href: "/admin/coupons" },
    { icon: Layers, label: "Categories", href: "/admin/categories" },
    { icon: MessageSquare, label: "Reviews", href: "/admin/reviews" },
    { icon: Users, label: "Customers", href: "/admin/customers" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/30 -mt-20 pt-20">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-secondary/50 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-secondary/50">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
            Filora Luxe
          </Link>
          <span className="ml-2 text-xs font-medium text-rose tracking-wider uppercase">Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-rose/10 text-rose" : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-secondary/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-secondary/50 hover:text-rose transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
