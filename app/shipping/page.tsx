import React from "react";
import Link from "next/link";
import { Package, RefreshCw, AlertCircle, Globe } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-4">
          Shipping & Returns
        </h1>
        <p className="text-foreground/60 max-w-2xl">
          We want your experience to be seamless from order to delivery. Here's everything you need to know about how we ship and handle returns.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white border border-secondary rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-sage" />
            </div>
            <h2 className="font-serif font-semibold text-xl">Domestic Shipping</h2>
          </div>
          <ul className="space-y-3 text-sm text-foreground/70">
            <li className="flex justify-between">
              <span>Standard (5–7 days)</span>
              <span className="font-medium text-foreground">₹80</span>
            </li>
            <li className="flex justify-between">
              <span>Express (2–3 days)</span>
              <span className="font-medium text-foreground">₹150</span>
            </li>
            <li className="flex justify-between border-t border-secondary pt-3">
              <span className="font-medium">Free shipping on orders above</span>
              <span className="font-semibold text-sage">₹1,500</span>
            </li>
          </ul>
          <p className="text-xs text-foreground/50">Processing time: 1–2 business days before dispatch.</p>
        </div>

        <div className="bg-white border border-secondary rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-foreground" />
            </div>
            <h2 className="font-serif font-semibold text-xl">International Shipping</h2>
          </div>
          <ul className="space-y-3 text-sm text-foreground/70">
            <li className="flex justify-between">
              <span>South Asia (7–12 days)</span>
              <span className="font-medium text-foreground">₹400</span>
            </li>
            <li className="flex justify-between">
              <span>Rest of World (14–21 days)</span>
              <span className="font-medium text-foreground">₹800</span>
            </li>
          </ul>
          <p className="text-xs text-foreground/50">Customs duties and taxes may apply and are the buyer's responsibility.</p>
        </div>
      </div>

      <div className="bg-white border border-secondary rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-rose" />
          </div>
          <h2 className="font-serif font-semibold text-xl">Returns & Exchanges</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-foreground/70">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Eligible for return:</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Unused items in original condition</li>
              <li>Returned within 7 days of delivery</li>
              <li>Items with original tags attached</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Not eligible for return:</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Custom / personalized orders</li>
              <li>Items that have been used or washed</li>
              <li>Sale items (final sale)</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-secondary">
          <p className="text-sm text-foreground/60">
            To initiate a return, email us at{" "}
            <a href="mailto:filoraluxe@yahoo.com" className="text-rose hover:underline font-medium">
              filoraluxe@yahoo.com
            </a>{" "}
            with your order number and reason. We'll respond within 24-48hours.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Damaged or defective items must be reported within 24 hours of delivery with photo or video evidence. We'll arrange a free replacement or full refund.
        </p>
      </div>
    </div>
  );
}
