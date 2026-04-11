"use client";

import React from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function CartSummary() {
  const { total, itemCount } = useCart();
  
  // Calculate shipping (free over ₹250)
  const shipping = total > 150 ? 0 : 15;
  const grandTotal = total + shipping;

  return (
    <div className="bg-primary/20 rounded-xl p-6 lg:p-8 border border-primary/50 sticky top-24">
      <h2 className="text-xl font-serif font-semibold text-foreground mb-6">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-foreground/70">Subtotal ({itemCount} items)</span>
          <span className="font-medium text-foreground">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-foreground/70">Shipping estimate</span>
          <span className="font-medium text-foreground">
            {shipping === 0 ? <span className="text-sage">Free</span> : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-foreground/70">Tax</span>
          <span className="font-medium text-foreground">Calculated at checkout</span>
        </div>
      </div>
      
      <div className="border-t border-secondary/50 pt-4 mb-8">
        <div className="flex justify-between">
          <span className="text-base font-medium text-foreground">Total</span>
          <span className="text-xl font-serif font-semibold text-foreground">{formatPrice(grandTotal)}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-foreground/50 mt-2 text-right">
            Spend {formatPrice(150 - total)} more for free shipping
          </p>
        )}
      </div>
      
      <Link 
        href="/checkout"
        className="w-full block text-center bg-foreground text-white py-4 rounded-md font-medium hover:bg-rose transition-colors shadow-md"
      >
        Proceed to Checkout
      </Link>
      
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="text-xs text-foreground/40 text-center">
          Secure, encrypted checkout
        </span>
      </div>
    </div>
  );
}
