"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SearchBar } from "@/components/shop/SearchBar";
import { Filter } from "lucide-react";
import { Product } from "@/types";
import { fetchProducts } from "@/lib/api/products";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // URL-driven filter states
  const selectedCategory = searchParams?.get("category") || null;
  const selectedSubcategory = searchParams?.get("subcategory") || null;
  const sortBy = searchParams?.get("sort") || "featured";
  const searchQuery = searchParams?.get("q") || "";
  
  // Mobile sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Unified function to update filters via URL
  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error("[Shop] Failed to load products:", msg);
        setFetchError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    // Apply filters and sorting whenever dependencies change
    let result = [...products];

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Subcategory filter
    if (selectedSubcategory) {
      result = result.filter(p => p.subcategory === selectedSubcategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Manual sort by ID or similar if no date available
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "featured":
      default:
        result.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
        break;
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  const getPageTitle = () => {
    if (selectedSubcategory) {
      return selectedSubcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    if (selectedCategory) {
      return selectedCategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    return "All Collection";
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      {/* Header */}
      <div className="mb-12 border-b border-secondary/50 pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-4">
          {getPageTitle()}
        </h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-foreground/70 text-balance max-w-xl">
            Explore our ethically crafted, beautiful pieces made with the finest natural yarns.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={(q) => updateFilters({ q: q || null })} 
            />
            <button 
              className="md:hidden p-2 border border-secondary rounded-md bg-white text-foreground/80 hover:text-foreground"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <FilterSidebar 
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => updateFilters({ category: cat, subcategory: null })}
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={(sub) => updateFilters({ subcategory: sub })}
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
          sortBy={sortBy}
          setSortBy={(s) => updateFilters({ sort: s })}
        />
        
        <div className="flex-1 w-full relative min-h-[500px]">
          {fetchError ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
              <p className="text-rose font-medium">Could not load products</p>
              <p className="text-sm text-foreground/60 max-w-sm">{fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 border border-secondary rounded-md text-sm hover:bg-secondary/50 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} isLoading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="h-screen" />}>
      <ShopContent />
    </Suspense>
  );
}
