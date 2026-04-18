"use client";

import React, { useState, useEffect } from "react";
import { fetchCategories } from "@/lib/api/categories";
import { motion, AnimatePresence } from "framer-motion";
import { categories as staticCategories } from "@/lib/data/categories";
import { Category } from "@/types";
import { Filter, X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedSubcategory?: string | null;
  onSelectSubcategory?: (subcategory: string | null) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function FilterSidebar({
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  isOpen,
  setIsOpen,
  sortBy,
  setSortBy
}: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        if (data.length > 0) {
          setCategories(data);
        }
      } catch (error) {
        console.error("[FilterSidebar] Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  const toggleExpand = (slug: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  const content = (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between md:hidden">
        <h3 className="font-serif font-semibold text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-foreground/50 hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <h4 className="font-medium mb-4 text-sm tracking-wider uppercase text-foreground/60">Categories</h4>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => {
                onSelectCategory(null);
                if (onSelectSubcategory) onSelectSubcategory(null);
              }}
              className={cn(
                "text-sm transition-colors text-left w-full",
                selectedCategory === null ? "text-rose font-medium" : "text-foreground hover:text-rose"
              )}
            >
              All Products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id} className="space-y-2">
              <div className="flex items-center justify-between group">
                <button
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    if (onSelectSubcategory) onSelectSubcategory(null);
                  }}
                  className={cn(
                    "text-sm transition-colors text-left flex-1",
                    selectedCategory === cat.slug ? "text-rose font-medium" : "text-foreground hover:text-rose"
                  )}
                >
                  {cat.name}
                </button>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <button 
                    onClick={() => toggleExpand(cat.slug)}
                    className="p-1 text-foreground/40 hover:text-foreground/80 transition-colors"
                  >
                    {expandedCategories[cat.slug] || selectedCategory === cat.slug ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              
              {(expandedCategories[cat.slug] || selectedCategory === cat.slug) && cat.subcategories && cat.subcategories.length > 0 && (
                <ul className="pl-4 space-y-2 border-l border-secondary ml-1 py-1">
                  {cat.subcategories
                    .filter(sub => sub.slug !== 'gift-keychains')
                    .map((sub) => (
                    <li key={sub.id}>
                      <button
                        onClick={() => {
                          onSelectCategory(cat.slug);
                          if (onSelectSubcategory) onSelectSubcategory(sub.slug);
                        }}
                        className={cn(
                          "text-xs transition-colors text-left w-full",
                          selectedSubcategory === sub.slug ? "text-rose font-medium" : "text-foreground/60 hover:text-rose"
                        )}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6 border-t border-secondary">
        <h4 className="font-medium mb-4 text-sm tracking-wider uppercase text-foreground/60">Sort By</h4>
        <ul className="space-y-3">
          {[
            { value: "featured", label: "Featured" },
            { value: "newest", label: "Newest Arrivals" },
            { value: "price-asc", label: "Price: Low to High" },
            { value: "price-desc", label: "Price: High to Low" },
          ].map((option) => (
            <li key={option.value}>
              <button
                onClick={() => setSortBy(option.value)}
                className={cn(
                  "text-sm transition-colors text-left w-full",
                  sortBy === option.value ? "text-rose font-medium" : "text-foreground hover:text-rose"
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 flex-shrink-0 pr-10 border-r border-secondary/50">
        <div className="sticky top-28">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 left-0 w-[300px] bg-white shadow-2xl p-6 overflow-y-auto flex flex-col"
          >
            {content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
