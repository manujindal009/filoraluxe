"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Product } from "@/types";
import { fetchProducts } from "@/lib/api/products";
import { Loader } from "@/components/ui/Loader";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await fetchProducts();
        // Just take featured ones
        setProducts(allProducts.filter(p => p.featured).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch featured products", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-secondary/50 pb-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
              Featured Collection
            </h2>
            <p className="text-foreground/70">
              Hand-picked selections of our most loved and intricately designed pieces, crafted for longevity and style.
            </p>
          </div>
          <Link href="/shop" className="group flex items-center gap-2 text-rose font-medium hover:text-foreground transition-colors mt-6 md:mt-0">
            View All Shop
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-secondary/20 rounded-xl border border-dashed border-secondary">
            <p className="text-foreground/50 font-medium">New handcrafted treasures arriving soon.</p>
            <p className="text-xs text-foreground/30 mt-1 italic">Stay tuned for our next collection drop.</p>
          </div>
        )}
      </div>
    </section>
  );
}
