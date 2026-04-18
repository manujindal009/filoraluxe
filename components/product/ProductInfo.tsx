"use client";

import React, { useState } from "react";
import { Heart, Truck, RefreshCw, ShieldCheck, Minus, Plus } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = () => {
    if (product.inStock) {
      addToCart(product, quantity);
      addToast(`Added ${quantity} ${product.name} to cart`, "success");
    } else {
      addToast("This item is currently out of stock", "error");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        {product.featured && (
          <span className="text-xs font-semibold uppercase tracking-wider text-sage bg-sage/10 px-2 py-1 rounded-sm">
            Bestseller
          </span>
        )}
        {!product.inStock && (
          <span className="text-xs font-semibold uppercase tracking-wider text-rose bg-rose/10 px-2 py-1 rounded-sm">
            Out of Stock
          </span>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-2 text-balance">
        {product.name}
      </h1>
      
      <p className="text-2xl font-medium text-foreground/90 mb-6 font-serif">
        {formatPrice(product.price)}
      </p>

      <div className="prose prose-sm text-foreground/70 mb-8 text-balance leading-relaxed">
        <p>{product.description}</p>
        <p className="mt-4 text-sm text-foreground/50">
          * Each item is uniquely handcrafted, meaning slight variations in pattern and size may occur - making your piece truly one of a kind.
        </p>
      </div>

      <div className="border-t border-b border-secondary/50 py-6 mb-8 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium uppercase tracking-wider text-foreground/60 w-24">Quantity</span>
          <div className="flex items-center border border-secondary rounded-md">
            <button 
              className="p-2 text-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-colors"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-medium text-sm">{quantity}</span>
            <button 
              className="p-2 text-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-colors"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="flex-1 bg-foreground text-white py-4 rounded-md font-medium hover:bg-rose disabled:bg-foreground/50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
        <button className="flex items-center justify-center p-4 border border-secondary rounded-md text-foreground hover:text-rose transition-colors sm:w-16">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm text-foreground/70 mt-auto bg-primary/20 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-rose" />
          <span>Free shipping Pan India on orders above ₹799</span>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-rose" />
          <span>7-day hassle-free returns</span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-rose" />
          <span>Secure checkout & payment processing</span>
        </div>
      </div>
    </div>
  );
}
