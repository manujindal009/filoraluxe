"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";

export default function CartPage() {
  const { items, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-primary/30 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-rose" />
        </div>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-4">Your bag is empty</h1>
        <p className="text-foreground/70 max-w-md mx-auto mb-8 text-balance">
          Looks like you haven't added anything to your cart yet. Discover our premium handcrafted collections.
        </p>
        <Link 
          href="/shop" 
          className="bg-foreground text-white px-8 py-4 rounded-md font-medium hover:bg-rose transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex items-center gap-2 mb-8 border-b border-secondary/50 pb-6">
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground">Shopping Bag</h1>
        <span className="text-sm font-medium bg-secondary text-foreground px-3 py-1 rounded-full mt-1">
          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        <div className="w-full lg:w-2/3">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-secondary/50 text-xs font-semibold uppercase tracking-wider text-foreground/50">
            <div className="col-span-8">Product</div>
            <div className="col-span-4 text-right">Total</div>
          </div>
          
          <div className="flex flex-col">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <CartSummary />
        </div>
      </div>
      
      <div className="mt-12 text-center md:text-left">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-rose transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
