"use client";

import React from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Product } from "@/types";
import { Loader } from "@/components/ui/Loader";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader size="lg" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h3 className="text-2xl font-serif text-foreground mb-3">No products found</h3>
        <p className="text-foreground/60 max-w-md text-balance">
          We couldn't find anything matching your current filters. Try adjusting them or searching for something else.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
