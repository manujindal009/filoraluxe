import React from "react";
import { notFound } from "next/navigation";
import { fetchProductById } from "@/lib/api/products";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ReviewsSection } from "@/components/product/ReviewsSection";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await fetchProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <ImageGallery images={product.images} />
        </div>
        <div>
          <ProductInfo product={product} />
        </div>
      </div>
      
      <ReviewsSection productId={product.id} />
    </div>
  );
}
