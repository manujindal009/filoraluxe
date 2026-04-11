"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="aspect-[4/5] bg-secondary rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="flex flex-col md:flex-row-reverse gap-4">
      {/* Main Image */}
      <div className="flex-1 relative aspect-[4/5] md:aspect-auto md:h-[600px] rounded-xl overflow-hidden bg-secondary">
        <img 
          src={images[activeIndex]} 
          alt={`Product image ${activeIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-500" 
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 flex-shrink-0 hide-scrollbar border-secondary pb-2 md:pb-0">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "w-20 h-24 md:w-full md:h-28 rounded-lg overflow-hidden flex-shrink-0 transition-all",
                activeIndex === index 
                  ? "ring-2 ring-rose opacity-100" 
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
