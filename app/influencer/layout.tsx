"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/ui/Loader";
import Link from "next/link";
import { PieChart, LogOut } from "lucide-react";

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-primary/10">
        <Loader size="lg" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-primary/10">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-secondary/50 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-secondary/50">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
            Filora Luxe
          </Link>
          <span className="ml-2 text-xs font-medium text-sage tracking-wider uppercase">Partners</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link 
            href="/influencer" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sage/10 text-sage font-medium transition-colors"
          >
            <PieChart className="w-5 h-5" />
            Performance
          </Link>
        </nav>

        <div className="p-4 border-t border-secondary/50">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <p className="text-sm font-medium line-clamp-1">{user.name}</p>
              <p className="text-xs text-foreground/50">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-foreground/70 hover:bg-rose/10 hover:text-rose transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden h-full relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
