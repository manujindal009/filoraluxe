"use client";

import React, { useState } from "react";
import { Store, Bell, Shield, Save, Truck } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Loader } from "@/components/ui/Loader";

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Filora Luxe",
    supportEmail: "support@filoraluxe.com",
    orderPrefix: "ORD-",
    currency: "USD ($)"
  });

  const [toggles, setToggles] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    customerReviews: false,
    freeShipping: true,
    maintenanceMode: false
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API
      addToast("Settings saved successfully!", "success");
    } catch {
      addToast("Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif font-semibold text-foreground">Store Settings</h1>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-foreground text-white px-6 py-2 rounded-md font-medium hover:bg-rose transition-colors flex items-center justify-center gap-2 text-sm min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader size="sm" /> : (
             <>
               <Save className="w-4 h-4" />
               Save Changes
             </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Forms) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Details */}
          <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden">
            <div className="border-b border-secondary p-4 flex items-center gap-3 bg-secondary/20">
              <Store className="w-5 h-5 text-foreground/70" />
              <h2 className="font-medium text-lg">General Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={e => setStoreSettings({...storeSettings, storeName: e.target.value})}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={storeSettings.supportEmail}
                    onChange={e => setStoreSettings({...storeSettings, supportEmail: e.target.value})}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Order ID Prefix</label>
                  <input
                    type="text"
                    value={storeSettings.orderPrefix}
                    onChange={e => setStoreSettings({...storeSettings, orderPrefix: e.target.value})}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Currency</label>
                  <select
                    value={storeSettings.currency}
                    onChange={e => setStoreSettings({...storeSettings, currency: e.target.value})}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose outline-none"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="CAD ($)">CAD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Processing & Shipping */}
          <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden">
            <div className="border-b border-secondary p-4 flex items-center gap-3 bg-secondary/20">
              <Truck className="w-5 h-5 text-foreground/70" />
              <h2 className="font-medium text-lg">Checkout & Operations</h2>
            </div>
            <div className="p-6 space-y-4">
              
              <div className="flex items-center justify-between py-3 border-b border-secondary last:border-0">
                <div>
                  <p className="font-medium text-sm">Free Shipping Threshold</p>
                  <p className="text-xs text-foreground/60 w-3/4">Enable free worldwide shipping for orders over $150.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={toggles.freeShipping} 
                    onChange={e => setToggles({...toggles, freeShipping: e.target.checked})} 
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-secondary last:border-0">
                <div>
                  <p className="font-medium text-sm">Enable Customer Reviews</p>
                  <p className="text-xs text-foreground/60 w-3/4">Allow verified buyers to leave reviews on product pages.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={toggles.customerReviews} 
                    onChange={e => setToggles({...toggles, customerReviews: e.target.checked})} 
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-secondary last:border-0">
                <div>
                  <p className="font-medium text-sm text-rose">Maintenance Mode</p>
                  <p className="text-xs text-foreground/60 w-3/4">Suspends shop functionality and displays a "We'll be back soon" banner.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={toggles.maintenanceMode} 
                    onChange={e => setToggles({...toggles, maintenanceMode: e.target.checked})} 
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose"></div>
                </label>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column (Notifications/Security) */}
        <div className="space-y-8">
          
          {/* Notifications Panel */}
          <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden">
            <div className="border-b border-secondary p-4 flex items-center gap-3 bg-secondary/20">
              <Bell className="w-5 h-5 text-foreground/70" />
              <h2 className="font-medium text-lg">Notifications</h2>
            </div>
            <div className="p-6 space-y-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={toggles.emailNotifications}
                  onChange={e => setToggles({...toggles, emailNotifications: e.target.checked})}
                  className="mt-1 w-4 h-4 text-rose accent-rose rounded border-secondary"
                />
                <div>
                  <p className="text-sm font-medium">Order Notifications</p>
                  <p className="text-xs text-foreground/60 mt-0.5">Receive an email when a new custom piece request or product order is placed.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={toggles.lowStockAlerts}
                  onChange={e => setToggles({...toggles, lowStockAlerts: e.target.checked})}
                  className="mt-1 w-4 h-4 text-rose accent-rose rounded border-secondary"
                />
                <div>
                  <p className="text-sm font-medium">Low Stock Alerts</p>
                  <p className="text-xs text-foreground/60 mt-0.5">Receive weekly alerts detailing any store inventory reaching zero.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Security Banner */}
          <div className="bg-primary/20 rounded-xl border border-primary p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-sage" />
              <h2 className="font-medium text-lg">Admin Security</h2>
            </div>
            <p className="text-sm text-foreground/70 mb-4 text-balance">
              Your session is currently verified. If you wish to rotate your admin credentials or view login history, please access the SuperAdmin database panel.
            </p>
            <button className="text-sm font-medium text-rose hover:underline">
              View Access Logs
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
