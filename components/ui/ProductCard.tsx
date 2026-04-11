"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ImageOff, Star } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { fetchProductReviews } from "@/lib/api/reviews";

const PLACEHOLDER_BG = "bg-secondary/40";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const reviews = await fetchProductReviews(product.id);
        if (reviews.length > 0) {
          const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
          setRating(avg);
          setReviewCount(reviews.length);
        } else {
          setRating(null);
          setReviewCount(0);
        }
      } catch (err) {
        console.error("Failed to load product rating", err);
      }
    }
    loadStats();
  }, [product.id]);

  // Safely derive the primary image from the `images` text[] column
  const primaryImage =
    !imgError && product.images?.length > 0 ? product.images[0] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.inStock) {
      addToCart(product, 1);
      addToast(`Added ${product.name} to cart`, "success");
    } else {
      addToast("This item is currently out of stock", "error");
    }
  };

  return (
    <div
      className="group flex flex-col reset-link"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/product/${product.id}`}
        className={`relative aspect-[4/5] overflow-hidden rounded-t-lg mb-3 ${PLACEHOLDER_BG}`}
      >
        {/* Main Image — uses images[0] */}
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            onError={() => setImgError(true)}
            className={`object-cover w-full h-full transition-transform duration-700 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />
        ) : (
          // Graceful placeholder when images[] is empty or all URLs fail
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-foreground/30">
            <ImageOff className="w-8 h-8" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.inStock && (
            <span className="bg-white/90 backdrop-blur-sm text-foreground text-xs px-2 py-1 uppercase tracking-wider font-semibold rounded-sm">
              Out of stock
            </span>
          )}
          {product.featured && product.inStock && (
            <span className="bg-sage/90 backdrop-blur-sm text-white text-xs px-2 py-1 uppercase tracking-wider font-semibold rounded-sm shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        {/* Quick Actions (Hover) */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 transform flex gap-2 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 bg-white/95 backdrop-blur-sm text-foreground hover:bg-rose hover:text-white disabled:bg-white/50 disabled:text-foreground/50 transition-colors py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Bag
          </button>
          <button className="bg-white/95 backdrop-blur-sm p-2.5 rounded-md text-foreground hover:text-rose transition-colors shadow-sm">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </Link>

      <div className="flex flex-col">
        <div className="text-xs text-foreground/50 uppercase tracking-widest mb-1.5">
          {product.category}
        </div>
        <Link
          href={`/product/${product.id}`}
          className="font-serif text-lg text-foreground hover:text-rose transition-colors mb-1 truncate"
        >
          {product.name}
        </Link>
        <div className="text-foreground/80 font-medium tracking-wide flex justify-between items-center">
          <span>{formatPrice(product.price)}</span>
          {rating !== null && (
            <div className="flex items-center gap-1.5">
              <div className="flex text-rose">
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-xs font-semibold text-foreground/60">{rating.toFixed(1)}</span>
              <span className="text-[10px] text-foreground/30">({reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
