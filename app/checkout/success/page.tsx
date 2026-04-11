"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Package, Truck, CreditCard } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-20 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-secondary shadow-sm p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-8 text-sage">
          <CheckCircle className="w-12 h-12" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
          Order Confirmed!
        </h1>
        <p className="text-foreground/60 mb-10 text-lg">
          Thank you for shopping with Filora Luxe. Your handcrafted pieces are now being prepared with love.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col items-center p-4 rounded-xl bg-primary/5 border border-primary/10">
            <Package className="w-6 h-6 text-rose mb-3" />
            <h3 className="text-sm font-semibold mb-1">Processing</h3>
            <p className="text-xs text-foreground/50">1-2 Business Days</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-primary/5 border border-primary/10">
            <Truck className="w-6 h-6 text-rose mb-3" />
            <h3 className="text-sm font-semibold mb-1">Shipping</h3>
            <p className="text-xs text-foreground/50">3-5 Business Days</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-primary/5 border border-primary/10">
            <CheckCircle className="w-6 h-6 text-rose mb-3" />
            <h3 className="text-sm font-semibold mb-1">Delivery</h3>
            <p className="text-xs text-foreground/50">Pan India Coverage</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link 
            href="/profile" 
            className="block w-full bg-foreground text-white py-4 rounded-md font-medium hover:bg-rose transition-colors"
          >
            Track My Order
          </Link>
          <Link 
            href="/" 
            className="block w-full text-foreground/60 text-sm hover:underline"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary text-left">
          <h4 className="text-sm font-semibold mb-3">Important Next Steps:</h4>
          <ul className="text-xs text-foreground/60 space-y-2 list-disc pl-4">
            <li>For **UPI Payments**: Our team will verify your screenshot within 2-4 hours.</li>
            <li>For **COD Orders**: You will receive a confirmation call shortly to verify your address.</li>
            <li>You will receive an email confirmation with your full invoice and order details.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
