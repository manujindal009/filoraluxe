"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Building, FileText, Palette, Eye, RefreshCw } from "lucide-react";
import { InvoiceSettings } from "@/types/invoice";
import { fetchInvoiceSettings, saveInvoiceSettings, DEFAULT_INVOICE_SETTINGS } from "@/lib/api/invoices";
import { useToast } from "@/context/ToastContext";

export default function InvoiceSettingsPage() {
  const [settings, setSettings] = useState<InvoiceSettings>(DEFAULT_INVOICE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchInvoiceSettings();
        setSettings(data);
      } catch (err) {
        console.error("Load invoice settings error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveInvoiceSettings(settings);
      addToast("Default invoice settings saved successfully!", "success");
    } catch (err) {
      addToast("Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-foreground/50">Loading billing settings...</div>;
  }

  return (
    <div className="space-y-8 w-full max-w-4xl text-foreground pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/billing"
            className="p-2 border border-secondary bg-white hover:bg-secondary/50 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-semibold">Invoice Template Settings</h1>
            <p className="text-xs text-foreground/60">
              Configure business details, defaults, styling, and visibility for future invoices.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-rose text-white hover:bg-rose/90 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      {/* 1. Business Information */}
      <div className="bg-white p-6 rounded-xl border border-secondary space-y-4 shadow-sm">
        <h3 className="font-serif font-semibold text-base border-b border-secondary pb-3 flex items-center gap-2 text-foreground">
          <Building className="w-4 h-4 text-rose" />
          1. Default Business Information (FROM)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-foreground/70 mb-1">Business Name</label>
            <input
              type="text"
              value={settings.business.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business: { ...settings.business, name: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">Tagline / Subtitle</label>
            <input
              type="text"
              value={settings.business.tagline || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business: { ...settings.business, tagline: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-foreground/70 mb-1">Business Address</label>
            <input
              type="text"
              value={settings.business.address}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business: { ...settings.business, address: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose mb-2"
            />
            <input
              type="text"
              placeholder="City, State, PIN"
              value={settings.business.cityStatePin || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business: { ...settings.business, cityStatePin: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">Email Address</label>
            <input
              type="email"
              value={settings.business.email}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business: { ...settings.business, email: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">Phone Number</label>
            <input
              type="text"
              value={settings.business.phone}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business: { ...settings.business, phone: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">Website URL</label>
            <input
              type="text"
              value={settings.business.website || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business: { ...settings.business, website: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">Instagram Handle</label>
            <input
              type="text"
              value={settings.business.instagram || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business: { ...settings.business, instagram: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">GSTIN (Optional)</label>
            <input
              type="text"
              value={settings.business.gstin || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business: { ...settings.business, gstin: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 font-mono focus:outline-none focus:border-rose"
            />
          </div>
        </div>
      </div>

      {/* 2. Invoice Defaults */}
      <div className="bg-white p-6 rounded-xl border border-secondary space-y-4 shadow-sm">
        <h3 className="font-serif font-semibold text-base border-b border-secondary pb-3 flex items-center gap-2 text-foreground">
          <FileText className="w-4 h-4 text-rose" />
          2. Invoice Defaults & Sequential Numbering
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-foreground/70 mb-1">Invoice Prefix</label>
            <input
              type="text"
              value={settings.defaults.invoicePrefix}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaults: { ...settings.defaults, invoicePrefix: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 font-mono focus:outline-none focus:border-rose"
              placeholder="INV-"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">Order Prefix</label>
            <input
              type="text"
              value={settings.defaults.orderPrefix}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaults: { ...settings.defaults, orderPrefix: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 font-mono focus:outline-none focus:border-rose"
              placeholder="FL-"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">
              Default Payment Method
            </label>
            <select
              value={settings.defaults.defaultPaymentMethod}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaults: { ...settings.defaults, defaultPaymentMethod: e.target.value as any }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-rose"
            >
              <option value="upi">UPI / GPay / PhonePe</option>
              <option value="card">Credit / Debit Card</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">
              Default Payment Status
            </label>
            <select
              value={settings.defaults.defaultPaymentStatus}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaults: { ...settings.defaults, defaultPaymentStatus: e.target.value as any }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-rose"
            >
              <option value="pending">PENDING</option>
              <option value="paid">PAID</option>
              <option value="draft">DRAFT</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-foreground/70 mb-1">Default Notes</label>
            <textarea
              rows={2}
              value={settings.defaults.defaultNotes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaults: { ...settings.defaults, defaultNotes: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md p-2 focus:outline-none focus:border-rose"
            />
          </div>
        </div>
      </div>

      {/* 3. Appearance & Branding */}
      <div className="bg-white p-6 rounded-xl border border-secondary space-y-4 shadow-sm">
        <h3 className="font-serif font-semibold text-base border-b border-secondary pb-3 flex items-center gap-2 text-foreground">
          <Palette className="w-4 h-4 text-rose" />
          3. Appearance & Branding
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-foreground/70 mb-1">Primary Color (Burgundy / Brand Accent)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.appearance.primaryColor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, primaryColor: e.target.value }
                  })
                }
                className="w-10 h-9 rounded cursor-pointer border border-secondary"
              />
              <input
                type="text"
                value={settings.appearance.primaryColor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, primaryColor: e.target.value }
                  })
                }
                className="w-full border border-secondary rounded-md px-3 py-1.5 font-mono focus:outline-none focus:border-rose"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground/70 mb-1">Logo Image URL</label>
            <input
              type="text"
              value={settings.appearance.logoUrl}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, logoUrl: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-foreground/70 mb-1">Footer Message</label>
            <textarea
              rows={2}
              value={settings.appearance.footerText}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, footerText: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md p-2 focus:outline-none focus:border-rose"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-foreground/70 mb-1">Care Instructions</label>
            <input
              type="text"
              value={settings.appearance.careInstructions}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, careInstructions: e.target.value }
                })
              }
              className="w-full border border-secondary rounded-md px-3 py-1.5 focus:outline-none focus:border-rose"
            />
          </div>
        </div>
      </div>

      {/* 4. Visibility Defaults */}
      <div className="bg-white p-6 rounded-xl border border-secondary space-y-4 shadow-sm">
        <h3 className="font-serif font-semibold text-base border-b border-secondary pb-3 flex items-center gap-2 text-foreground">
          <Eye className="w-4 h-4 text-rose" />
          4. Default Field Visibility
        </h3>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(settings.visibility)
              .filter(([k]) => k.startsWith("show"))
              .map(([key, val]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer p-3 bg-secondary/20 rounded-lg border border-secondary hover:border-rose/50"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        visibility: { ...settings.visibility, [key]: !val }
                      })
                    }
                    className="rounded text-rose focus:ring-rose"
                  />
                  <span className="capitalize font-medium text-foreground/80">
                    {key.replace("show", "Show ")}
                  </span>
                </label>
              ))}
          </div>

          <div className="pt-3 border-t border-secondary grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/10 p-4 rounded-lg">
            <div>
              <label className="block font-medium text-foreground/70 mb-1">Default Signatory Name</label>
              <input
                type="text"
                value={settings.visibility.signatureName || "Anshuma • Founder & Creator"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    visibility: { ...settings.visibility, signatureName: e.target.value }
                  })
                }
                className="w-full border border-secondary rounded px-3 py-1.5 bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground/70 mb-1">Default Signatory Title</label>
              <input
                type="text"
                value={settings.visibility.signatureTitle || "Authorized Signatory"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    visibility: { ...settings.visibility, signatureTitle: e.target.value }
                  })
                }
                className="w-full border border-secondary rounded px-3 py-1.5 bg-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
