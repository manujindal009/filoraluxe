"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-foreground/40" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-secondary rounded-md leading-5 bg-background focus:outline-none focus:ring-1 focus:ring-rose focus:border-rose sm:text-sm transition-colors"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
