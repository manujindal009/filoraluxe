"use client";

import React from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { CartItem as CartItemType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex py-6 border-b border-secondary/50 last:border-0">
      <Link href={`/product/${product.id}`} className="h-24 w-20 md:h-32 md:w-24 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center hover:opacity-80 transition-opacity"
        />
      </Link>

      <div className="ml-4 md:ml-6 flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <h3 className="font-serif text-base md:text-lg text-foreground hover:text-rose transition-colors">
              <Link href={`/product/${product.id}`}>{product.name}</Link>
            </h3>
            <p className="mt-1 text-sm text-foreground/50 uppercase tracking-widest">{product.category}</p>
          </div>
          <p className="font-medium text-foreground">{formatPrice(product.price)}</p>
        </div>

        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center border border-secondary rounded-md">
            <button
              onClick={() => updateQuantity(item.id, Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="px-2.5 py-1 text-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-50"
            >
              <Minus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="px-2.5 py-1 text-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-colors"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(item.id)}
            className="font-medium text-rose hover:text-rose/80 transition-colors flex items-center gap-1 text-xs md:text-sm"
          >
            <X className="w-4 h-4" />
            <span className="hidden md:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
