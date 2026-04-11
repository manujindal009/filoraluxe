import React from "react";
import Link from "next/link";
import { categories } from "@/lib/data/categories";

export function CategoriesSection() {
  return (
    <section className="py-20 bg-primary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-foreground/70">
            Explore our diverse range of carefully crafted crochet items, designed to add a touch of warmth to every aspect of your life.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.slice(0, 10).map((category) => (
            <Link 
              key={category.id} 
              href={`/shop?category=${category.slug}`}
              className="group relative h-[280px] md:h-[350px] rounded-xl overflow-hidden block"
            >
              <img 
                src={category.image} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col items-center text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-lg md:text-xl font-serif font-medium text-white mb-1 md:mb-2">
                  {category.name}
                </h3>
                <span className="text-white/80 text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 border-b border-white/50 pb-1">
                  Explore
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
